import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

/**
 * Sends an invitation email.
 * In development/testing, it saves the email as an HTML file in /tmp/ClearQ/emails/
 */
export async function sendInviteEmail(email: string, code: string, organizationName: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const inviteUrl = `${appUrl}/register?code=${code}&email=${encodeURIComponent(email)}`;

  const subject = `You've been invited to join ${organizationName} on ClearQ`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
          .header { text-align: center; margin-bottom: 30px; }
          .button { display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; }
          .code { font-family: monospace; background: #f4f4f4; padding: 5px 10px; border-radius: 4px; font-size: 1.2em; letter-spacing: 2px; }
          .footer { margin-top: 40px; font-size: 0.8em; color: #777; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ClearQ</h1>
          </div>
          <p>Hello,</p>
          <p>You have been invited to join the <strong>${organizationName}</strong> team on ClearQ.</p>
          <p>Click the button below to accept your invitation and create your account:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${inviteUrl}" class="button">Accept Invitation</a>
          </p>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #6366f1;">${inviteUrl}</p>
          <p>Or use your invite code during registration: <span class="code">${code}</span></p>
          <div class="footer">
            <p>&copy; 2026 ClearQ. Professional support for growing teams.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  // For testing/dev, save to filesystem
  const outboxDir = "/tmp/ClearQ/emails";
  
  if (!fs.existsSync(outboxDir)) {
    fs.mkdirSync(outboxDir, { recursive: true });
  }

  const filename = `${Date.now()}-${uuidv4().substring(0, 8)}.html`;
  const filePath = path.join(outboxDir, filename);

  fs.writeFileSync(filePath, `<!-- Subject: ${subject} -->\n<!-- To: ${email} -->\n${htmlContent}`);

  console.log(`[MAILER] Invitation sent to ${email}. Mock email saved to: ${filePath}`);
  
  return { success: true, filePath };
}

/**
 * Sends a 2FA OTP email.
 */
export async function send2FAEmail(email: string, code: string) {
  const subject = `Your ClearQ verification code`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
          .header { text-align: center; margin-bottom: 30px; }
          .code { font-family: monospace; background: #f4f4f4; padding: 10px 20px; border-radius: 4px; font-size: 2em; letter-spacing: 5px; font-weight: bold; display: inline-block;}
          .footer { margin-top: 40px; font-size: 0.8em; color: #777; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ClearQ</h1>
          </div>
          <p>Hello,</p>
          <p>Please use the following verification code to complete your login. This code will expire in 10 minutes.</p>
          <p style="text-align: center; margin: 30px 0;">
            <span class="code">${code}</span>
          </p>
          <div class="footer">
            <p>&copy; 2026 ClearQ. Professional support for growing teams.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  // For testing/dev, save to filesystem
  const outboxDir = "/tmp/ClearQ/emails";
  
  if (!fs.existsSync(outboxDir)) {
    fs.mkdirSync(outboxDir, { recursive: true });
  }

  const filename = `${Date.now()}-${uuidv4().substring(0, 8)}.html`;
  const filePath = path.join(outboxDir, filename);

  fs.writeFileSync(filePath, `<!-- Subject: ${subject} -->\n<!-- To: ${email} -->\n${htmlContent}`);

  console.log(`[MAILER] 2FA OTP sent to ${email}. Mock email saved to: ${filePath}`);
  
  return { success: true, filePath };
}
