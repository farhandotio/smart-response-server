export function inviteTemplate(companyName, inviteLink) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Join ${companyName}</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #000000; color: #ffffff;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #000000;">
      <tr>
        <td align="center" style="padding: 40px 20px;">
          <table role="presentation" width="100%" style="max-width: 500px; background-color: #111111; border-radius: 16px; border: 1px solid #222222; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
            <!-- Header -->
            <tr>
              <td align="center" style="padding: 40px 40px 20px;">
                <div style="background-color: #ff4d00; width: 48px; height: 48px; border-radius: 12px; display: inline-block; margin-bottom: 20px;">
                  <img src="https://img.icons8.com/ios-filled/50/ffffff/collaboration.png" width="24" height="24" style="padding-top: 12px;" alt="Invite">
                </div>
                <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">Team Invitation</h1>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding: 0 40px 40px; text-align: center;">
                <p style="margin: 0 0 24px; font-size: 16px; color: #a0a0a0; line-height: 1.5;">
                  You've been invited to join <strong>${companyName}</strong> as an Engineer on the SIRP platform.
                </p>
                <div align="center" style="margin-bottom: 30px;">
                  <a href="${inviteLink}" style="background-color: #ff4d00; color: #ffffff; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block;">Accept Invitation</a>
                </div>
                <p style="margin: 0; font-size: 13px; color: #555555;">
                  This link will take you to the registration page where you can set up your account.
                </p>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="padding: 24px 40px; border-top: 1px solid #222222; background-color: #080808; text-align: center;">
                <p style="margin: 0; font-size: 12px; color: #444444;">
                  © ${new Date().getFullYear()} SIRP Inc. All rights reserved.
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
