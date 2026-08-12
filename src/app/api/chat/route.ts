import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from 'ai'
import type { ChatDataPart } from '@/lib/chat-types'

export async function POST(request: Request) {
  const body = (await request.json()) as { messages?: UIMessage[]; modelId?: string }
  const messages = body.messages ?? []
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
        writeData({ data: `# Generated locally for: ${prompt}\n\nprint('Connect a model provider to replace this demo.')\n`, type: 'data-codeDelta' })
        writeData({ data: null, type: 'data-finish' })
      }

      const id = crypto.randomUUID()
      writer.write({ id, type: 'text-start' })
      writer.write({
        delta: prompt
          ? `Demo response for: "${prompt}"\n\nConnect /api/chat to your model provider to replace this local adapter.`
          : 'The local chat adapter is ready.',
        id,
        type: 'text-delta',
      })
      writer.write({ id, type: 'text-end' })
    },
    originalMessages: messages,
  })

  return createUIMessageStreamResponse({ stream })
}