import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';
import { z } from 'zod';

const sendgridApiKey = process.env.SENDGRID_API_KEY;
const senderEmail = process.env.SENDER_EMAIL; // e.g., 'noreply@yourdomain.com'

sgMail.setApiKey(sendgridApiKey!);

const EmailSchema = z.object({
  to: z.string().email(),
  inviteLink: z.string().url(),
});

export async function POST(req: Request) {
  try {
    if (!sendgridApiKey || !senderEmail) {
      console.error('SendGrid API key or sender email is not configured.');
      return NextResponse.json({ success: false, error: 'Email service not configured.' }, { status: 500 });
    }

    const body = await req.json();
    const parsed = EmailSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid input parameters.' }, { status: 400 });
    }

    const { to, inviteLink } = parsed.data;

    const msg = {
      to: to,
      from: senderEmail!,
      subject: 'You\'ve been invited to join a team on FlowBank!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #f8f8f8; padding: 20px; text-align: center; border-bottom: 1px solid #e0e0e0;">
            <h1 style="color: #333; margin: 0;">FlowBank</h1>
            <p style="color: #666; font-size: 14px;">Financial Flow, Simplified</p>
          </div>
          <div style="padding: 20px; line-height: 1.6;">
            <h2 style="color: #333; margin-top: 0;">Team Invitation</h2>
            <p>You've been invited to join a team on FlowBank. Collaborate and manage finances together!</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${inviteLink}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px;">Accept Invitation</a>
            </p>
            <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
            <p><a href="${inviteLink}" style="word-break: break-all;">${inviteLink}</a></p>
            <p>If you did not expect this invitation, please ignore this email.</p>
          </div>
          <div style="background-color: #f8f8f8; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666;">
            <p>&copy; ${new Date().getFullYear()} FlowBank. All rights reserved.</p>
            <p>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/privacy" style="color: #666; text-decoration: underline;">Privacy Policy</a>
              &nbsp;|&nbsp;
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/terms" style="color: #666; text-decoration: underline;">Terms of Service</a>
            </p>
          </div>
        </div>
      `,
    };

    await sgMail.send(msg);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending invite email:', error);
    return NextResponse.json({ success: false, error: 'Failed to send email.' }, { status: 500 });
  }
}