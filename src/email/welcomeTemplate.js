export function welcomeTemplate(username) {
  return `
  <div style="background:#f2f4f7;padding:40px 0;font-family:Arial,Helvetica,sans-serif;">

    <div style="max-width:520px;margin:auto;background:#ffffff;border-radius:10px;
    box-shadow:0 6px 18px rgba(0,0,0,0.06);overflow:hidden;">

      <!-- Header -->
      <div style="padding:24px 30px;border-bottom:1px solid #eee;">
        <h2 style="margin:0;font-size:20px;color:#111;">
          Smart Response - Welcome Aboard!
        </h2>
      </div>

      <!-- Body -->
      <div style="padding:35px 30px;">

        <p style="font-size:15px;color:#444;margin:0 0 15px;">
          Hi <strong>${username}</strong>,
        </p>

        <p style="font-size:15px;color:#555;line-height:1.6;margin-bottom:18px;">
          Welcome to Smart Response - Welcome Aboard!. Your account has been successfully created and
          you're now part of our community.
        </p>

        <p style="font-size:15px;color:#555;line-height:1.6;margin-bottom:25px;">
          You can now start exploring posts, following people and sharing your
          own moments.
        </p>

        <div style="background:#f7f8fa;border:1px solid #eee;border-radius:6px;
        padding:16px;font-size:14px;color:#555;">
          If you did not create this account, please contact support immediately.
        </div>

      </div>

      <!-- Footer -->
      <div style="padding:18px 30px;border-top:1px solid #eee;font-size:12px;color:#888;">
        © ${new Date().getFullYear()} Smart Response - Welcome Aboard!. All rights reserved.
      </div>

    </div>

  </div>
  `;
}
