'use client'

import { useState, useEffect, useCallback } from 'react'
import { RichTextEditor } from '@/components/rich-text-editor'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sparkles,
  RefreshCw,
  Save,
  Loader2,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'

interface ContentTemplate {
  id: string
  name: string
  type: string
  description: string | null
  isActive: boolean
  generationParams: { temperature?: number; maxTokens?: number } | null
}

interface HistoryEntry {
  id: string
  templateName: string
  context: string
  content: string
  timestamp: Date
}

// Group templates by category prefix
function groupTemplates(templates: ContentTemplate[]) {
  const groups: Record<string, ContentTemplate[]> = {}
  for (const t of templates) {
    let group = 'Other'
    if (t.type.startsWith('BLOG_')) group = 'Blog Posts'
    else if (t.type.startsWith('NEWSLETTER')) group = 'Newsletters'
    else if (t.type.startsWith('LINKEDIN')) group = 'Social Media'
    else if (t.type.startsWith('POLICY') || t.type.startsWith('COMMENT')) group = 'Policy & Advocacy'
    else if (t.type.startsWith('AWARD')) group = 'Awards'
    else if (t.type.startsWith('MEMBER')) group = 'Membership'
    else if (t.type.startsWith('HERO') || t.type.startsWith('STATS')) group = 'Website Copy'
    if (!groups[group]) groups[group] = []
    groups[group].push(t)
  }
  return groups
}

function wordCount(html: string): number {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return text ? text.split(' ').length : 0
}

export default function GeneratePage() {
  const [templates, setTemplates] = useState<ContentTemplate[]>([])
  const [selectedType, setSelectedType] = useState<string>('')
  const [context, setContext] = useState('')
  const [generatedContent, setGeneratedContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [draftTitle, setDraftTitle] = useState('')
  const [loadingTemplates, setLoadingTemplates] = useState(true)

  useEffect(() => {
    fetch('/api/ai/templates')
      .then((res) => res.json())
      .then((data) => {
        const active = data.filter?.((t: ContentTemplate) => t.isActive) ?? []
        setTemplates(active)
        setLoadingTemplates(false)
      })
      .catch(() => {
        setError('Failed to load templates')
        setLoadingTemplates(false)
      })
  }, [])

  const selectedTemplate = templates.find((t) => t.type === selectedType)
  const groupedTemplates = groupTemplates(templates)

  const handleGenerate = useCallback(async () => {
    if (!selectedType || !context.trim()) return

    setIsGenerating(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateType: selectedType, context: context.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Generation failed')
      }

      // Convert markdown-ish text to basic HTML for the editor
      const htmlContent = convertToHtml(data.content)
      setGeneratedContent(htmlContent)

      // Auto-fill draft title from first heading or first line
      if (!draftTitle) {
        const firstLine = data.content.split('\n').find((l: string) => l.trim())
        if (firstLine) {
          setDraftTitle(firstLine.replace(/^#+\s*/, '').replace(/^\*\*/, '').replace(/\*\*$/, '').trim())
        }
      }

      // Add to history (keep last 5)
      const entry: HistoryEntry = {
        id: Date.now().toString(),
        templateName: data.templateName,
        context: context.trim().substring(0, 100),
        content: htmlContent,
        timestamp: new Date(),
      }
      setHistory((prev) => [entry, ...prev].slice(0, 5))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsGenerating(false)
    }
  }, [selectedType, context, draftTitle])

  const handleSaveAsDraft = async () => {
    if (!generatedContent || !draftTitle.trim()) {
      setError('Please provide a title for the draft')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: draftTitle.trim(),
          content: generatedContent,
          excerpt: generatedContent
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 200),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save draft')
      }

      setSuccess('Draft saved successfully! You can find it in Blog > All Posts.')
      setTimeout(() => setSuccess(null), 5000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const restoreFromHistory = (entry: HistoryEntry) => {
    setGeneratedContent(entry.content)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Generate Content with AI</h1>
        <p className="text-gray-500 mt-1">
          Select a template, describe what you need, and let AI draft content in the NAFSMA voice.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: inputs */}
        <div className="space-y-6">
          {/* Template picker */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Template</CardTitle>
              <CardDescription>Choose a content type to generate</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTemplates ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading templates...
                </div>
              ) : (
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(groupedTemplates).map(([group, items]) => (
                      <div key={group}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase">
                          {group}
                        </div>
                        {items.map((t) => (
                          <SelectItem key={t.type} value={t.type}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {selectedTemplate && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
                  {selectedTemplate.generationParams && (
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        Temp: {(selectedTemplate.generationParams as any).temperature ?? 0.7}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Max: {(selectedTemplate.generationParams as any).maxTokens ?? 2000} tokens
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Context input */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Context</CardTitle>
              <CardDescription>
                Describe what you want the AI to write about. Be specific.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder={
                  selectedTemplate
                    ? `e.g. Describe the topic, key points, audience...`
                    : 'Select a template first...'
                }
                rows={8}
                disabled={!selectedType}
              />

              <div className="flex gap-2">
                <Button
                  onClick={handleGenerate}
                  disabled={!selectedType || !context.trim() || isGenerating}
                  className="flex-1 bg-nafsma-blue hover:bg-nafsma-blue/90"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate
                    </>
                  )}
                </Button>

                {generatedContent && (
                  <Button
                    onClick={handleGenerate}
                    disabled={!selectedType || !context.trim() || isGenerating}
                    variant="outline"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                    Regenerate
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Generation history */}
          {history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Recent Generations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {history.map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() => restoreFromHistory(entry)}
                      className="w-full text-left p-3 rounded-md border hover:bg-gray-50 transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {entry.templateName}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {entry.context}...
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column: preview and save */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Generated Content
                  </CardTitle>
                  {generatedContent && (
                    <CardDescription className="mt-1">
                      {wordCount(generatedContent)} words
                    </CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!generatedContent && !isGenerating ? (
                <div className="border-2 border-dashed rounded-lg p-12 text-center text-gray-400">
                  <Sparkles className="h-8 w-8 mx-auto mb-3 opacity-50" />
                  <p>Generated content will appear here</p>
                  <p className="text-sm mt-1">Select a template and provide context to get started</p>
                </div>
              ) : isGenerating ? (
                <div className="border-2 border-dashed rounded-lg p-12 text-center text-gray-400">
                  <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin text-nafsma-blue" />
                  <p className="text-nafsma-blue font-medium">Generating content...</p>
                  <p className="text-sm mt-1">This may take a few seconds</p>
                </div>
              ) : (
                <RichTextEditor
                  content={generatedContent}
                  onChange={setGeneratedContent}
                  placeholder="Generated content..."
                  minHeight="400px"
                />
              )}
            </CardContent>
          </Card>

          {/* Save as draft */}
          {generatedContent && !isGenerating && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Save as Draft</CardTitle>
                <CardDescription>
                  Save this content as a blog post draft for further editing.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label htmlFor="draft-title" className="sr-only">
                      Post Title
                    </Label>
                    <Input
                      id="draft-title"
                      value={draftTitle}
                      onChange={(e) => setDraftTitle(e.target.value)}
                      placeholder="Enter a title for this post..."
                    />
                  </div>
                  <Button
                    onClick={handleSaveAsDraft}
                    disabled={isSaving || !draftTitle.trim()}
                    className="bg-nafsma-blue hover:bg-nafsma-blue/90"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Draft
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

// Convert plain text / light markdown from Claude into HTML for TipTap
function convertToHtml(text: string): string {
  const lines = text.split('\n')
  const htmlLines: string[] = []
  let inList = false
  let inOrderedList = false

  for (const line of lines) {
    const trimmed = line.trim()

    // Close lists if needed
    if (inList && !trimmed.startsWith('- ') && !trimmed.startsWith('* ')) {
      htmlLines.push('</ul>')
      inList = false
    }
    if (inOrderedList && !/^\d+\.\s/.test(trimmed)) {
      htmlLines.push('</ol>')
      inOrderedList = false
    }

    if (!trimmed) {
      continue
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      htmlLines.push(`<h3>${formatInline(trimmed.slice(4))}</h3>`)
    } else if (trimmed.startsWith('## ')) {
      htmlLines.push(`<h2>${formatInline(trimmed.slice(3))}</h2>`)
    } else if (trimmed.startsWith('# ')) {
      htmlLines.push(`<h1>${formatInline(trimmed.slice(2))}</h1>`)
    }
    // Unordered list
    else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) {
        htmlLines.push('<ul>')
        inList = true
      }
      htmlLines.push(`<li>${formatInline(trimmed.slice(2))}</li>`)
    }
    // Ordered list
    else if (/^\d+\.\s/.test(trimmed)) {
      if (!inOrderedList) {
        htmlLines.push('<ol>')
        inOrderedList = true
      }
      htmlLines.push(`<li>${formatInline(trimmed.replace(/^\d+\.\s/, ''))}</li>`)
    }
    // Blockquote
    else if (trimmed.startsWith('> ')) {
      htmlLines.push(`<blockquote><p>${formatInline(trimmed.slice(2))}</p></blockquote>`)
    }
    // Horizontal rule
    else if (trimmed === '---' || trimmed === '***') {
      htmlLines.push('<hr>')
    }
    // Regular paragraph
    else {
      htmlLines.push(`<p>${formatInline(trimmed)}</p>`)
    }
  }

  // Close any open lists
  if (inList) htmlLines.push('</ul>')
  if (inOrderedList) htmlLines.push('</ol>')

  return htmlLines.join('')
}

function formatInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
}
