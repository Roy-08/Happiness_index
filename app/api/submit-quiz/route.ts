import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function POST(req: Request) {
  try {
    const { name, email, mobile, dob, gender, country, occupation, totalScore, answers, language } = await req.json();

    if (!email || !name) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    // Determine category based on score
    const category = getCategory(totalScore);

    // Send email with PDF link and certificate page link
    let mailStatus = "Sent";
    try {
      await sendEmail({ name, email, totalScore, category });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      mailStatus = "Failed";
    }

    // Save to Google Sheets
    try {
      await saveToGoogleSheets({
        name,
        email,
        mobile,
        dob,
        gender,
        country,
        occupation,
        totalScore,
        category,
        mailStatus,
        language: language || 'english'
      });
    } catch (sheetError) {
      console.error("Google Sheets save failed:", sheetError);
    }

    return NextResponse.json({
      message: "Quiz submitted successfully",
      score: totalScore,
      category,
      mailStatus
    });

  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/* -----------------------------
   CATEGORY HELPER
----------------------------- */
function getCategory(score: number): string {
  if (score < 45) return "Seeker";
  if (score <= 59) return "Creator";
  if (score <= 74) return "Innovator";
  if (score <= 89) return "Prodigy";
  return "Luminary";
}

function getPdfName(score: number): string {
  if (score < 45) return "Seeker.pdf";
  if (score <= 59) return "Creator.pdf";
  if (score <= 74) return "Innovator.pdf";
  if (score <= 89) return "Prodigy.pdf";
  return "Luminary.pdf";
}

console.log("📧 Gmail ENV check:", {
  clientId: !!process.env.GMAIL_CLIENT_ID,
  clientSecret: !!process.env.GMAIL_CLIENT_SECRET,
  refreshToken: !!process.env.GMAIL_REFRESH_TOKEN,
  fromEmail: !!process.env.GMAIL_EMAIL,
});

async function sendEmail({ 
  name, 
  email, 
  totalScore, 
  category
}: { 
  name: string; 
  email: string; 
  totalScore: number; 
  category: string;
}) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const pdfFileName = getPdfName(totalScore);
    const pdfUrl = `${baseUrl}/${pdfFileName}`;
    
    // Certificate page URL with name and date as query parameters
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
    const certificateUrl = `${baseUrl}/certificate?name=${encodeURIComponent(name)}&date=${encodeURIComponent(formattedDate)}`;

    const oAuth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      "https://developers.google.com/oauthplayground"
    );

    oAuth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
    });

    try {
      const token = await oAuth2Client.getAccessToken();
      console.log("🔑 Gmail access token generated:", !!token?.token);
    } catch (tokenErr) {
      console.error("❌ Failed to get Gmail access token:", tokenErr);
    }

    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

    const htmlContent = generateHTMLEmail(name, totalScore, category, pdfUrl, certificateUrl);

    const rawMessage = [
      `From: Dr. Vrushali <${process.env.GMAIL_EMAIL}>`,
      `To: ${email}`,
      "Subject: Your Happiness Index Score & Report",
      "Content-Type: text/html; charset=UTF-8",
      "",
      htmlContent,
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

    console.log("✅ Email sent to:", email);
  } catch (err) {
    console.error("❌ Email failed:", err);
    throw err;
  }
}

async function saveToGoogleSheets(data: {
  name: string;
  email: string;
  mobile: string;
  dob: string;
  gender: string;
  country: string;
  occupation: string;
  totalScore: number;
  category: string;
  mailStatus: string;
  language: string;
}) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const range = "Test_Data!A:K";

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            data.name,
            data.email,
            data.mobile,
            data.dob,
            data.gender,
            data.country,
            data.occupation,
            data.totalScore,
            data.category,
            data.mailStatus,
            data.language,
          ],
        ],
      },
    });
    console.log("✅ Data saved to Google Sheets");
  } catch (err) {
    console.error("❌ Google Sheets error:", err);
    throw err;
  }
}

function getHappinessCategory(score: number): string {
  if (score < 45) return "Seeker";
  if (score <= 59) return "Creator";
  if (score <= 74) return "Innovator";
  if (score <= 89) return "Prodigy";
  return "Luminary";
}

function generateHTMLEmail(
  name: string, 
  score: number, 
  category: string, 
  pdfUrl: string,
  certificateUrl: string
): string {
  const happinessCategory = getHappinessCategory(score);

  return `
  <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <!--[if gte mso 9]>
  <xml>
    <o:OfficeDocumentSettings>
      <o:AllowPNG/>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
  </xml>
  <![endif]-->
  <!--[if mso]>
  <style type="text/css">
    body, table, td, p, a, span, div {
      font-family: Arial, Helvetica, sans-serif !important;
    }
    .button-td {
      background-color: #1b6b36 !important;
    }
    .button-a {
      background-color: #1b6b36 !important;
      color: #ffffff !important;
    }
  </style>
  <![endif]-->
  <style type="text/css">
    /* Reset styles */
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
    }
    /* Prevent dark mode color changes */
    [data-ogsc] body,
    [data-ogsb] body {
      background-color: #fffbea !important;
    }
    [data-ogsc] .email-bg,
    [data-ogsb] .email-bg {
      background-color: #fffbea !important;
    }
    [data-ogsc] .content-bg,
    [data-ogsb] .content-bg {
      background-color: #ffffff !important;
    }
    [data-ogsc] .header-bg,
    [data-ogsb] .header-bg {
      background-color: #fff9d9 !important;
    }
    [data-ogsc] .button-td,
    [data-ogsb] .button-td {
      background-color: #1b6b36 !important;
    }
    [data-ogsc] .button-a,
    [data-ogsb] .button-a {
      color: #ffffff !important;
    }
    [data-ogsc] .text-dark,
    [data-ogsb] .text-dark {
      color: #355a41 !important;
    }
    [data-ogsc] .text-green,
    [data-ogsb] .text-green {
      color: #1b6b36 !important;
    }
    [data-ogsc] .text-gray,
    [data-ogsb] .text-gray {
      color: #666666 !important;
    }
    [data-ogsc] .link-green,
    [data-ogsb] .link-green {
      color: #1b6b36 !important;
    }
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        min-width: 100% !important;
      }
      .mobile-padding {
        padding: 20px !important;
      }
      .mobile-padding-small {
        padding: 12px 15px !important;
      }
      .mobile-text-center {
        text-align: center !important;
      }
      .mobile-font-small {
        font-size: 13px !important;
      }
      .mobile-heading {
        font-size: 24px !important;
      }
      .mobile-subheading {
        font-size: 14px !important;
      }
      .mobile-divider {
        width: 100% !important;
      }
      .mobile-header {
        font-size: 11px !important;
        letter-spacing: 1.5px !important;
        padding: 12px 15px !important;
      }
      .mobile-welcome {
        font-size: 10px !important;
        letter-spacing: 2px !important;
      }
      .mobile-subtitle {
        font-size: 14px !important;
        max-width: 280px !important;
        margin-left: auto !important;
        margin-right: auto !important;
        word-wrap: break-word !important;
      }
      .mobile-button {
        padding: 10px 20px !important;
        font-size: 12px !important;
      }
      .social-icon-cell {
        padding: 0 8px !important;
      }
    }
  </style>
</head>

<body style="margin:0; padding:0; background-color:#fffbea; font-family:Arial, Helvetica, sans-serif; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%;" class="email-bg">

<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background-color:#fffbea;" class="email-bg" bgcolor="#fffbea">
  <tr>
    <td align="center" style="padding:40px 10px;">
      
      <table class="email-container content-bg" width="600" cellpadding="0" cellspacing="0" border="0" role="presentation" style="
        max-width:600px;
        width:100%;
        background-color:#ffffff;
        border-radius:30px;
        overflow:hidden;
        box-shadow:0 20px 60px rgba(0,0,0,0.08);
        border:1px solid #f7f1c6;
      " bgcolor="#ffffff">

        <!-- Header -->
        <tr>
          <td class="mobile-header mobile-padding-small header-bg" style="
            padding:14px 40px;
            font-size:13px;
            letter-spacing:2px;
            color:#2b4d36;
            background-color:#fff9d9;
            border-bottom:1px solid #f5eec2;
            font-weight:600;
            line-height:1.4;
            text-align:center;
            font-family:Arial, Helvetica, sans-serif;
          " bgcolor="#fff9d9">
            
          </td>
        </tr>

        <!-- Title -->
        <tr>
          <td class="mobile-padding content-bg" align="center" style="padding:30px 35px 20px 35px; background-color:#ffffff;" bgcolor="#ffffff">
            <p class="mobile-welcome text-gray" style="font-size:12px; letter-spacing:3px; color:#666666; margin:0 0 8px 0; line-height:1.4; font-family:Arial, Helvetica, sans-serif;">
              WELCOME TO YOUR
            </p>

            <h1 class="mobile-heading text-green" style="
              font-family:Georgia, 'Times New Roman', serif;
              font-size:32px;
              font-weight:700;
              margin:0;
              color:#1b6b36;
              line-height:1.3;
            ">
              Happiness Index Report
            </h1>

            <p class="mobile-subtitle mobile-subheading" style="
              font-size:18px;
              color:#777777;
              margin:10px 0 0 0;
              font-family:Georgia, 'Times New Roman', serif;
              line-height:1.4;
            ">
              Your personalised emotional wellness insights!
            </p>

            <table class="mobile-divider" width="80%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:15px auto 0 auto;">
              <tr>
                <td style="height:2px; background-color:#f2e9b3;" bgcolor="#f2e9b3"></td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td class="mobile-padding content-bg" style="padding:0 45px 22px 45px; color:#355a41; line-height:1.6; font-family:Arial, Helvetica, sans-serif; background-color:#ffffff;" bgcolor="#ffffff">

            <p class="mobile-font-small text-dark" style="font-size:15px; margin:0 0 12px 0; color:#355a41;">
              Dear <strong class="text-green" style="color:#1b6b36;">${name}</strong>,
            </p>

            <p class="mobile-font-small text-dark" style="font-size:14px; color:#3d5a46; margin:0 0 12px 0; line-height:1.6;">
              Thank you for taking the Happiness Index (HI) and reflecting on your emotional well-being.
            </p>

            <p class="mobile-font-small text-dark" style="font-size:14px; color:#2f4e39; margin:0 0 12px 0; line-height:1.6;">
              Your score is
              <strong class="text-green" style="color:#1b6b36; font-size:16px;">${score}</strong>,
              placing you in the
              <strong class="text-green" style="color:#1b6b36;">${happinessCategory}</strong> category.
            </p>

            <p class="mobile-font-small text-dark" style="font-size:14px; color:#3d5a46; margin:0 0 12px 0; line-height:1.6;">
              Please find below your Certificate of Participation as a token of appreciation for your effort.
            </p>

            <p class="mobile-font-small text-dark" style="font-size:14px; color:#3d5a46; margin:0 0 18px 0; line-height:1.6;">
              We hope the insights help you gain clarity and awareness.
            </p>

            <p class="mobile-font-small text-dark" style="font-size:14px; color:#3d5a46; margin:0 0 18px 0; line-height:1.6;">
              If you found this meaningful, we encourage you to share the Happiness Index with people you care about - a small step that can make a real difference.
            </p>

            <!-- View Report Button -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:12px 0 25px 0;">
              <tr>
                <td align="center">
                  <!--[if mso]>
                  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${pdfUrl}" style="height:44px;v-text-anchor:middle;width:180px;" arcsize="50%" strokecolor="#1b6b36" fillcolor="#1b6b36">
                    <w:anchorlock/>
                    <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;">View Report</center>
                  </v:roundrect>
                  <![endif]-->
                  <!--[if !mso]><!-->
                  <table cellpadding="0" cellspacing="0" border="0" role="presentation">
                    <tr>
                      <td align="center" class="button-td" style="
                        border-radius:25px;
                        background-color:#1b6b36;
                        mso-padding-alt:0;
                      " bgcolor="#1b6b36">
                        <a href="${pdfUrl}" target="_blank" class="button-a mobile-button" style="
                          display:inline-block;
                          padding:14px 28px;
                          font-family:Arial, Helvetica, sans-serif;
                          font-size:14px;
                          font-weight:700;
                          color:#ffffff;
                          text-decoration:none;
                          border-radius:25px;
                          letter-spacing:0.3px;
                          white-space:nowrap;
                          background-color:#1b6b36;
                          border:2px solid #1b6b36;
                          mso-padding-alt:0;
                        ">
                          View Report
                        </a>
                      </td>
                    </tr>
                  </table>
                  <!--<![endif]-->
                </td>
              </tr>
            </table>

            <!-- Footer -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-top:1px solid #f7eeb4; padding-top:20px; margin-top:10px;">
              <tr>
                <td align="center" class="content-bg" style="background-color:#ffffff;" bgcolor="#ffffff">

                  <p class="text-gray" style="font-size:15px; color:#666666; margin:0 0 8px 0; line-height:1.4; font-family:Arial, Helvetica, sans-serif;">
                    <strong>Stay Happy, Stay Healthy</strong>
                  </p>

                  <p style="margin:0; font-family:'Brush Script MT','Apple Chancery',cursive; font-size:18px; color:#d4af37; font-weight:700; line-height:1.2;">
                    Dr. Vrushali
                  </p>

                  <p class="text-dark" style="margin:5px 0 15px 0; font-family: 'Comic Sans MS', 'Trebuchet MS', Arial, sans-serif; font-size:18px; color:#2f4e39; line-height:1.3;">
                    Happiness Coach
                  </p>

                  <!-- Social Media Icons -->
                  <table align="center" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:15px;">
                    <tr>

                      <!-- Facebook (LEFT) -->
                      <td align="left" width="33%" class="social-icon-cell" style="padding:0 15px;">
                        <a href="https://www.facebook.com/vrushali.saraswat">
                          <table cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td width="50" height="50" align="center" valign="middle" 
                                  style="
                                    border-radius:50%;
                                    border:4px solid #d4af37;
                                    background-color:#ffffff;
                                  " bgcolor="#ffffff">
                                <img src="https://cdn-icons-png.flaticon.com/512/5968/5968764.png"
                                     width="28" height="28" alt="Facebook" style="display:block;">
                              </td>
                            </tr>
                          </table>
                        </a>
                      </td>

                      <!-- LinkedIn (CENTER) -->
                      <td align="center" width="33%" class="social-icon-cell">
                        <a href="https://www.linkedin.com/in/dr-vrushalisaraswat/">
                          <table cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td width="50" height="50" align="center" valign="middle" 
                                  style="
                                    border-radius:50%;
                                    border:4px solid #d4af37;
                                    background-color:#ffffff;
                                  " bgcolor="#ffffff">
                                <img src="https://cdn-icons-png.flaticon.com/512/3536/3536505.png"
                                     width="28" height="28" alt="LinkedIn" style="display:block;">
                              </td>
                            </tr>
                          </table>
                        </a>
                      </td>

                      <!-- Instagram (RIGHT) -->
                      <td align="right" width="33%" class="social-icon-cell" style="padding:0 15px;">
                        <a href="https://www.instagram.com/happinesswithdrvrushali/">
                          <table cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td width="50" height="50" align="center" valign="middle" 
                                  style="
                                    border-radius:50%;
                                    border:4px solid #d4af37;
                                    background-color:#ffffff;
                                  " bgcolor="#ffffff">
                                <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png"
                                     width="28" height="28" alt="Instagram" style="display:block;">
                              </td>
                            </tr>
                          </table>
                        </a>
                      </td>

                    </tr>
                  </table>

                </td>
              </tr>
            </table>

          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>
</body>
</html>;
`}