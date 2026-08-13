import { SDKMessage } from "@anthropic-ai/claude-agent-sdk"
import { UIMessageStreamWriter } from "ai"
import { EventStreamWriter } from "./event-stream-writer"

export type UiEventComponent = "thinking-step" | "tool-use"

export type UiSdkEvent = {
  eventType: string
  title: string
  abstract: string
  component: UiEventComponent
  timestamp?: string
  isError?: boolean
  isDenied?: boolean
  raw: SDKMessage
}

export type ClaudeUiStreamState = {
  blockIds: Map<number, string>
  blockTypes: Map<string, "text" | "reasoning" | "tool">
  statusReasoningId?: string
  streamedAssistantPending: boolean
  toolInputs: Map<string, string>
  toolNames: Map<string, string>
}

export function createClaudeUiStreamState(): ClaudeUiStreamState {
  return {
    blockIds: new Map(),
    blockTypes: new Map(),
    streamedAssistantPending: false,
    toolInputs: new Map(),
    toolNames: new Map(),
  }
}

function parseToolInput(input: string): unknown {
  try {
    return JSON.parse(input)
  } catch {
    return input
  }
}

function toolResultOutput(content: unknown): unknown {
  if (!Array.isArray(content)) return content

  const text = content
    .map((part) => {
      if (typeof part === "string") return part
      if (part && typeof part === "object" && "text" in part && typeof part.text === "string") return part.text
      return ""
    })
    .filter(Boolean)
    .join("\n")

  return text || content
}

export function claudeResponseToUiStream(message: SDKMessage, writer: UIMessageStreamWriter, state = createClaudeUiStreamState()) {
  const eventWriter = new EventStreamWriter<Record<string, unknown>>(writer)
  const messageId = message.uuid

  switch (message.type) {
    case "assistant": {
      const streamed = state.streamedAssistantPending
      message.message.content.forEach((block) => {
        if (block.type === "text" && !streamed) {
          eventWriter.text((block as { text: string }).text, { id: messageId })
        } else if (block.type === "thinking" && !streamed) {
          eventWriter.reasoning(block.thinking, { id: messageId })
        }
      })
      state.streamedAssistantPending = false
      break
    }

    case "stream_event": {
      const { event } = message

      if (event.type === "content_block_start") {
        if (event.content_block.type === "text") {
          const partId = `${message.uuid}-${event.index}`
          state.blockIds.set(event.index, partId)
          state.blockTypes.set(partId, "text")
          state.streamedAssistantPending = true
          eventWriter.write({ type: "text-start", id: partId })
          if (event.content_block.text) {
            eventWriter.write({
              type: "text-delta",
              id: partId,
              delta: event.content_block.text,
            })
          }
        } else if (event.content_block.type === "thinking") {
          if (state.statusReasoningId) {
            eventWriter.write({ type: "reasoning-end", id: state.statusReasoningId })
            state.statusReasoningId = undefined
          }
          const partId = `${message.uuid}-${event.index}`
          state.blockIds.set(event.index, partId)
          state.blockTypes.set(partId, "reasoning")
          state.streamedAssistantPending = true
          eventWriter.write({ type: "reasoning-start", id: partId })
          if (event.content_block.thinking) {
            eventWriter.write({
              type: "reasoning-delta",
              id: partId,
              delta: event.content_block.thinking,
            })
          }
        } else if (event.content_block.type === "tool_use") {
          const { id: toolCallId, name: toolName } = event.content_block
          state.blockIds.set(event.index, toolCallId)
          state.blockTypes.set(toolCallId, "tool")
          state.streamedAssistantPending = true
          state.toolInputs.set(toolCallId, "")
          state.toolNames.set(toolCallId, toolName)
          eventWriter.write({ type: "tool-input-start", toolCallId, toolName })
        }
      } else if (event.type === "content_block_delta") {
        const partId = state.blockIds.get(event.index)
        if (partId && event.delta.type === "text_delta") {
          eventWriter.write({
            type: "text-delta",
            id: partId,
            delta: event.delta.text,
          })
        } else if (partId && event.delta.type === "thinking_delta") {
          eventWriter.write({
            type: "reasoning-delta",
            id: partId,
            delta: event.delta.thinking,
          })
        } else if (partId && state.blockTypes.get(partId) === "tool" && event.delta.type === "input_json_delta") {
          state.toolInputs.set(partId, `${state.toolInputs.get(partId) ?? ""}${event.delta.partial_json}`)
          eventWriter.write({
            type: "tool-input-delta",
            toolCallId: partId,
            inputTextDelta: event.delta.partial_json,
          })
        }
      } else if (event.type === "content_block_stop") {
        const partId = state.blockIds.get(event.index)
        if (!partId) break

        const blockType = state.blockTypes.get(partId)
        if (blockType === "text") {
          eventWriter.write({ type: "text-end", id: partId })
        } else if (blockType === "reasoning") {
          eventWriter.write({ type: "reasoning-end", id: partId })
        } else if (blockType === "tool") {
          eventWriter.write({
            type: "tool-input-available",
            toolCallId: partId,
            toolName: state.toolNames.get(partId) ?? "tool",
            input: parseToolInput(state.toolInputs.get(partId) ?? ""),
          })
          state.toolInputs.delete(partId)
          state.toolNames.delete(partId)
        }
        state.blockTypes.delete(partId)
        state.blockIds.delete(event.index)
      }
      break
    }

    case "user": {
      if (!Array.isArray(message.message.content)) break

      for (const block of message.message.content) {
        if (block.type !== "tool_result") continue

        const output = message.tool_use_result ?? toolResultOutput(block.content)
        if (block.is_error) {
          eventWriter.write({
            type: "tool-output-error",
            toolCallId: block.tool_use_id,
            errorText: typeof output === "string" ? output : JSON.stringify(output),
          })
        } else {
          eventWriter.write({
            type: "tool-output-available",
            toolCallId: block.tool_use_id,
            output,
          })
        }
      }
      break
    }

    case "system": {
      if (message.subtype === "status") {
        if (message.status === "requesting" && !state.statusReasoningId) {
          state.statusReasoningId = `${message.uuid}-status`
          eventWriter.write({ type: "reasoning-start", id: state.statusReasoningId })
          eventWriter.write({ type: "reasoning-delta", id: state.statusReasoningId, delta: "Thinking..." })
        } else if (message.status === null && state.statusReasoningId) {
          eventWriter.write({ type: "reasoning-end", id: state.statusReasoningId })
          state.statusReasoningId = undefined
        }
        break
      }
      if (message.subtype === "init") {
        console.log("Available slash commands:", message.slash_commands)
        console.log(message.skills) // Lists loaded skills
      }
      const kind = typeof message.subtype === "string" ? (`claude-agent.system.${message.subtype}` as `${string}.${string}`) : ("claude-agent.system" as `${string}.${string}`)
      eventWriter.custom(kind)
      break
    }

    case "tool_progress": {
      break
    }

    case "tool_use_summary":
      break

    case "auth_status":
    case "prompt_suggestion":
    case "rate_limit_event":
    case "conversation_reset":
      eventWriter.custom(`claude-agent.${message.type}` as `${string}.${string}`)
      break

    default: {
      eventWriter.data({ name: "sdk-message", value: message })
      break
    }
  }
}

// default interval is 10 seconds
export async function preventTimeoutStream(writer: UIMessageStreamWriter, interval: number = 10000) {
  const eventWriter = new EventStreamWriter<Record<string, unknown>>(writer)
  const timer = setInterval(() => {
    console.log("Sending keep-alive message to prevent timeout")
    eventWriter.writeKeepAlive()
  }, interval)

  return () => clearInterval(timer)
}
