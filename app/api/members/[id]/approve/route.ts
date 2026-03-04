import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
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

  // Generate default password
  const defaultPassword = `NAFSMA-${Date.now().toString(36).slice(-6)}`
  const hashedPassword = await bcrypt.hash(defaultPassword, 12)

  // Map the organization type string to enum
  const orgTypeMap: Record<string, string> = {
    'Flood Control District': 'FLOOD_DISTRICT',
    'Stormwater Utility': 'STORMWATER_UTILITY',
    'State Agency': 'STATE_AGENCY',
    'Municipality': 'MUNICIPALITY',
    'Associate Member': 'ASSOCIATE',
  }
  const orgType = orgTypeMap[application.organizationType] || 'OTHER'

  // Create Organization + User in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: {
        name: application.organizationName,
        type: orgType as any,
        address: application.address,
        city: application.city,
        state: application.state,
        zip: application.zip,
        website: application.website,
        memberType: orgType === 'ASSOCIATE' ? 'ASSOCIATE' : 'AGENCY',
        membershipStatus: 'ACTIVE',
        memberSince: new Date(),
      },
    })

    const user = await tx.user.create({
      data: {
        name: application.contactName,
        email: application.contactEmail,
        password: hashedPassword,
        role: 'MEMBER',
        title: application.contactTitle,
        phone: application.contactPhone,
        organizationId: organization.id,
      },
    })

    await tx.membershipApplication.update({
      where: { id },
      data: {
        status: 'APPROVED',
        reviewedAt: new Date(),
        reviewedById: session.user.id,
      },
    })

    return { organization, user }
  })

  // Send welcome email
  try {
    await getResend().emails.send({
      from: 'NAFSMA <membership@nafsma.org>',
      to: application.contactEmail,
      subject: 'Welcome to NAFSMA - Membership Approved',
      html: `
        <h1>Welcome to NAFSMA!</h1>
        <p>Dear ${application.contactName},</p>
        <p>We are pleased to inform you that your membership application for <strong>${application.organizationName}</strong> has been approved.</p>
        <p>You can now log in to the NAFSMA member portal with the following credentials:</p>
        <ul>
          <li><strong>Email:</strong> ${application.contactEmail}</li>
          <li><strong>Temporary Password:</strong> ${defaultPassword}</li>
        </ul>
        <p>Please change your password after your first login.</p>
        <p>As a member, you now have access to:</p>
        <ul>
          <li>Member-only resources and documents</li>
          <li>Event registration</li>
          <li>Committee participation</li>
          <li>NAFSMA newsletters and updates</li>
        </ul>
        <p>Welcome aboard!</p>
        <p>Best regards,<br>NAFSMA Membership Team</p>
      `,
    })
  } catch (emailError) {
    console.error('Failed to send welcome email:', emailError)
  }

  return NextResponse.json({
    success: true,
    organization: result.organization,
    user: { id: result.user.id, email: result.user.email },
  })
}
