import { Resend } from "resend";

export async function sendEmail({ to, subject, html }) {
    await resend.emails.send({
        from: "onboarding@resend.dev", 
        to: email,
        subject: "Your OTP Code",
        html: `<h2>Your OTP is: ${otp}</h2>`
    });
}