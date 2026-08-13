import { deleteAllChats, getSessionId } from "@/lib/chat-store"
import { ClaudeCodeService } from "@/lib/claude-code/claude-code.service"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? 10), 1), 50)
  const sandboxId = searchParams.get("sandboxId") ?? "default"
  const { sessions } = await new ClaudeCodeService(sandboxId).listSessions(sandboxId)
  const chats = sessions.map((session) => ({
    id: session.sessionId,
    title: session.customTitle ?? session.summary ?? session.firstPrompt ?? "New chat",
    updatedAt: session.lastModified,
  }))

  return Response.json(chats.slice(0, limit))
}

export async function DELETE(request: Request) {
  deleteAllChats(getSessionId(request))
  return Response.json({ deleted: true })
}
