import { deleteAllChats, getSessionId, listChats } from '@/lib/chat-store'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = Math.min(
    Math.max(Number(searchParams.get('limit') ?? 10), 1),
    50
  )
  const chats = listChats(getSessionId(request))
  return Response.json(chats.slice(0, limit))
}

export async function DELETE(request: Request) {
  deleteAllChats(getSessionId(request))
  return Response.json({ deleted: true })
}
