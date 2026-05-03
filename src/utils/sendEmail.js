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