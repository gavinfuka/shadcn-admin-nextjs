import { getChat, getSessionId } from '@/lib/chat-store'

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get('id')
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })
  const chat = getChat(getSessionId(request), id)
  return chat
    ? Response.json({ id, title: chat.title, content: '', kind: 'text' })
    : Response.json({ error: 'not found' }, { status: 404 })
}
