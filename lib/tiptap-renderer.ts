/**
 * Server-side TipTap JSON-to-HTML renderer.
 * Converts TipTap ProseMirror JSON into clean HTML for rendering with prose styles.
 */

type TipTapNode = {
  type: string
  content?: TipTapNode[]
  text?: string
  attrs?: Record<string, any>
  marks?: { type: string; attrs?: Record<string, any> }[]
}

function renderMarks(text: string, marks?: { type: string; attrs?: Record<string, any> }[]): string {
  if (!marks || marks.length === 0) return escapeHtml(text)

  let result = escapeHtml(text)
  for (const mark of marks) {
    switch (mark.type) {
      case 'bold':
        result = `<strong>${result}</strong>`
        break
      case 'italic':
        result = `<em>${result}</em>`
        break
      case 'underline':
        result = `<u>${result}</u>`
        break
      case 'strike':
        result = `<s>${result}</s>`
        break
      case 'code':
        result = `<code>${result}</code>`
        break
      case 'link':
        const href = mark.attrs?.href || '#'
        const target = mark.attrs?.target || '_blank'
        result = `<a href="${escapeAttr(href)}" target="${target}" rel="noopener noreferrer">${result}</a>`
        break
    }
  }
  return result
}

function renderNode(node: TipTapNode): string {
  if (node.type === 'text') {
    return renderMarks(node.text || '', node.marks)
  }

  const children = (node.content || []).map(renderNode).join('')

  switch (node.type) {
    case 'doc':
      return children

    case 'paragraph':
      return `<p>${children}</p>`

    case 'heading': {
      const level = node.attrs?.level || 2
      return `<h${level}>${children}</h${level}>`
    }

    case 'bulletList':
      return `<ul>${children}</ul>`

    case 'orderedList':
      return `<ol>${children}</ol>`

    case 'listItem':
      return `<li>${children}</li>`

    case 'blockquote':
      return `<blockquote>${children}</blockquote>`

    case 'codeBlock':
      return `<pre><code>${children}</code></pre>`

    case 'horizontalRule':
      return '<hr />'

    case 'hardBreak':
      return '<br />'

    case 'image': {
      const src = node.attrs?.src || ''
      const alt = node.attrs?.alt || ''
      const title = node.attrs?.title || ''
      return `<img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}"${title ? ` title="${escapeAttr(title)}"` : ''} />`
    }

    case 'table':
      return `<table>${children}</table>`
    case 'tableRow':
      return `<tr>${children}</tr>`
    case 'tableHeader':
      return `<th>${children}</th>`
    case 'tableCell':
      return `<td>${children}</td>`

    default:
      return children
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function escapeAttr(str: string): string {
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

/**
 * Convert TipTap JSON (string or object) to HTML string.
 */
export function tiptapToHtml(content: string | object | null | undefined): string {
  if (!content) return ''

  // If it's already HTML (starts with <), return as-is
  if (typeof content === 'string' && content.trim().startsWith('<')) {
    return content
  }

  let doc: TipTapNode
  try {
    doc = typeof content === 'string' ? JSON.parse(content) : (content as TipTapNode)
  } catch {
    // If it's not valid JSON and not HTML, return as plain text wrapped in a paragraph
    return `<p>${escapeHtml(String(content))}</p>`
  }

  if (doc.type !== 'doc') {
    return `<p>${escapeHtml(String(content))}</p>`
  }

  return renderNode(doc)
}
