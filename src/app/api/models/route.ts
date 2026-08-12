import { chatModels } from '@/lib/chat-models'

export async function GET() {
  return Response.json({
    models: chatModels,
    capabilities: Object.fromEntries(
      chatModels.map((model) => [model.id, { reasoning: false, tools: false }])
    ),
  })
}
