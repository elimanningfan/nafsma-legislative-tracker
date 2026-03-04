import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    let settings = await prisma.siteSettings.findUnique({ where: { id: 'default' } });

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: { id: 'default' },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { siteName, tagline, contactEmail, contactPhone, address, socialMedia, colors, featureFlags } = body;

    const settings = await prisma.siteSettings.upsert({
      where: { id: 'default' },
      update: {
        siteName: siteName || undefined,
        tagline: tagline || undefined,
        contactEmail: contactEmail || undefined,
        contactPhone: contactPhone || undefined,
        address: address || undefined,
        socialMedia: socialMedia || undefined,
        colors: colors || undefined,
        featureFlags: featureFlags || undefined,
      },
      create: {
        id: 'default',
        siteName: siteName || 'NAFSMA',
        tagline: tagline || 'Driving flood and stormwater policy that benefits our communities',
        contactEmail: contactEmail || 'info@nafsma.org',
        contactPhone,
        address,
        socialMedia,
        colors,
        featureFlags,
      },
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
