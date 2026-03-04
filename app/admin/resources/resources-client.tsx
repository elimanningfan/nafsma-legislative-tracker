'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { FolderOpen, Plus, Pencil, Trash2, FileText } from 'lucide-react'

type Resource = {
  id: string
  title: string
  description: string | null
  fileUrl: string | null
  fileSize: number | null
  fileMimeType: string | null
  category: string
  membersOnly: boolean
  publishedAt: string | null
  createdBy: { name: string }
  createdAt: string
}

const categoryLabels: Record<string, string> = {
  NEWSLETTER: 'Newsletter',
  WEBINAR_RECORDING: 'Webinar Recording',
  COMMITTEE_DOC: 'Committee Document',
  GUIDE: 'Guide',
  POSITION_PAPER: 'Position Paper',
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '--'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

const emptyForm = {
  title: '',
  description: '',
  fileUrl: '',
  fileSize: '',
  fileMimeType: '',
  category: 'GUIDE',
  membersOnly: true,
  publishedAt: '',
}

export function ResourcesClient({ initialResources }: { initialResources: any[] }) {
  const router = useRouter()
  const [resources, setResources] = useState<Resource[]>(
    initialResources.map((r) => ({
      ...r,
      createdAt: r.createdAt.toString(),
      publishedAt: r.publishedAt?.toString() || null,
    }))
  )
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Resource | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (resource: Resource) => {
    setEditing(resource)
    setForm({
      title: resource.title,
      description: resource.description || '',
      fileUrl: resource.fileUrl || '',
      fileSize: resource.fileSize?.toString() || '',
      fileMimeType: resource.fileMimeType || '',
      category: resource.category,
      membersOnly: resource.membersOnly,
      publishedAt: resource.publishedAt
        ? new Date(resource.publishedAt).toISOString().slice(0, 10)
        : '',
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.title) return
    setSaving(true)
    try {
      const url = editing ? `/api/resources/${editing.id}` : '/api/resources'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setDialogOpen(false)
        router.refresh()
        const updated = await fetch('/api/resources').then((r) => r.json())
        setResources(updated)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await fetch(`/api/resources/${deleteId}`, { method: 'DELETE' })
    setDeleteId(null)
    router.refresh()
    const updated = await fetch('/api/resources').then((r) => r.json())
    setResources(updated)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage documents, newsletters, and recordings for members
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Resource
        </Button>
      </div>

      {resources.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No resources yet</h3>
            <p className="text-sm text-gray-500 mb-4">
              Upload documents and resources for your members
            </p>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Resource
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Access</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      {resource.title}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {categoryLabels[resource.category] || resource.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {resource.fileMimeType && (
                      <span>
                        {resource.fileMimeType.split('/').pop()?.toUpperCase()}{' '}
                        {formatFileSize(resource.fileSize)}
                      </span>
                    )}
                    {!resource.fileMimeType && '--'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={resource.membersOnly ? 'secondary' : 'outline'}>
                      {resource.membersOnly ? 'Members Only' : 'Public'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {resource.publishedAt
                      ? new Date(resource.publishedAt).toLocaleDateString()
                      : 'Not published'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(resource)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(resource.id)}
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Resource' : 'New Resource'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Spring 2026 Newsletter"
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEWSLETTER">Newsletter</SelectItem>
                  <SelectItem value="WEBINAR_RECORDING">Webinar Recording</SelectItem>
                  <SelectItem value="COMMITTEE_DOC">Committee Document</SelectItem>
                  <SelectItem value="GUIDE">Guide</SelectItem>
                  <SelectItem value="POSITION_PAPER">Position Paper</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of this resource..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="fileUrl">File URL</Label>
              <Input
                id="fileUrl"
                value={form.fileUrl}
                onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                placeholder="https://..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload files via the Media Library first, then paste the URL here
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fileMimeType">File Type</Label>
                <Input
                  id="fileMimeType"
                  value={form.fileMimeType}
                  onChange={(e) =>
                    setForm({ ...form, fileMimeType: e.target.value })
                  }
                  placeholder="e.g., application/pdf"
                />
              </div>
              <div>
                <Label htmlFor="fileSize">File Size (bytes)</Label>
                <Input
                  id="fileSize"
                  value={form.fileSize}
                  onChange={(e) =>
                    setForm({ ...form, fileSize: e.target.value })
                  }
                  placeholder="e.g., 1048576"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="publishedAt">Publish Date</Label>
              <Input
                id="publishedAt"
                type="date"
                value={form.publishedAt}
                onChange={(e) =>
                  setForm({ ...form, publishedAt: e.target.value })
                }
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={form.membersOnly}
                onCheckedChange={(checked) =>
                  setForm({ ...form, membersOnly: checked })
                }
              />
              <Label>Members only</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !form.title}>
              {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resource</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this resource? This action cannot be
              undone.
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
