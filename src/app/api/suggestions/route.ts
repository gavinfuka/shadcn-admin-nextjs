import { getChat, getSessionId } from '@/lib/chat-store'

export async function GET(request: Request) {
  const chatId = new URL(request.url).searchParams.get('chatId')
  const chat = chatId ? getChat(getSessionId(request), chatId) : undefined
  return Response.json(chat?.messages ?? [])
}
