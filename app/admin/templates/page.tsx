'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Sparkles,
  Pencil,
  Loader2,
  CheckCircle,
  AlertCircle,
  Zap,
  Save,
} from 'lucide-react'

interface ContentTemplate {
  id: string
  name: string
  type: string
  description: string | null
  systemPrompt: string
  isActive: boolean
  generationParams: { temperature?: number; maxTokens?: number } | null
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<ContentTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<ContentTemplate | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Test generation state
  const [testingId, setTestingId] = useState<string | null>(null)
  const [testOutput, setTestOutput] = useState<string | null>(null)
  const [testContext, setTestContext] = useState('')
  const [showTestDialog, setShowTestDialog] = useState(false)
  const [testTemplate, setTestTemplate] = useState<ContentTemplate | null>(null)

  // Edit form state
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editSystemPrompt, setEditSystemPrompt] = useState('')
  const [editIsActive, setEditIsActive] = useState(true)
  const [editTemperature, setEditTemperature] = useState(0.7)
  const [editMaxTokens, setEditMaxTokens] = useState(2000)

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/ai/templates')
      const data = await res.json()
      setTemplates(Array.isArray(data) ? data : [])
    } catch {
      setError('Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  const startEditing = (template: ContentTemplate) => {
    setEditing(template)
    setEditName(template.name)
    setEditDescription(template.description || '')
    setEditSystemPrompt(template.systemPrompt)
    setEditIsActive(template.isActive)
    const params = template.generationParams || {}
    setEditTemperature((params as any).temperature ?? 0.7)
    setEditMaxTokens((params as any).maxTokens ?? 2000)
    setError(null)
    setSuccess(null)
  }

  const handleSave = async () => {
    if (!editing) return
    setSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/ai/templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editing.id,
          name: editName,
          description: editDescription,
          systemPrompt: editSystemPrompt,
          isActive: editIsActive,
          generationParams: {
            temperature: editTemperature,
            maxTokens: editMaxTokens,
          },
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save')
      }

      setSuccess('Template saved successfully')
      setEditing(null)
      fetchTemplates()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const openTestDialog = (template: ContentTemplate) => {
    setTestTemplate(template)
    setTestContext('')
    setTestOutput(null)
    setShowTestDialog(true)
  }

  const handleTestGenerate = async () => {
    if (!testTemplate || !testContext.trim()) return
    setTestingId(testTemplate.id)
    setTestOutput(null)

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateType: testTemplate.type,
          context: testContext.trim(),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setTestOutput(data.content)
    } catch (err: any) {
      setTestOutput(`Error: ${err.message}`)
    } finally {
      setTestingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-nafsma-blue" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Templates</h1>
        <p className="text-gray-500 mt-1">
          Manage the system prompts and parameters that guide AI content generation.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* Editing form */}
      {editing && (
        <Card className="border-nafsma-blue">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Editing: {editing.name}</CardTitle>
                <CardDescription>
                  Type: <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{editing.type}</code>
                </CardDescription>
              </div>
              <Button variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-prompt">System Prompt</Label>
              <Textarea
                id="edit-prompt"
                value={editSystemPrompt}
                onChange={(e) => setEditSystemPrompt(e.target.value)}
                rows={12}
                className="font-mono text-sm"
                placeholder="Enter the system prompt that guides AI generation..."
              />
              <p className="text-xs text-gray-500">
                This is sent as the system message to Claude. Be specific about tone, format, length, and NAFSMA voice.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label>Temperature: {editTemperature.toFixed(1)}</Label>
                <Slider
                  value={[editTemperature]}
                  onValueChange={([v]) => setEditTemperature(v)}
                  min={0}
                  max={1}
                  step={0.1}
                />
                <p className="text-xs text-gray-500">
                  Lower = more focused/consistent. Higher = more creative/varied.
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="edit-max-tokens">Max Tokens</Label>
                <Input
                  id="edit-max-tokens"
                  type="number"
                  value={editMaxTokens}
                  onChange={(e) => setEditMaxTokens(parseInt(e.target.value) || 200)}
                  min={100}
                  max={4000}
                />
                <p className="text-xs text-gray-500">
                  Maximum length of generated content (~750 words per 1000 tokens).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={editIsActive}
                onCheckedChange={setEditIsActive}
              />
              <Label>Active (available for content generation)</Label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-nafsma-blue hover:bg-nafsma-blue/90"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Template
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={!template.isActive ? 'opacity-60' : ''}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-nafsma-blue" />
                    {template.name}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {template.description}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1">
                  {template.isActive ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-400">
                      Inactive
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-md p-3">
                  <p className="text-xs text-gray-500 mb-1">System Prompt Preview</p>
                  <p className="text-sm text-gray-700 line-clamp-3 font-mono">
                    {template.systemPrompt}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    <code>{template.type}</code>
                  </Badge>
                  {template.generationParams && (
                    <>
                      <Badge variant="outline" className="text-xs">
                        Temp: {(template.generationParams as any).temperature ?? 0.7}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Max: {(template.generationParams as any).maxTokens ?? 2000}
                      </Badge>
                    </>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEditing(template)}
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1.5" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openTestDialog(template)}
                    disabled={!template.isActive}
                  >
                    <Zap className="h-3.5 w-3.5 mr-1.5" />
                    Test
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Test generation dialog */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Test: {testTemplate?.name}</DialogTitle>
            <DialogDescription>
              Generate a sample output to verify the template prompt works correctly.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Test Context</Label>
              <Textarea
                value={testContext}
                onChange={(e) => setTestContext(e.target.value)}
                placeholder="Enter sample context to test the template..."
                rows={4}
              />
            </div>

            <Button
              onClick={handleTestGenerate}
              disabled={!testContext.trim() || testingId !== null}
              className="bg-nafsma-blue hover:bg-nafsma-blue/90"
            >
              {testingId ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Generate Test
                </>
              )}
            </Button>

            {testOutput && (
              <div className="space-y-2">
                <Label>Output</Label>
                <div className="bg-gray-50 border rounded-md p-4 prose prose-sm max-w-none whitespace-pre-wrap text-sm">
                  {testOutput}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
