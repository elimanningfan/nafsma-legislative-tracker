'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
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
  DialogFooter,
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
import {
  Users,
  UserPlus,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  Building2,
} from 'lucide-react'

type Application = {
  id: string
  organizationName: string
  organizationType: string
  contactName: string
  contactEmail: string
  contactTitle: string | null
  contactPhone: string | null
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  website: string | null
  populationServed: string | null
  annualBudget: string | null
  federalProjects: string | null
  employeeCount: string | null
  referralSource: string | null
  comments: string | null
  status: string
  notes: string | null
  submittedAt: string
  reviewedAt: string | null
  reviewedBy: { name: string } | null
}

type Member = {
  id: string
  name: string
  type: string
  city: string | null
  state: string | null
  memberType: string
  memberSince: string | null
  users: { id: string; name: string; email: string; role: string; title: string | null }[]
}

const statusColors: Record<string, string> = {
  PENDING: 'default',
  APPROVED: 'secondary',
  REJECTED: 'destructive',
}

const orgTypeLabels: Record<string, string> = {
  FLOOD_DISTRICT: 'Flood Control District',
  STORMWATER_UTILITY: 'Stormwater Utility',
  STATE_AGENCY: 'State Agency',
  MUNICIPALITY: 'Municipality',
  ASSOCIATE: 'Associate',
  OTHER: 'Other',
}

export function MembersClient({
  initialApplications,
  initialMembers,
}: {
  initialApplications: any[]
  initialMembers: any[]
}) {
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>(
    initialApplications.map((a) => ({
      ...a,
      submittedAt: a.submittedAt.toString(),
      reviewedAt: a.reviewedAt?.toString() || null,
    }))
  )
  const [members, setMembers] = useState<Member[]>(
    initialMembers.map((m) => ({
      ...m,
      memberSince: m.memberSince?.toString() || null,
    }))
  )
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [approveId, setApproveId] = useState<string | null>(null)
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [processing, setProcessing] = useState(false)

  const pendingApps = applications.filter((a) => a.status === 'PENDING')
  const processedApps = applications.filter((a) => a.status !== 'PENDING')

  const handleApprove = async () => {
    if (!approveId) return
    setProcessing(true)
    try {
      const res = await fetch(`/api/members/${approveId}/approve`, {
        method: 'POST',
      })
      if (res.ok) {
        setApproveId(null)
        setSelectedApp(null)
        router.refresh()
        // Refetch data
        const data = await fetch('/api/members').then((r) => r.json())
        setApplications(data.applications)
        setMembers(data.members)
      }
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!rejectId) return
    setProcessing(true)
    try {
      const res = await fetch(`/api/members/${rejectId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason }),
      })
      if (res.ok) {
        setRejectId(null)
        setRejectReason('')
        setSelectedApp(null)
        router.refresh()
        const data = await fetch('/api/members').then((r) => r.json())
        setApplications(data.applications)
        setMembers(data.members)
      }
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Members</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review membership applications and manage active member organizations
        </p>
      </div>

      <Tabs defaultValue="applications">
        <TabsList>
          <TabsTrigger value="applications">
            Pending Applications
            {pendingApps.length > 0 && (
              <Badge className="ml-2" variant="default">
                {pendingApps.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="members">
            Active Members
            <Badge className="ml-2" variant="outline">
              {members.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Pending Applications Tab */}
        <TabsContent value="applications" className="mt-4">
          {pendingApps.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <UserPlus className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No pending applications
                </h3>
                <p className="text-sm text-gray-500">
                  New membership applications will appear here for review
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingApps.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">
                        {app.organizationName}
                      </TableCell>
                      <TableCell>
                        <div>{app.contactName}</div>
                        <div className="text-xs text-gray-500">
                          {app.contactEmail}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {app.organizationType}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(app.submittedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedApp(app)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setApproveId(app.id)}
                        >
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRejectId(app.id)}
                        >
                          <XCircle className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}

          {/* Previously processed applications */}
          {processedApps.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                Previously Reviewed
              </h3>
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reviewed</TableHead>
                      <TableHead>By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processedApps.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">
                          {app.organizationName}
                        </TableCell>
                        <TableCell className="text-gray-500">
                          {app.contactName}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusColors[app.status] as any}>
                            {app.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {app.reviewedAt
                            ? new Date(app.reviewedAt).toLocaleDateString()
                            : '--'}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {app.reviewedBy?.name || '--'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Active Members Tab */}
        <TabsContent value="members" className="mt-4">
          {members.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building2 className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No active members
                </h3>
                <p className="text-sm text-gray-500">
                  Approve membership applications to add organizations
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {members.map((member) => (
                <Card key={member.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{member.name}</CardTitle>
                        <p className="text-sm text-gray-500 mt-1">
                          {orgTypeLabels[member.type] || member.type}
                          {member.city && member.state
                            ? ` -- ${member.city}, ${member.state}`
                            : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{member.memberType}</Badge>
                        {member.memberSince && (
                          <p className="text-xs text-gray-400 mt-1">
                            Member since{' '}
                            {new Date(member.memberSince).toLocaleDateString(
                              'en-US',
                              { month: 'short', year: 'numeric' }
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  {member.users.length > 0 && (
                    <CardContent className="pt-0">
                      <p className="text-xs text-gray-500 uppercase mb-2">
                        Users ({member.users.length})
                      </p>
                      <div className="space-y-1">
                        {member.users.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center justify-between text-sm bg-gray-50 rounded px-3 py-2"
                          >
                            <div>
                              <span className="font-medium">{user.name}</span>
                              {user.title && (
                                <span className="text-gray-500">
                                  {' '}
                                  -- {user.title}
                                </span>
                              )}
                            </div>
                            <span className="text-gray-500">{user.email}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* View Application Dialog */}
      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Membership Application</DialogTitle>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Organization</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-medium">{selectedApp.organizationName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Type</p>
                    <p>{selectedApp.organizationType}</p>
                  </div>
                  {selectedApp.website && (
                    <div>
                      <p className="text-xs text-gray-500">Website</p>
                      <p>{selectedApp.website}</p>
                    </div>
                  )}
                  {(selectedApp.city || selectedApp.state) && (
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p>
                        {[
                          selectedApp.address,
                          selectedApp.city,
                          selectedApp.state,
                          selectedApp.zip,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Contact</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-medium">{selectedApp.contactName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p>{selectedApp.contactEmail}</p>
                  </div>
                  {selectedApp.contactTitle && (
                    <div>
                      <p className="text-xs text-gray-500">Title</p>
                      <p>{selectedApp.contactTitle}</p>
                    </div>
                  )}
                  {selectedApp.contactPhone && (
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p>{selectedApp.contactPhone}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3 text-sm">
                  {selectedApp.populationServed && (
                    <div>
                      <p className="text-xs text-gray-500">Population Served</p>
                      <p>{selectedApp.populationServed}</p>
                    </div>
                  )}
                  {selectedApp.annualBudget && (
                    <div>
                      <p className="text-xs text-gray-500">Annual Budget</p>
                      <p>{selectedApp.annualBudget}</p>
                    </div>
                  )}
                  {selectedApp.employeeCount && (
                    <div>
                      <p className="text-xs text-gray-500">Employees</p>
                      <p>{selectedApp.employeeCount}</p>
                    </div>
                  )}
                  {selectedApp.referralSource && (
                    <div>
                      <p className="text-xs text-gray-500">Referral Source</p>
                      <p>{selectedApp.referralSource}</p>
                    </div>
                  )}
                  {selectedApp.federalProjects && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500">Federal Projects</p>
                      <p className="whitespace-pre-wrap">
                        {selectedApp.federalProjects}
                      </p>
                    </div>
                  )}
                  {selectedApp.comments && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500">Comments</p>
                      <p className="whitespace-pre-wrap">{selectedApp.comments}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                Submitted{' '}
                {new Date(selectedApp.submittedAt).toLocaleString()}
              </div>

              {selectedApp.status === 'PENDING' && (
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    className="flex-1"
                    variant="default"
                    onClick={() => {
                      setSelectedApp(null)
                      setApproveId(selectedApp.id)
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    className="flex-1"
                    variant="destructive"
                    onClick={() => {
                      setSelectedApp(null)
                      setRejectId(selectedApp.id)
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Confirmation */}
      <AlertDialog open={!!approveId} onOpenChange={() => setApproveId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Application</AlertDialogTitle>
            <AlertDialogDescription>
              This will create an Organization and User account for the applicant
              and send them a welcome email with login credentials. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} disabled={processing}>
              {processing ? 'Processing...' : 'Approve & Send Welcome Email'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <Dialog open={!!rejectId} onOpenChange={() => setRejectId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              The applicant will receive a notification email. Optionally provide
              a reason.
            </p>
            <div>
              <Label htmlFor="rejectReason">Reason (optional)</Label>
              <Textarea
                id="rejectReason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., Organization does not meet membership criteria..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectId(null)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing}
            >
              {processing ? 'Processing...' : 'Reject & Notify'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
