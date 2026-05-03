import { Resend } from "resend";
import { config } from "../config/config.js";

const resendClient = new Resend(config.RESEND_API_KEY);

export async function sendEmail({ to, subject, html }) {
    return await resendClient.emails.send({
        from: "onboarding@resend.dev",
        to,
        subject,
        html,
    });
}

// import nodemailer from 'nodemailer';

// const transporter = nodemailer.createTransport({
//   host: 'smtp.gmail.com',
//   port: 465,
//   secure: true,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// export async function sendEmail({ to, subject, html }) {
//   const mailOptions = {
//     from: `"Smart Response" <${process.env.EMAIL_USER}>`,
//     to,
//     subject,
//     html,
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     return { success: true, messageId: info.messageId };
//   } catch (error) {
//     console.error('[Mail Error]', error.message);
//     return { success: false, error: error.message };
//   }
// }
