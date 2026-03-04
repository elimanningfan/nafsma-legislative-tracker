import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'EDITOR'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { templateType, context } = await request.json()

    if (!templateType || !context) {
      return NextResponse.json(
        { error: 'templateType and context are required' },
        { status: 400 }
      )
    }

    const template = await prisma.contentTemplate.findUnique({
      where: { type: templateType },
    })

    if (!template) {
      return NextResponse.json(
        { error: `Template "${templateType}" not found` },
        { status: 404 }
      )
    }

    if (!template.isActive) {
      return NextResponse.json(
        { error: 'This template is currently disabled' },
        { status: 400 }
      )
    }

    const params = (template.generationParams as { temperature?: number; maxTokens?: number }) || {}
    const temperature = params.temperature ?? 0.7
    const maxTokens = params.maxTokens ?? 2000

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      temperature,
      system: template.systemPrompt,
      messages: [
        {
          role: 'user',
          content: context,
        },
      ],
    })

    const textContent = message.content.find((block) => block.type === 'text')
    const generatedText = textContent ? textContent.text : ''

    return NextResponse.json({
      content: generatedText,
      templateName: template.name,
      templateType: template.type,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      },
    })
  } catch (error: any) {
    console.error('AI generation error:', error)

    if (error?.status === 401) {
      return NextResponse.json(
        { error: 'Invalid API key. Check ANTHROPIC_API_KEY in environment.' },
        { status: 500 }
      )
    }

    if (error?.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment and try again.' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate content. Please try again.' },
      { status: 500 }
    )
  }
}
