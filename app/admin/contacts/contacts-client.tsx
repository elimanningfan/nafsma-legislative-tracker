'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Mail, Inbox, Trash2, Eye } from 'lucide-react'

type Contact = {
  id: string
  name: string
  email: string
  organization: string | null
  subject: string
  message: string
  status: string
  createdAt: string
}

const statusColors: Record<string, string> = {
  NEW: 'default',
  READ: 'secondary',
  RESPONDED: 'outline',
}

const subjectLabels: Record<string, string> = {
  GENERAL: 'General',
  MEMBERSHIP: 'Membership',
  EVENTS: 'Events',
  POLICY: 'Policy',
  MEDIA: 'Media',
  OTHER: 'Other',
}

export function ContactsClient({ initialContacts }: { initialContacts: any[] }) {
  const router = useRouter()
  const [contacts, setContacts] = useState<Contact[]>(
    initialContacts.map((c) => ({ ...c, createdAt: c.createdAt.toString() }))
  )
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('ALL')

  const filteredContacts =
    filter === 'ALL' ? contacts : contacts.filter((c) => c.status === filter)

  const openContact = async (contact: Contact) => {
    setSelectedContact(contact)
    // Auto-mark as READ if NEW
    if (contact.status === 'NEW') {
      await fetch(`/api/contacts/${contact.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'READ' }),
      })
      setContacts((prev) =>
        prev.map((c) => (c.id === contact.id ? { ...c, status: 'READ' } : c))
      )
    }
  }

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/contacts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    )
    if (selectedContact?.id === id) {
      setSelectedContact({ ...selectedContact, status })
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await fetch(`/api/contacts/${deleteId}`, { method: 'DELETE' })
    setDeleteId(null)
    setContacts((prev) => prev.filter((c) => c.id !== deleteId))
    if (selectedContact?.id === deleteId) {
      setSelectedContact(null)
    }
  }

  const newCount = contacts.filter((c) => c.status === 'NEW').length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Contact Submissions
            {newCount > 0 && (
              <Badge className="ml-2" variant="default">
                {newCount} new
              </Badge>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View and manage messages from the public contact form
          </p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="NEW">New</SelectItem>
            <SelectItem value="READ">Read</SelectItem>
            <SelectItem value="RESPONDED">Responded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {contacts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Inbox className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No messages yet</h3>
            <p className="text-sm text-gray-500">
              Contact submissions will appear here when visitors reach out
            </p>
          </CardContent>
        </Card>
      ) : filteredContacts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mail className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No {filter.toLowerCase()} messages
            </h3>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact) => (
                <TableRow
                  key={contact.id}
                  className={contact.status === 'NEW' ? 'bg-blue-50/50' : ''}
                >
                  <TableCell>
                    <Badge variant={statusColors[contact.status] as any}>
                      {contact.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{contact.name}</TableCell>
                  <TableCell className="text-gray-500">{contact.email}</TableCell>
                  <TableCell>
                    {subjectLabels[contact.subject] || contact.subject}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(contact.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openContact(contact)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(contact.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* View Contact Dialog */}
      <Dialog
        open={!!selectedContact}
        onOpenChange={() => setSelectedContact(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Contact Submission</DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Name</p>
                  <p className="font-medium">{selectedContact.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Email</p>
                  <a
                    href={`mailto:${selectedContact.email}`}
                    className="font-medium text-nafsma-blue hover:underline"
                  >
                    {selectedContact.email}
                  </a>
                </div>
              </div>
              {selectedContact.organization && (
                <div>
                  <p className="text-xs text-gray-500 uppercase">Organization</p>
                  <p>{selectedContact.organization}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 uppercase">Subject</p>
                <p>{subjectLabels[selectedContact.subject] || selectedContact.subject}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Message</p>
                <p className="whitespace-pre-wrap text-sm bg-gray-50 rounded p-3 mt-1">
                  {selectedContact.message}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Received</p>
                <p className="text-sm">
                  {new Date(selectedContact.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2 pt-2 border-t">
                <p className="text-xs text-gray-500 uppercase self-center mr-2">
                  Status:
                </p>
                {['NEW', 'READ', 'RESPONDED'].map((status) => (
                  <Button
                    key={status}
                    variant={
                      selectedContact.status === status ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() => updateStatus(selectedContact.id, status)}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Submission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this contact submission? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
