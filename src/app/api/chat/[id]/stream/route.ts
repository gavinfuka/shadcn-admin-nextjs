import { getChat, getSessionId } from '@/lib/chat-store'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const chat = getChat(getSessionId(request), id)
  return chat
    ? Response.json({ status: 'complete', chatId: id })
    : Response.json({ error: 'stream not found' }, { status: 404 })
}
