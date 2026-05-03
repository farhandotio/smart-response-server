import { Resend } from 'resend';
import { config } from '../config/config.js';

const resendClient = new Resend(config.RESEND_API_KEY);

export async function sendEmail({ to, subject, html }) {
  try {
    const response = await resendClient.emails.send({
      from: 'Smart Response <hello@smarterresponse.xyz>',
      replyTo: 'support@smarterresponse.xyz>',
      to,
      subject,
      html,
    });

    return response;
  } catch (error) {
    console.error('Email send failed:', error);
    throw error;
  }
}
