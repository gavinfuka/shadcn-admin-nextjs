import type { SessionMessage } from "@anthropic-ai/claude-agent-sdk"
import type { UIMessage } from "ai"

type ToolCall = {
  name: string
  input: unknown
} & ({ state: "input-available" } | { state: "output-available"; output: unknown } | { state: "output-error"; errorText: string })

export function toUIMessages(sessionMessages: SessionMessage[]): UIMessage[] {
  const toolCallMap = buildToolCallMap(sessionMessages)
  const messages: UIMessage[] = []
  let activeAssistantMessage: UIMessage | undefined

  for (const [index, entry] of sessionMessages.entries()) {
    const message = toUIMessage(entry, index, toolCallMap)
    if (!message) continue

    if (message.role === "assistant") {
      if (activeAssistantMessage) {
        activeAssistantMessage.parts.push(...message.parts)
      } else {
        activeAssistantMessage = message
        messages.push(message)
      }
      continue
    }

    activeAssistantMessage = undefined
    messages.push(message)
  }

  return messages
}

export function toUIMessage(entry: SessionMessage, index: number, toolCallMap: Map<string, ToolCall>): UIMessage | null {
  const role = entry.type
  if (role !== "user" && role !== "assistant" && role !== "system") return null

  const parts = toUIMessageParts(entry.message, toolCallMap)
  if (parts.length === 0) return null

  return {
    id: entry.uuid ?? `msg-${index}`,
    role,
    metadata: {
      sessionId: entry.session_id,
      parentToolUseId: entry.parent_tool_use_id,
      parentAgentId: entry.parent_agent_id,
    },
    parts,
  }
}

export function buildToolCallMap(sessionMessages: SessionMessage[]): Map<string, ToolCall> {
  const map = new Map<string, ToolCall>()

  for (const entry of sessionMessages) {
    const blocks = extractContentBlocks(entry.message)
    for (const block of blocks) {
      if (block.type === "tool_use" && typeof block.id === "string") {
        map.set(block.id, {
          name: typeof block.name === "string" ? block.name : "unknown",
          input: block.input,
          state: "input-available",
        })
      }
    }
  }

  for (const entry of sessionMessages) {
    const blocks = extractContentBlocks(entry.message)
    for (const block of blocks) {
      if (block.type !== "tool_result" || typeof block.tool_use_id !== "string") {
        continue
      }

      const toolCall = map.get(block.tool_use_id)
      if (!toolCall) continue

      const output = extractToolResultOutput(block)
      map.set(
        block.tool_use_id,
        block.is_error === true
          ? {
              name: toolCall.name,
              input: toolCall.input,
              state: "output-error",
              errorText: stringifyToolResult(output),
            }
          : {
              name: toolCall.name,
              input: toolCall.input,
              state: "output-available",
              output,
            }
      )
    }
  }

  return map
}

function extractContentBlocks(message: SessionMessage["message"]) {
  if (!message || typeof message !== "object") return []

  const msg = message as Record<string, unknown>
  const content = msg.content

  if (typeof content === "string") return [{ type: "text", text: content }]

  if (Array.isArray(content)) {
    return content.filter((block): block is Record<string, unknown> => block !== null && typeof block === "object")
  }

  return []
}

function extractToolResultOutput(block: Record<string, unknown>): unknown {
  const content = block.content
  if (typeof content === "string") return content

  if (Array.isArray(content)) {
    const text = content
      .map((part) => {
        if (typeof part === "string") return part
        if (part && typeof part === "object") {
          const candidate = part as Record<string, unknown>
          if (typeof candidate.text === "string") return candidate.text
          if (typeof candidate.thinking === "string") return candidate.thinking
        }
        return ""
      })
      .filter(Boolean)
      .join("\n")

    return text || content
  }

  return content
}

function stringifyToolResult(value: unknown): string {
  if (typeof value === "string") return value

  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

function toUIMessageParts(message: SessionMessage["message"], toolCallMap: Map<string, ToolCall>): UIMessage["parts"] {
  const blocks = extractContentBlocks(message)
  const parts: UIMessage["parts"] = []

  for (const block of blocks) {
    const part = toUIPart(block, toolCallMap)
    if (part) parts.push(part)
  }

  return parts
}

function toUIPart(block: Record<string, unknown>, toolCallMap: Map<string, ToolCall>): UIMessage["parts"][number] | null {
  const type = block.type

  if (type === "text" && typeof block.text === "string") {
    return { type: "text", text: block.text }
  }

  if (type === "thinking" && typeof block.thinking === "string") {
    return {
      type: "reasoning",
      text: block.thinking,
    }
  }

  if (type === "redacted_thinking" && typeof block.data === "string") {
    return {
      type: "reasoning",
      text: "[redacted thinking]",
    }
  }

  if (type === "tool_use" && typeof block.id === "string") {
    const toolCall = toolCallMap.get(block.id)
    const toolName = toolCall?.name ?? (typeof block.name === "string" ? block.name : "unknown")
    const toolType: `tool-${string}` = `tool-${toolName}`
    const input = toolCall?.input ?? block.input

    if (toolCall?.state === "output-error") {
      return {
        type: toolType,
        toolCallId: block.id,
        state: "output-error",
        input,
        errorText: toolCall.errorText,
      }
    }

    if (toolCall?.state === "output-available") {
      return {
        type: toolType,
        toolCallId: block.id,
        state: "output-available",
        input,
        output: toolCall.output,
      }
    }

    return {
      type: toolType,
      toolCallId: block.id,
      state: "input-available",
      input,
    }
  }

  if (type === "tool_result") return null

  if (type === "image" && block.source && typeof block.source === "object") {
    const source = block.source as Record<string, unknown>
    if (source.type === "base64" && typeof source.data === "string" && typeof source.media_type === "string") {
      return {
        type: "file",
        mediaType: source.media_type,
        url: `data:${source.media_type};base64,${source.data}`,
      }
    }
  }

  return null
}
