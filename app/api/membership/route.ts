import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      organizationName,
      organizationType,
      contactName,
      contactEmail,
      contactTitle,
      contactPhone,
      address,
      city,
      state,
      zip,
      website,
      populationServed,
      employeeCount,
      federalProjects,
      referralSource,
      comments,
    } = body;

    // Validate required fields
    if (!organizationName || !organizationType || !contactName || !contactEmail) {
      return NextResponse.json(
        {
          error:
            'Organization name, type, contact name, and email are required.',
        },
        { status: 400 }
      );
    }

    // Create application
    const application = await prisma.membershipApplication.create({
      data: {
        organizationName,
        organizationType,
        contactName,
        contactEmail,
        contactTitle: contactTitle || null,
        contactPhone: contactPhone || null,
        address: address || null,
        city: city || null,
        state: state || null,
        zip: zip || null,
        website: website || null,
        populationServed: populationServed || null,
        employeeCount: employeeCount || null,
        federalProjects: federalProjects || null,
        referralSource: referralSource || null,
        comments: comments || null,
        status: 'PENDING',
      },
    });

    // Send notification email to NAFSMA staff
    try {
      await resend.emails.send({
        from: 'NAFSMA <notifications@nafsma.org>',
        to: ['jennifer@nafsma.org'],
        subject: `New Membership Application: ${organizationName}`,
        html: `
          <h2>New NAFSMA Membership Application</h2>
          <p>A new membership application has been submitted.</p>

          <h3>Organization</h3>
          <ul>
            <li><strong>Name:</strong> ${organizationName}</li>
            <li><strong>Type:</strong> ${organizationType.replace(/_/g, ' ')}</li>
            ${website ? `<li><strong>Website:</strong> ${website}</li>` : ''}
            ${populationServed ? `<li><strong>Population Served:</strong> ${populationServed}</li>` : ''}
            ${employeeCount ? `<li><strong>Employees:</strong> ${employeeCount}</li>` : ''}
          </ul>

          <h3>Primary Contact</h3>
          <ul>
            <li><strong>Name:</strong> ${contactName}</li>
            <li><strong>Email:</strong> ${contactEmail}</li>
            ${contactTitle ? `<li><strong>Title:</strong> ${contactTitle}</li>` : ''}
            ${contactPhone ? `<li><strong>Phone:</strong> ${contactPhone}</li>` : ''}
          </ul>

          ${address ? `
          <h3>Address</h3>
          <p>${address}<br>${city ? `${city}, ` : ''}${state || ''} ${zip || ''}</p>
          ` : ''}

          ${federalProjects ? `
          <h3>Federal Projects</h3>
          <p>${federalProjects}</p>
          ` : ''}

          ${referralSource ? `<p><strong>Referral Source:</strong> ${referralSource}</p>` : ''}
          ${comments ? `<p><strong>Comments:</strong> ${comments}</p>` : ''}

          <hr>
          <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://nafsma.org'}/admin/members">Review in Admin Panel</a></p>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send staff notification email:', emailError);
    }

    // Send confirmation email to applicant
    try {
      await resend.emails.send({
        from: 'NAFSMA <info@nafsma.org>',
        to: [contactEmail],
        subject: 'NAFSMA Membership Application Received',
        html: `
          <h2>Thank You for Your Application</h2>
          <p>Dear ${contactName},</p>
          <p>We have received your NAFSMA membership application for <strong>${organizationName}</strong>. Our team will review it and follow up within 5 business days.</p>
          <p>If you have any questions in the meantime, please contact Jennifer at <a href="mailto:jennifer@nafsma.org">jennifer@nafsma.org</a>.</p>
          <p>Best regards,<br>NAFSMA Membership Team</p>
          <hr>
          <p style="font-size: 12px; color: #666;">National Association of Flood &amp; Stormwater Management Agencies<br>Washington, DC &middot; (202) 289-8625 &middot; <a href="https://nafsma.org">nafsma.org</a></p>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    return NextResponse.json(
      { success: true, id: application.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Membership application error:', error);
    return NextResponse.json(
      { error: 'Failed to submit application. Please try again.' },
      { status: 500 }
    );
  }
}
