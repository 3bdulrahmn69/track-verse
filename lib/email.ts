import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendOTPEmailParams {
  to: string;
  otp: string;
  type: 'verification' | 'reset';
}

export async function sendOTPEmail({ to, otp, type }: SendOTPEmailParams) {
  const subject =
    type === 'verification'
      ? 'Verify Your Track Verse Email'
      : 'Reset Your Track Verse Password';

  const message =
    type === 'verification'
      ? `Welcome to Track Verse! Your verification code is`
      : `Your password reset code is`;

  try {
    await transporter.sendMail({
      from: `"Track Verse" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${subject}</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #fafafa;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="padding: 40px 0;">
                  <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="padding: 40px 40px 20px 40px; text-align: center;">
                        <h1 style="margin: 0; color: #ea580c; font-size: 32px; font-weight: bold;">Track Verse</h1>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 20px 40px;">
                        <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px; font-weight: 600;">
                          ${
                            type === 'verification'
                              ? 'Verify Your Email'
                              : 'Reset Your Password'
                          }
                        </h2>
                        <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 16px; line-height: 24px;">
                          ${message}
                        </p>
                        
                        <!-- OTP Box -->
                        <div style="background-color: #f3f4f6; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
                          <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #ea580c; font-family: 'Courier New', monospace;">
                            ${otp}
                          </div>
                        </div>
                        
                        <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px; line-height: 20px;">
                          This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="padding: 20px 40px 40px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                          © ${new Date().getFullYear()} Track Verse. All rights reserved.
                        </p>
                        <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px;">
                          Track your favorite movies, TV shows, books, and games.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

// Generate a 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
