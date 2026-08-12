import { getChat, getSessionId } from '@/lib/chat-store'

export async function GET(request: Request) {
  const chatId = new URL(request.url).searchParams.get('chatId')
  if (!chatId)
    return Response.json({ error: 'chatId required' }, { status: 400 })
  const chat = getChat(getSessionId(request), chatId)
  return Response.json({
    isReadonly: false,
    messages: chat?.messages ?? [],
    userId: chat?.userId ?? null,
    visibility: chat?.visibility ?? 'private',
  })
}
