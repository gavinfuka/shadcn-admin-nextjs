import { ClaudeCodeService } from "@/lib/claude-code/claude-code.service"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const chatId = searchParams.get("chatId")
  if (!chatId) return Response.json({ error: "chatId required" }, { status: 400 })

  const sandboxId = searchParams.get("sandboxId") ?? "default"
  const { messages } = await new ClaudeCodeService(sandboxId).getSessionMessages(chatId)

  return Response.json({
    isReadonly: false,
    messages,
    userId: null,
    visibility: "private",
  })
}
