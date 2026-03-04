export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma'
import { ContactsClient } from './contacts-client'

export default async function ContactsPage() {
  const contacts = await prisma.contactSubmission.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return <ContactsClient initialContacts={contacts} />
}
