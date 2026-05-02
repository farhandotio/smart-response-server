export function welcomeTemplate(username) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to SIRP</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #000000; color: #ffffff;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #000000;">
      <tr>
        <td align="center" style="padding: 40px 20px;">
          <table role="presentation" width="100%" style="max-width: 520px; background-color: #111111; border-radius: 16px; border: 1px solid #222222; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
            <!-- Hero Header -->
            <tr>
              <td align="center" style="background: linear-gradient(135deg, #ff4d00 0%, #ff8c00 100%); padding: 60px 40px;">
                <img src="https://img.icons8.com/ios-filled/100/ffffff/checked-shield.png" width="60" height="60" style="margin-bottom: 20px;" alt="Success">
                <h1 style="margin: 0; font-size: 32px; font-weight: 800; color: #ffffff; letter-spacing: -0.03em;">Welcome to SIRP</h1>
              </td>
            </tr>
            <!-- Content -->
            <tr>
              <td style="padding: 40px;">
                <p style="margin: 0 0 20px; font-size: 18px; color: #ffffff; font-weight: 600;">
                  Hi ${username},
                </p>
                <p style="margin: 0 0 24px; font-size: 16px; color: #a0a0a0; line-height: 1.6;">
                  We're excited to have you on board! Your account has been verified and you're now ready to master your incident response with AI-powered intelligence.
                </p>
                <div style="background-color: #1a1a1a; border-radius: 12px; border-left: 4px solid #ff4d00; padding: 24px; margin-bottom: 30px;">
                  <p style="margin: 0; font-size: 15px; color: #e0e0e0; line-height: 1.5;">
                    "Reliability is the foundation of trust. We're here to help you build it."
                  </p>
                </div>
                <div align="center">
                  <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" style="background-color: #ffffff; color: #000000; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block;">Go to Dashboard</a>
                </div>
              </td>
            </tr>
            <!-- Bottom Info -->
            <tr>
              <td style="padding: 0 40px 40px; text-align: center;">
                <p style="margin: 0; font-size: 13px; color: #555555;">
                  If you have any questions, feel free to reply to this email or visit our documentation.
                </p>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="padding: 24px 40px; border-top: 1px solid #222222; background-color: #080808; text-align: center;">
                <p style="margin: 0; font-size: 12px; color: #444444;">
                  © ${new Date().getFullYear()} SIRP Inc. 123 Tech Way, SF.
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
}
