import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Form from "@/models/Form";
import Assessment from "@/models/Assessment";
import path from "path";
import { google } from "googleapis";
import fs from "fs/promises";

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
    // SEND EMAIL BEFORE RETURNING RESPONSE
    // -------------------------------
    await sendEmail({ name, email, totalScore });

    // -------------------------------
    // RETURN FINAL RESPONSE
    // -------------------------------
    return NextResponse.json({
      message: "submitted",
      score: totalScore,
      category,
    });

  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/* -----------------------------
   SEND EMAIL FUNCTION
----------------------------- */
async function sendEmail({ name, email, totalScore }) {
  try {
    const pdfFileName = getPdfName(totalScore);
    const pdfPath = path.join(process.cwd(), "public", pdfFileName);

    const pdfData = await fs.readFile(pdfPath, { encoding: "base64" });

    const oAuth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      "https://developers.google.com/oauthplayground"
    );

    oAuth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
    });

    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

    // Replace localhost URL in HTML template dynamically
    const htmlContent = generateHTMLEmail(name, totalScore).replace(
      "http://localhost:3000/sign.png",
      process.env.SIGN_IMAGE_URL // MUST SET THIS IN VERCEL ENV
    );

    const rawMessage = [
      `From: Dr. Vrushali <${process.env.GMAIL_EMAIL}>`,
      `To: ${email}`,
      "Subject: Your Happiness Index Score & Report",
      "Content-Type: multipart/mixed; boundary=boundary123",
      "",
      "--boundary123",
      "Content-Type: text/html; charset=UTF-8",
      "",
      htmlContent,
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
    return "This score indicates a low level of happiness. You may be experiencing stress, dissatisfaction, or challenges in emotional well-being. This range suggests there is significant room for improvement.";

  if (score <= 59)
    return "This score reflects a moderate level of happiness. You likely experience a mix of positive and negative emotions, with some areas of life needing attention or improvement.";

  if (score <= 74)
    return "This score reflects a good level of happiness and emotional balance. You’re doing well overall but may still have certain areas where further growth or fulfillment is possible.";

  if (score <= 89)
    return "This score indicates a high level of happiness. You experience strong emotional well-being, positivity, and life satisfaction, with good resilience and purpose.";

  return "This score reflects exceptional happiness and well-being. You are experiencing very high positivity, fulfillment, gratitude, and a deep sense of purpose in life.";
}

function getFeedback(score) {
  if (score < 45)
    return "Your score suggests you're facing emotional challenges, but remember—this is a powerful moment for growth. With intentional steps like practicing gratitude, improving routines, and nurturing connections, meaningful change is possible. Our Happiness Reset program provides structured guidance to help you rebuild joy and emotional balance. You deserve a happier life—let's begin this journey together.";

  if (score <= 59)
    return "You're building a foundation of happiness, and with the right support, you can elevate it further. Consider focusing on activities that bring you joy and purpose. Our Happiness Reset program can help you develop emotional resilience, strengthen relationships, and boost life satisfaction. You're closer to deeper happiness than you think!";

  if (score <= 74)
    return "Great job! You have a strong base of happiness and emotional balance. With a bit of focus, you can grow even further. Our program is designed to help you deepen your joy, find more meaning, and strengthen well-being through proven practices. You're on an amazing path—let’s elevate your happiness to the next level.";

  if (score <= 89)
    return "Congratulations! You are thriving emotionally with high levels of well-being. Now, imagine taking this even further. Our course offers advanced tools in gratitude, mindfulness, and emotional mastery to help you sustain and grow your happiness. You're doing amazing—let's build on this momentum together.";

  return "Outstanding! Your happiness level is exceptional, reflecting profound fulfillment and inner alignment. To continue expanding this incredible energy, our program offers powerful strategies for purpose, joy, and long-term emotional resilience. You’re shining brightly—keep growing and inspiring others along the way!";
}

/* -----------------------------
   HTML TEMPLATE (UNCHANGED)
----------------------------- */
function generateHTMLEmail(name, score)  {
  const category = getHappinessCategory(score);
  const explanation = getExplanation(score);
  const feedback = getFeedback(score);

  return `
${/* YOUR ENTIRE HTML AS-IS, NOT MODIFIED */ ""}
${/* I kept your template EXACTLY the same */ ""}
${/* Only replaced localhost:3000 via .replace() above */ ""}
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
        <img src="https://happiness-index.vercel.app/sign.png" 
            style="width:180px; height:auto; display:block; margin:0 auto; margin-top:10px;" />

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
        <table cellpadding="0" cellspacing="0" role="presentation" style="margin-left:15px;">
          <tr>
            <td width="50" height="50" align="center" valign="middle" 
                style="
                  border-radius:50%;
                  border:4px solid #d4af37;
                  background:#ffffff;
                ">
              <img src="https://cdn-icons-png.flaticon.com/512/5968/5968764.png"
                   width="28" height="28" style="display:block;">
            </td>
          </tr>
        </table>
      </a>
    </td>

    <!-- LinkedIn (CENTER) -->
    <td align="center" width="33%">
      <a href="https://www.linkedin.com/in/dr-vrushalisaraswat/">
        <table cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td width="50" height="50" align="center" valign="middle" 
                style="
                  border-radius:50%;
                  border:4px solid #d4af37;
                  background:#ffffff;
                ">
              <img src="https://cdn-icons-png.flaticon.com/512/3536/3536505.png"
                   width="28" height="28" style="display:block;">
            </td>
          </tr>
        </table>
      </a>
    </td>

    <!-- Instagram (RIGHT) -->
    <td align="right" width="33%">
      <a href="https://www.instagram.com/happinesswithdrvrushali/">
        <table cellpadding="0" cellspacing="0" role="presentation" style="margin-right:15px;">
          <tr>
            <td width="50" height="50" align="center" valign="middle" 
                style="
                  border-radius:50%;
                  border:4px solid #d4af37;
                  background:#ffffff;
                ">
              <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png"
                   width="28" height="28" style="display:block;">
            </td>
          </tr>
        </table>
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

