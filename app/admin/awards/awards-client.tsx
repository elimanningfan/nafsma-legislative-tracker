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
import { RichTextEditor } from '@/components/rich-text-editor'
import { Award as AwardIcon, Plus, Pencil, Trash2, Trophy } from 'lucide-react'

type Award = {
  id: string
  year: number
  category: string
  winnerName: string
  agency: string | null
  city: string | null
  state: string | null
  description: string | null
  photo: string | null
  createdBy: { name: string }
  createdAt: string
}

const categoryLabels: Record<string, string> = {
  INNOVATIVE_PROJECT: 'Innovative Project',
  COMMUNICATIONS: 'Communications',
}

const emptyForm = {
  year: new Date().getFullYear().toString(),
  category: 'INNOVATIVE_PROJECT',
  winnerName: '',
  agency: '',
  city: '',
  state: '',
  description: '',
  photo: '',
}

export function AwardsClient({ initialAwards }: { initialAwards: any[] }) {
  const router = useRouter()
  const [awards, setAwards] = useState<Award[]>(
    initialAwards.map((a) => ({ ...a, createdAt: a.createdAt.toString() }))
  )
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Award | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (award: Award) => {
    setEditing(award)
    setForm({
      year: award.year.toString(),
      category: award.category,
      winnerName: award.winnerName,
      agency: award.agency || '',
      city: award.city || '',
      state: award.state || '',
      description: award.description || '',
      photo: award.photo || '',
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.winnerName || !form.year) return
    setSaving(true)
    try {
      const url = editing ? `/api/awards/${editing.id}` : '/api/awards'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setDialogOpen(false)
        router.refresh()
        const updated = await fetch('/api/awards').then((r) => r.json())
        setAwards(updated)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await fetch(`/api/awards/${deleteId}`, { method: 'DELETE' })
    setDeleteId(null)
    router.refresh()
    const updated = await fetch('/api/awards').then((r) => r.json())
    setAwards(updated)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Awards</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage NAFSMA award winners for Innovative Project and Communications
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Award
        </Button>
      </div>

      {awards.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Trophy className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No awards yet</h3>
            <p className="text-sm text-gray-500 mb-4">
              Add award winners to showcase NAFSMA achievements
            </p>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Award
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Year</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Winner</TableHead>
                <TableHead>Agency</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {awards.map((award) => (
                <TableRow key={award.id}>
                  <TableCell className="font-medium">{award.year}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {categoryLabels[award.category] || award.category}
                    </Badge>
                  </TableCell>
                  <TableCell>{award.winnerName}</TableCell>
                  <TableCell className="text-gray-500">
                    {award.agency || '--'}
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {[award.city, award.state].filter(Boolean).join(', ') || '--'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(award)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(award.id)}
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
            <DialogTitle>{editing ? 'Edit Award' : 'New Award'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  type="number"
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INNOVATIVE_PROJECT">
                      Innovative Project
                    </SelectItem>
                    <SelectItem value="COMMUNICATIONS">Communications</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="winnerName">Winner Name *</Label>
              <Input
                id="winnerName"
                value={form.winnerName}
                onChange={(e) =>
                  setForm({ ...form, winnerName: e.target.value })
                }
                placeholder="e.g., Harris County Flood Control District"
              />
            </div>

            <div>
              <Label htmlFor="agency">Agency / Organization</Label>
              <Input
                id="agency"
                value={form.agency}
                onChange={(e) => setForm({ ...form, agency: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  placeholder="e.g., TX"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="photo">Photo URL</Label>
              <Input
                id="photo"
                value={form.photo}
                onChange={(e) => setForm({ ...form, photo: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label>Description</Label>
              <RichTextEditor
                content={form.description}
                onChange={(html) => setForm({ ...form, description: html })}
                placeholder="Describe the award-winning project or achievement..."
                minHeight="200px"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.winnerName || !form.year}
            >
              {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Award</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this award? This action cannot be
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
