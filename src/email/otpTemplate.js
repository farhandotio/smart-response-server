export function otpTemplate(username, otp) {
    return `
  <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:40px 0;">
    <div style="max-width:500px;margin:auto;background:#ffffff;border-radius:10px;padding:30px;text-align:center;box-shadow:0 4px 12px rgba(0,0,0,0.1);">

      <h2 style="color:#333;">Welcome to SnapSphere</h2>

      <p style="color:#555;font-size:15px;">
        Hi <strong>${username}</strong>, <br><br>
        Thanks for signing up. Please use the OTP below to verify your email address.
      </p>

      <div style="margin:30px 0;">
        <span style="
          font-size:28px;
          letter-spacing:6px;
          font-weight:bold;
          color:#111;
          background:#f1f3f5;
          padding:12px 20px;
          border-radius:6px;
          display:inline-block;
        ">
          ${otp}
        </span>
      </div>

      <p style="color:#777;font-size:14px;">
        This OTP will expire in <strong>5 minutes</strong>.
      </p>

      <p style="color:#999;font-size:13px;margin-top:30px;">
        If you didn't request this email, you can safely ignore it.
      </p>

      <hr style="margin:30px 0;border:none;border-top:1px solid #eee">

      <p style="font-size:12px;color:#aaa;">
        © ${new Date().getFullYear()} SnapSphere. All rights reserved.
      </p>

    </div>
  </div>
  `;
}