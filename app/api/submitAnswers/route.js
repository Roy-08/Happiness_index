  import { NextResponse } from "next/server";
  import { connectDB } from "@/lib/db";
  import Form from "@/models/Form";
  import Assessment from "@/models/Assessment";
  import path from "path";
  import { google } from "googleapis";

  export async function POST(req) {
    await connectDB();

    try {
      const { name, email, section, answers } = await req.json();

      if (!email) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
      }

      const form = await Form.findOne();
      if (!form) {
        return NextResponse.json({ error: "Form not found" }, { status: 404 });
      }

      // -------------------------------
      // SCORE CALCULATION
      // -------------------------------
      let totalScore = 0;

      for (const key in answers) {
        const [sectionIndex, questionIndex] = key.split("-");
        const selectedOptionIndex = answers[key];

        const sectionObj = form.sections[sectionIndex];
        if (!sectionObj) continue;

        const questionObj = sectionObj.questions[questionIndex];
        if (!questionObj) continue;

        const optionObj = questionObj.options[selectedOptionIndex];
        if (!optionObj) continue;

        totalScore += optionObj.marks;
      }

      // -------------------------------
      // CATEGORY SELECTION
      // -------------------------------
      const category = getCategory(totalScore);

      // -------------------------------
      // SAVE ASSESSMENT
      // -------------------------------
      const assess = new Assessment({
        name,
        email,
        section,
        answers,
        score: totalScore,
        category,
      });

      await assess.save();

      // -------------------------------
      // SEND API RESPONSE IMMEDIATELY
      // -------------------------------
      const response = NextResponse.json({
        message: "submitted",
        score: totalScore,
        category,
      });

      // -------------------------------
      // BACKGROUND EMAIL SENDING
      // -------------------------------
      (async () => {
        try {
          const pdfFileName = getPdfName(totalScore);
          const pdfPath = path.join(process.cwd(), "public", pdfFileName);

          const fs = await import("fs/promises");
          const pdfData = await fs.readFile(pdfPath, { encoding: "base64" });

          // -------------------------------
          // Gmail OAuth2 Client
          // -------------------------------
          const oAuth2Client = new google.auth.OAuth2(
            process.env.GMAIL_CLIENT_ID,
            process.env.GMAIL_CLIENT_SECRET,
            "https://developers.google.com/oauthplayground" // redirect URI used for refresh token
          );

          oAuth2Client.setCredentials({
            refresh_token: process.env.GMAIL_REFRESH_TOKEN,
          });

          const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

          // -------------------------------
          // BUILD EMAIL CONTENT
          // -------------------------------
          const rawMessage = [
            `From: Dr. Vrushali <${process.env.GMAIL_EMAIL}>`,
            `To: ${email}`,
            "Subject: Your Happiness Index Score & Report",
            "Content-Type: multipart/mixed; boundary=boundary123",
            "",
            "--boundary123",
            "Content-Type: text/html; charset=UTF-8",
            "",
            generateHTMLEmail(name, totalScore),
            "",
            "--boundary123",
            "Content-Type: application/pdf",
            "Content-Transfer-Encoding: base64",
            `Content-Disposition: attachment; filename="${pdfFileName}"`,
            "",
            pdfData,
            "",
            "--boundary123--",
          ].join("\n");

          const encodedMessage = Buffer.from(rawMessage)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");

          await gmail.users.messages.send({
            userId: "me",
            requestBody: { raw: encodedMessage },
          });

          console.log("Email sent to:", email);
        } catch (err) {
          console.error("Email failed:", err);
        }
      })();

      return response;
    } catch (err) {
      console.error("Server error:", err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  }

  /* -----------------------------
    CATEGORY HELPERS
  ----------------------------- */
  function getCategory(score) {
    if (score < 45) return "seeker";
    if (score <= 59) return "creator";
    if (score <= 74) return "innovator";
    if (score <= 89) return "prodigy";
    return "luminary";
  }

  function getPdfName(score) {
    if (score < 45) return "Seeker.pdf";
    if (score <= 59) return "Creator.pdf";
    if (score <= 74) return "Innovator.pdf";
    if (score <= 89) return "Prodigy.pdf";
    return "Luminary.pdf";
  }

  function getHappinessCategory(score) {
    if (score < 45) return "Low Happiness";
    if (score <= 59) return "Moderate Happiness";
    if (score <= 74) return "Good Happiness";
    if (score <= 89) return "High Happiness";
    return "Exceptional Happiness";
  }

  function getExplanation(score) {
    if (score < 45)
      return "This score indicates moderate well-being with room for growth in happiness levels. People in this range may feel content at times but may not consistently experience high levels of satisfaction or purpose.";
    if (score <= 59)
      return " A score in this range suggests a generally positive outlook and a good level of satisfaction. Individuals here may experience both positive and negative emotions regularly, with some areas for potential improvement.";
    if (score <= 74)
      return "This score reflects a high level of satisfaction and balance in life. People in this range often experience positive emotions and fulfillment but may have some areas they’d like to enhance.";
    if (score <= 89)
      return "This score indicates exceptional well-being, with high levels of life satisfaction, positive emotions, a strong sense of purpose, and fulfilling social connections. Individuals in this range tend to feel positive, optimistic, and engaged in meaningful activities consistently.";
    return " A score in this range suggests challenges in achieving a high sense of well-being, with lower levels of satisfaction, positive emotions, or purpose. Individuals here may be facing stress or dissatisfaction across various areas of life.";
  }

  function getFeedback(score) {
    if (score < 45)
      return "Your happiness index indicates you're on the right track, with room to grow even further. This is the perfect moment to make meaningful changes, like embracing daily gratitude and strengthening connections with loved ones. Our Happiness Reset program offers the tools and guidance to elevate your happiness to new heights. Join us and take the next step on your journey to lasting fulfillment!";
    if (score <= 59)
      return "You're on a great path, with a positive outlook and a solid foundation of satisfaction. To take your happiness to the next level, why not dive into areas that truly bring you joy and purpose? Our Happiness Reset program is designed to help you strengthen connections, engage in deeply fulfilling activities, and unlock even greater levels of happiness. Join us to enhance your journey and discover what’s possible!";
    if (score <= 74)
      return "Great job! Your happiness score reflects a strong foundation of well-being and balance. Imagine what you could achieve by building on this further. Our course is designed to help you unlock even more joy and meaning in your life with powerful, proven practices. Join us to deepen your journey, elevate your happiness, and discover new ways to enrich every aspect of your life!";
    if (score <= 89)
      return "Congratulations! Your happiness index is a wonderful achievement, showing a deep sense of well-being and fulfillment. Imagine taking this even further&mdash;our course offers the perfect next step to keep your happiness growing. Through transformative practices like gratitude and mindfulness, you'll gain powerful tools to sustain your joy and inspire others around you. Join us to elevate your happiness journey and make every day even more meaningful";
    return "It sounds like you're navigating some challenges in finding that deeper happiness you deserve. Often, just a few intentional steps can spark transformative change, and our Happiness Reset program is crafted to help you do exactly that. With focused guidance on self-care and strengthening meaningful connections, this program provides a solid foundation to redefine your happiness journey. Join us to unlock the joy and fulfillment waiting for you – because real happiness starts here!";
  }

  /* -----------------------------
    EMAIL TEMPLATE
  ----------------------------- */
  function generateHTMLEmail(name, score) {
    const category = getHappinessCategory(score);
    const explanation = getExplanation(score);
    const feedback = getFeedback(score);

    return `
  <!DOCTYPE html>
  <html>
  <head>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&family=Dancing+Script:wght@400;700&display=swap" rel="stylesheet">
  </head>

  <body style="margin:0; padding:0; background:#fffbea; font-family:'Inter', sans-serif;">

  <div style="
    max-width:800px; 
    margin:50px auto; 
    background:#ffffff;
    border-radius:30px; 
    overflow:hidden;
    box-shadow:0 20px 60px rgba(0,0,0,0.08);
    border:1px solid #f7f1c6;
  ">

    <!-- Header -->
    <div style="
      padding:28px 40px;
      display:flex; 
      justify-content:space-between; 
      font-size:14px; 
      letter-spacing:3px; 
      color:#2b4d36;
      background:linear-gradient(90deg, #fff9d9, #fffef0);
      border-bottom:1px solid #f5eec2;
    ">
      <span style="font-weight:600;">HAPPINESS INDEX REPORT</span>
      <span style="font-weight:500;"> </span>
    </div>

    <!-- Title Section -->
    <div style="text-align:center; padding:60px 35px;">
      <p style="font-size:14px; letter-spacing:4px; color:#666; margin:0;">WELCOME TO YOUR</p>

      <h1 style="
        font-family:'Playfair Display', serif; 
        font-size:50px; 
        font-weight:700; 
        margin:10px 0 0 0; 
        color:#1b6b36;
      ">
        Happiness Assessment Report
      </h1>

      <p style="font-size:18px; color:#777; margin-top:14px;">
        <span style="
          font-family:'Dancing Script', cursive; 
          font-size:26px; 
          color:#2f4e39;
        ">
          Your personalized emotional wellness insights
        </span>
      </p>

      <!-- LINE BELOW INSIGHTS -->
      <div style="
        width:100%;
        height:2px;
        background:#f2e9b3;
        margin-top:22px;
        border-radius:10px;
      "></div>
    </div>

    <!-- Content Section -->
    <div style="padding:45px 45px; line-height:1.5; color:#355a41; text-align:left;">

      <!-- Greeting -->
      <p style="font-size:15px; margin-top:0;">Dear <strong>${name}</strong>,</p>

      <!-- Your Results -->
      <h2 style="
        font-family:'Playfair Display', serif; 
        font-size:20px; 
        margin:25px 0 5px 0; 
        color:#1b6b36;
      ">
        Your Results
      </h2>

      <p style="
        font-size:14px; 
        color:#2f4e39; 
        margin:0 0 10px 0;
      ">
        Your overall score is  
        <strong style="color:#1b6b36; font-size:15px;">${score}</strong>,
        placing you in the 
        <strong style="color:#1b6b36; font-size:15px;">${category}</strong> category.
      </p>

      <!-- Explanation -->
      <h2 style="
        font-family:'Playfair Display', serif; 
        font-size:20px;
        margin-top:25px; 
        color:#1b6b36;
      ">
        Explanation
      </h2>

      <p style="font-size:14px; color:#3d5a46;">
        ${explanation}
      </p>

      <!-- Suggestion -->
      <h2 style="
        font-family:'Playfair Display', serif; 
        font-size:20px; 
        margin-top:25px; 
        color:#1b6b36;
      ">
        Suggestion
      </h2>

      <p style="font-size:14px; color:#3d5a46;">
        ${feedback}
      </p>

      <!-- Footer -->
      <div style="
        margin-top:60px; 
        padding-top:40px; 
        border-top:1px solid #f7eeb4; 
        text-align:center;
      ">
        <p style="font-size:16px; color:#666; margin:0 0 8px 0;">
          <strong>Stay Happy, Stay Healthy</strong>
        </p>

        <!-- SIGNATURE IMAGE -->
        <img src="http://localhost:3000/sign.png" 
            style="width:130px; height:auto; display:block; margin:0 auto; margin-top:10px;" />

        <!-- Happiness Coach -->
        <p style="
          margin-top:5px; 
          font-family:'Dancing Script', cursive; 
          font-size:24px; 
          color:#2f4e39;
        ">
          Happiness Coach
        </p>

  <table align="center" width="100%" cellpadding="0" cellspacing="0" role="presentation">
  <tr>

    <!-- Facebook (LEFT) -->
    <td align="left" width="33%">
      <a href="https://www.facebook.com/vrushali.saraswat">
        <div style="
          width:50px;
          height:50px;
          border-radius:50%;
          border:4px solid #d4af37;
          background:#ffffff;
          text-align:center;
          line-height:55px;
          margin-left:15px;
        ">
          <img src="https://cdn-icons-png.flaticon.com/512/5968/5968764.png"
               width="28" height="28" style="vertical-align:middle;">
        </div>
      </a>
    </td>

    <!-- LinkedIn (CENTER) -->
    <td align="center" width="33%">
      <a href="https://www.linkedin.com/in/dr-vrushalisaraswat/">
        <div style="
          width:50px;
          height:50px;
          border-radius:50%;
          border:4px solid #d4af37;
          background:#ffffff;
          text-align:center;
          line-height:55px;
        ">
          <img src="https://cdn-icons-png.flaticon.com/512/3536/3536505.png"
               width="28" height="28" style="vertical-align:middle;">
        </div>
      </a>
    </td>

    <!-- Instagram (RIGHT) -->
    <td align="right" width="33%">
      <a href="https://www.instagram.com/happinesswithdrvrushali/">
        <div style="
          width:50px;
          height:50px;
          border-radius:50%;
          border:4px solid #d4af37;
          background:#ffffff;
          text-align:center;
          line-height:55px;
          margin-right:15px;
        ">
          <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png"
               width="28" height="28" style="vertical-align:middle;">
        </div>
      </a>
    </td>

  </tr>
</table>





      </div>

    </div>

  </div>

  </body>
  </html>



    `;
  }
