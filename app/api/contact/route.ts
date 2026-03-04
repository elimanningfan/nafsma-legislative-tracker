import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, organization, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Name, email, subject, and message are required.' },
        { status: 400 }
      );
    }

    // Validate subject enum
    const validSubjects = [
      'GENERAL',
      'MEMBERSHIP',
      'EVENTS',
      'POLICY',
      'MEDIA',
      'OTHER',
    ];
    if (!validSubjects.includes(subject)) {
      return NextResponse.json(
        { error: 'Invalid subject category.' },
        { status: 400 }
      );
    }

    const submission = await prisma.contactSubmission.create({
      data: {
        name,
        email,
        organization: organization || null,
        subject,
        message,
      },
    });

    return NextResponse.json(
      { success: true, id: submission.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Contact submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit contact form. Please try again.' },
      { status: 500 }
    );
  }
}
