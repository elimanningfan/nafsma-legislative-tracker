import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { Resend } from 'resend'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || '');
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const data = await req.json()

  const application = await prisma.membershipApplication.findUnique({
    where: { id },
  })

  if (!application) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  }

  if (application.status !== 'PENDING') {
    return NextResponse.json(
      { error: 'Application has already been processed' },
      { status: 400 }
    )
  }

  await prisma.membershipApplication.update({
    where: { id },
    data: {
      status: 'REJECTED',
      notes: data.reason || null,
      reviewedAt: new Date(),
      reviewedById: session.user.id,
    },
  })

  // Send rejection email
  try {
    await getResend().emails.send({
      from: 'NAFSMA <membership@nafsma.org>',
      to: application.contactEmail,
      subject: 'NAFSMA Membership Application Update',
      html: `
        <h1>Membership Application Update</h1>
        <p>Dear ${application.contactName},</p>
        <p>Thank you for your interest in NAFSMA. After reviewing your application for <strong>${application.organizationName}</strong>, we are unable to approve your membership at this time.</p>
        ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ''}
        <p>If you have questions about this decision, please contact us at <a href="mailto:info@nafsma.org">info@nafsma.org</a>.</p>
        <p>Best regards,<br>NAFSMA Membership Team</p>
      `,
    })
  } catch (emailError) {
    console.error('Failed to send rejection email:', emailError)
  }

  return NextResponse.json({ success: true })
}
