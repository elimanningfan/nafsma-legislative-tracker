/**
 * Markdown-to-TipTap JSON converter utility
 * Converts markdown content into TipTap-compatible JSON format
 * Used by the content-seeder to transform Sunny's approved markdown copy
 */

interface TipTapNode {
  type: string
  content?: TipTapNode[]
  text?: string
  attrs?: Record<string, any>
  marks?: { type: string; attrs?: Record<string, any> }[]
}

export function markdownToTipTap(markdown: string): string {
  const doc: TipTapNode = {
    type: 'doc',
    content: [],
  }

  const lines = markdown.split('\n')
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Skip empty lines
    if (line.trim() === '') {
      i++
      continue
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/)
    if (headingMatch) {
      const level = headingMatch[1].length
      doc.content!.push({
        type: 'heading',
        attrs: { level },
        content: parseInlineMarks(headingMatch[2]),
      })
      i++
      continue
    }

    // Unordered list
    if (line.match(/^[-*]\s/)) {
      const items: TipTapNode[] = []
      while (i < lines.length && lines[i].match(/^[-*]\s/)) {
        const text = lines[i].replace(/^[-*]\s+/, '')
        items.push({
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: parseInlineMarks(text),
            },
          ],
        })
        i++
      }
      doc.content!.push({
        type: 'bulletList',
        content: items,
      })
      continue
    }

    // Ordered list
    if (line.match(/^\d+\.\s/)) {
      const items: TipTapNode[] = []
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        const text = lines[i].replace(/^\d+\.\s+/, '')
        items.push({
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: parseInlineMarks(text),
            },
          ],
        })
        i++
      }
      doc.content!.push({
        type: 'orderedList',
        content: items,
      })
      continue
    }

    // Blockquote
    if (line.startsWith('>')) {
      const text = line.replace(/^>\s?/, '')
      doc.content!.push({
        type: 'blockquote',
        content: [
          {
            type: 'paragraph',
            content: parseInlineMarks(text),
          },
        ],
      })
      i++
      continue
    }

    // Regular paragraph
    doc.content!.push({
      type: 'paragraph',
      content: parseInlineMarks(line),
    })
    i++
  }

  return JSON.stringify(doc)
}

function parseInlineMarks(text: string): TipTapNode[] {
  const nodes: TipTapNode[] = []
  // Simple inline parsing: bold (**text**), italic (*text*), links [text](url)
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(\[(.+?)\]\((.+?)\))|([^*[\]]+)/g
  let match

  while ((match = regex.exec(text)) !== null) {
    if (match[2]) {
      // Bold
      nodes.push({
        type: 'text',
        text: match[2],
        marks: [{ type: 'bold' }],
      })
    } else if (match[4]) {
      // Italic
      nodes.push({
        type: 'text',
        text: match[4],
        marks: [{ type: 'italic' }],
      })
    } else if (match[6] && match[7]) {
      // Link
      nodes.push({
        type: 'text',
        text: match[6],
        marks: [{ type: 'link', attrs: { href: match[7] } }],
      })
    } else if (match[8]) {
      // Plain text
      nodes.push({
        type: 'text',
        text: match[8],
      })
    }
  }

  if (nodes.length === 0) {
    nodes.push({ type: 'text', text: text || ' ' })
  }

  return nodes
}
