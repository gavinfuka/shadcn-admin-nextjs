import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from 'ai'
import {
  appendMessages,
  createChat,
  deleteChat,
  getChat,
  getOrCreateSessionId,
  getSessionId,
  withSessionCookie,
} from '@/lib/chat-store'
import type { ChatDataPart } from '@/lib/chat-types'

export async function POST(request: Request) {
  const body = (await request.json()) as {
    id?: string
    messages?: UIMessage[]
    message?: UIMessage
    modelId?: string
    selectedChatModel?: string
    selectedVisibilityType?: 'private' | 'public'
  }
  const sessionId = getOrCreateSessionId(request)
  const chatId = body.id ?? crypto.randomUUID()
  const messages = body.messages ?? (body.message ? [body.message] : [])
  if (!getChat(sessionId, chatId)) {
    createChat(sessionId, {
      id: chatId,
      visibility: body.selectedVisibilityType,
    })
  }
  appendMessages(sessionId, chatId, messages)
  const lastMessage = messages[messages.length - 1]
  const prompt = lastMessage?.parts
    ?.filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join(' ')

  const stream = createUIMessageStream({
    execute({ writer }) {
      const writeData = (part: ChatDataPart) => writer.write(part)
      writeData({
        data: {
          message: 'Preparing a local demo response...',
          modelId: body.modelId ?? 'local-demo',
          modelName: 'Local demo adapter',
          phase: 'thinking',
        },
        type: 'data-waiting-status',
      })

      if (prompt && /\b(artifact|code|document)\b/i.test(prompt)) {
        const documentId = crypto.randomUUID()
        writeData({ data: documentId, type: 'data-id' })
        writeData({ data: 'Local demo artifact', type: 'data-title' })
        writeData({ data: 'code', type: 'data-kind' })
        writeData({ data: null, type: 'data-clear' })
        writeData({
          data: `# Generated locally for: ${prompt}\n\nprint('Connect a model provider to replace this demo.')\n`,
          type: 'data-codeDelta',
        })
        writeData({ data: null, type: 'data-finish' })
      }

      const id = crypto.randomUUID()
      const responseText = prompt
        ? `Demo response for: "${prompt}"\n\nConnect a model provider to replace this local adapter.`
        : 'The local chat adapter is ready.'
      writer.write({ id, type: 'text-start' })
      writer.write({
        delta: responseText,
        id,
        type: 'text-delta',
      })
      writer.write({ id, type: 'text-end' })
      appendMessages(sessionId, chatId, [
        {
          id,
          role: 'assistant',
          parts: [{ type: 'text', text: responseText }],
        },
      ])
    },
    originalMessages: messages,
  })

  return withSessionCookie(createUIMessageStreamResponse({ stream }), sessionId)
}

export async function DELETE(request: Request) {
  const chatId = new URL(request.url).searchParams.get('id')
  const sessionId = getSessionId(request)
  if (!chatId) return Response.json({ error: 'id required' }, { status: 400 })
  if (!deleteChat(sessionId, chatId)) {
    return Response.json({ error: 'not found' }, { status: 404 })
  }
  return Response.json({ deleted: true })
}
