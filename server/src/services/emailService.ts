import nodemailer from "nodemailer";

/*
|--------------------------------------------------------------------------
| AURA EMAIL SERVICE
|--------------------------------------------------------------------------
| Handles outbound luxury transactional emails including OTP verification.
| Reads SMTP configuration from environment variables.
|--------------------------------------------------------------------------
*/

interface SendEmailResult {
  sent: boolean;
  messageId?: string;
  error?: string;
}

const getTransporter = () => {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
};

/**
 * Sends a 6-digit account verification code via email.
 */
export const sendVerificationCodeEmail = async (
  toEmail: string,
  firstName: string,
  code: string
): Promise<SendEmailResult> => {
  const transporter = getTransporter();
  const fromAddress =
    process.env.SMTP_FROM ||
    `"AURA Haute Beauté" <${process.env.SMTP_USER || "no-reply@auracosmetics.com"}>`;

  // Always log to server console for developer convenience / local testing
  console.log(
    `\n👑 [AURA EMAIL SERVICE] ----------------------------------------------------` +
      `\n   Recipient: ${toEmail} (${firstName})` +
      `\n   Verification Code (OTP): [ ${code} ]` +
      `\n   Expires: In 15 minutes` +
      `\n----------------------------------------------------------------------------\n`
  );

  if (!transporter) {
    console.warn(
      `⚠️ [AURA EMAIL SERVICE] SMTP credentials (SMTP_USER / SMTP_PASS) not configured in server/.env. ` +
        `Code logged to console above for immediate testing.`
    );
    return {
      sent: false,
      error: "SMTP credentials not configured in server .env",
    };
  }

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AURA Account Verification</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #211A1C;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF8F5; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #FFFCFA; border-radius: 24px; border: 1px solid #F0DFD8; box-shadow: 0 10px 30px rgba(0,0,0,0.05); overflow: hidden;">
          <!-- Gold Accent Bar -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #D4AF37, #B87D4B, #9E6536);"></td>
          </tr>
          
          <!-- Header -->
          <tr>
            <td style="padding: 36px 36px 20px 36px; text-align: center;">
              <div style="display: inline-block; width: 44px; height: 44px; border-radius: 50%; background-color: #F7EFE9; border: 1px solid rgba(184, 125, 75, 0.4); text-align: center; line-height: 44px; margin-bottom: 12px; font-size: 20px; color: #B87D4B;">
                ✦
              </div>
              <h1 style="margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-weight: normal; letter-spacing: 0.1em; color: #211A1C;">
                AURA
              </h1>
              <p style="margin: 4px 0 0 0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.22em; color: #8F6B00; font-weight: 600;">
                Haute Beauté • Mindful Formulations
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 10px 36px 30px 36px;">
              <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 20px; font-weight: normal; color: #211A1C; margin: 0 0 14px 0;">
                Verify Your Account
              </h2>
              <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #574F52;">
                Hello <strong>${firstName}</strong>,
              </p>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #574F52;">
                Thank you for joining AURA. To complete your registration and activate your personal beauty atelier account, please enter the following 6-digit verification code:
              </p>

              <!-- OTP Code Display Box -->
              <div style="background-color: #FFF9F5; border: 1.5px dashed #D4AF37; border-radius: 16px; padding: 24px 16px; text-align: center; margin: 24px 0;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: bold; letter-spacing: 12px; color: #9E6536; display: inline-block; padding-left: 12px;">
                  ${code}
                </span>
                <p style="margin: 10px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #8F6B00; font-weight: 600;">
                  Valid for 15 minutes
                </p>
              </div>

              <p style="margin: 0 0 12px 0; font-size: 12px; line-height: 1.5; color: #756D70;">
                If you did not initiate this account creation at AURA, you may safely ignore this message.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px; background-color: #FFF9F5; border-top: 1px solid #F0DFD8; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 11px; color: #8F6B00; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;">
                AURA Haute Beauté Atelier
              </p>
              <p style="margin: 0; font-size: 11px; color: #A89FA2;">
                Island-wide Concierge • Verified Formulations
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to: toEmail,
      subject: `Your AURA Verification Code: ${code}`,
      html: htmlContent,
      text: `Your AURA verification code is: ${code}. This code will expire in 15 minutes.`,
    });

    console.log(`✅ [AURA EMAIL SERVICE] Verification email sent to ${toEmail}. MessageId: ${info.messageId}`);
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`❌ [AURA EMAIL SERVICE] Failed to send email to ${toEmail}:`, errorMsg);
    return { sent: false, error: errorMsg };
  }
};
