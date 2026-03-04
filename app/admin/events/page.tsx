export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma'
import { EventsClient } from './events-client'

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    orderBy: { date: 'desc' },
    include: { createdBy: { select: { name: true } } },
  })

  return <EventsClient initialEvents={events} />
}
