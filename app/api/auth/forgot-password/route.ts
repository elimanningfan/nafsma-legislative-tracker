import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import crypto from 'crypto';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || '');
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required.' },
        { status: 400 }
      );
    }

    // Always return success to prevent email enumeration
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (user) {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken, resetTokenExpiry },
      });

      const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://nafsma.org'}/reset-password?token=${resetToken}`;

      try {
        await getResend().emails.send({
          from: 'NAFSMA <info@nafsma.org>',
          to: [user.email],
          subject: 'Reset Your NAFSMA Password',
          html: `
            <h2>Password Reset Request</h2>
            <p>Hi ${user.name},</p>
            <p>We received a request to reset your NAFSMA account password. Click the link below to set a new password:</p>
            <p><a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #1B4B82; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">Reset Password</a></p>
            <p>This link will expire in 1 hour. If you did not request a password reset, you can safely ignore this email.</p>
            <p>Best regards,<br>NAFSMA</p>
            <hr>
            <p style="font-size: 12px; color: #666;">If the button above doesn't work, copy and paste this URL into your browser:<br>${resetUrl}</p>
          `,
        });
      } catch (emailError) {
        console.error('Failed to send reset email:', emailError);
      }
    }

    // Always return success
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
