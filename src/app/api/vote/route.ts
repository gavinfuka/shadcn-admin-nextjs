import { z } from 'zod'
import { getSessionId, getVotes, setVote } from '@/lib/chat-store'

const voteSchema = z.object({
  chatId: z.string(),
  messageId: z.string(),
  type: z.enum(['up', 'down']),
})

export async function GET(request: Request) {
  const chatId = new URL(request.url).searchParams.get('chatId')
  if (!chatId)
    return Response.json({ error: 'chatId required' }, { status: 400 })
  return Response.json(getVotes(getSessionId(request), chatId))
}

export async function PATCH(request: Request) {
  const parsed = voteSchema.safeParse(await request.json())
  if (!parsed.success)
    return Response.json({ error: 'invalid vote' }, { status: 400 })
  const { chatId, messageId, type } = parsed.data
  const vote = setVote(getSessionId(request), chatId, {
    messageId,
    isUpvoted: type === 'up',
  })
  if (!vote) return Response.json({ error: 'chat not found' }, { status: 404 })
  return Response.json(vote)
}
