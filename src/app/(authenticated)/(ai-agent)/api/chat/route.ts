import { SDKUserMessage } from "@anthropic-ai/claude-agent-sdk"
import { createUIMessageStream, createUIMessageStreamResponse, UIMessage, isTextUIPart } from "ai"
import { ClaudeCodeService } from "@/lib/claude-code/claude-code.service"
import { claudeResponseToUiStream, preventTimeoutStream } from "@/lib/claude-code/utils/map-ui-response"

async function* toSDKMessage(messages: UIMessage[]): AsyncIterable<SDKUserMessage> {
  const lastMessage = messages[messages.length - 1]
  const textContent = lastMessage.parts
    .filter(isTextUIPart)
    .map((part) => part.text)
    .join("")

  if (textContent) {
    yield {
      type: "user",
      message: {
        role: "user",
        content: textContent,
      },
      parent_tool_use_id: null,
    }
  }
}

export async function POST(req: Request) {
  const body = await req.json()
  const { messages }: { messages: UIMessage[] } = body
  const { country, category, topic, format = "Explainer", emotionalArc, model, allowBrandingStyle = false, allowResearch = false, mode, sessionId, sandboxId } = body

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      let finalOutput = ""

      const service = new ClaudeCodeService(sandboxId)
      service.setSession(sessionId)

      const cancelTimeout = await preventTimeoutStream(writer)

      for await (const message of service.query({
        prompt: toSDKMessage(messages),
        extraAllowedTools: [],
        mcpServers: {
          //   storyServer: storyServer,
        },
      })) {
        console.log(JSON.stringify(message))

        if (message.type == "result" && message.subtype === "success") {
          finalOutput = message?.result ?? ""
          const messageSessionId = message.session_id

          // Send sessionId to UI only when this request did not include one.
          if (!sessionId && messageSessionId) {
            writer.write({ type: "data-session-id", data: messageSessionId })
          }
        }

        claudeResponseToUiStream(message, writer)
      }

      if (finalOutput) {
        writer.write({ type: "text-start", id: "0" })
        writer.write({ type: "text-delta", id: "0", delta: finalOutput })
        writer.write({ type: "text-end", id: "0" })
        cancelTimeout()
      }
    },
    onError: (error) => {
      console.error("Copilot error:", error)
      return error instanceof Error ? error.message : "Unknown error"
    },
  })

  return createUIMessageStreamResponse({ stream })
}
