import type { SessionMessage } from "@anthropic-ai/claude-agent-sdk"
import { describe, expect, it } from "vitest"
import { buildToolCallMap, toUIMessage, toUIMessages } from "./session-message-mapper"

function sessionMessage(type: SessionMessage["type"], message: unknown, uuid = `${type}-message`): SessionMessage {
  return {
    type,
    uuid,
    session_id: "session-1",
    message,
    parent_tool_use_id: null,
    parent_agent_id: null,
  }
}

describe("toUIMessage", () => {
  it("maps identity, role, metadata, and string content", () => {
    expect(toUIMessage(sessionMessage("user", { content: "Hello" }, "user-1"), 0, new Map())).toEqual({
      id: "user-1",
      role: "user",
      metadata: {
        sessionId: "session-1",
        parentToolUseId: null,
        parentAgentId: null,
      },
      parts: [{ type: "text", text: "Hello" }],
    })
  })

  it("maps supported content blocks and ignores unsupported blocks", () => {
    const message = sessionMessage("assistant", {
      content: [
        { type: "text", text: "Answer" },
        { type: "thinking", thinking: "Reasoning" },
        { type: "redacted_thinking", data: "opaque-provider-data" },
        {
          type: "image",
          source: {
            type: "base64",
            media_type: "image/png",
            data: "aW1hZ2U=",
          },
        },
        { type: "unsupported", value: true },
      ],
    })

    expect(toUIMessage(message, 0, new Map())?.parts).toEqual([
      { type: "text", text: "Answer" },
      { type: "reasoning", text: "Reasoning" },
      { type: "reasoning", text: "[redacted thinking]" },
      {
        type: "file",
        mediaType: "image/png",
        url: "data:image/png;base64,aW1hZ2U=",
      },
    ])
  })

  it("correlates tool results with their tool calls", () => {
    const messages = [
      sessionMessage("assistant", {
        content: [{ type: "tool_use", id: "tool-1", name: "Read", input: { path: "a.ts" } }],
      }),
      sessionMessage("user", {
        content: [
          {
            type: "tool_result",
            tool_use_id: "tool-1",
            content: [{ type: "text", text: "contents" }],
          },
        ],
      }),
    ]
    const toolCallMap = buildToolCallMap(messages)

    expect(toUIMessage(messages[0], 0, toolCallMap)?.parts).toEqual([
      {
        type: "tool-Read",
        toolCallId: "tool-1",
        state: "output-available",
        input: { path: "a.ts" },
        output: "contents",
      },
    ])
    expect(toUIMessage(messages[1], 1, toolCallMap)).toBeNull()
  })

  it("maps failed tool results to the output-error state", () => {
    const messages = [
      sessionMessage("assistant", {
        content: [{ type: "tool_use", id: "tool-1", name: "Read", input: { path: "a.ts" } }],
      }),
      sessionMessage("user", {
        content: [
          {
            type: "tool_result",
            tool_use_id: "tool-1",
            is_error: true,
            content: [{ type: "text", text: "Permission denied" }],
          },
        ],
      }),
    ]
    const toolCallMap = buildToolCallMap(messages)

    expect(toUIMessage(messages[0], 0, toolCallMap)?.parts).toEqual([
      {
        type: "tool-Read",
        toolCallId: "tool-1",
        state: "output-error",
        input: { path: "a.ts" },
        errorText: "Permission denied",
      },
    ])
  })

  it("keeps a tool call pending when no result has been recorded", () => {
    const message = sessionMessage("assistant", {
      content: [{ type: "tool_use", id: "tool-1", name: "Read", input: { path: "a.ts" } }],
    })
    const toolCallMap = buildToolCallMap([message])

    expect(toUIMessage(message, 0, toolCallMap)?.parts).toEqual([
      {
        type: "tool-Read",
        toolCallId: "tool-1",
        state: "input-available",
        input: { path: "a.ts" },
      },
    ])
  })

  it("omits SDK messages with no renderable content", () => {
    expect(toUIMessage(sessionMessage("system", {}), 0, new Map())).toBeNull()
  })
})

describe("toUIMessages", () => {
  it("reconstructs one assistant turn from split SDK session records", () => {
    const sessionMessages = [
      sessionMessage("user", { role: "user", content: "Inspect the project" }, "user-1"),
      sessionMessage("assistant", { role: "assistant", content: [{ type: "text", text: "I will inspect it." }] }, "assistant-1"),
      sessionMessage(
        "assistant",
        {
          role: "assistant",
          content: [{ type: "tool_use", id: "tool-1", name: "Read", input: { file_path: "README.md" } }],
        },
        "assistant-2"
      ),
      sessionMessage(
        "user",
        {
          role: "user",
          content: [{ type: "tool_result", tool_use_id: "tool-1", content: "project details" }],
        },
        "tool-result-1"
      ),
      sessionMessage("assistant", { role: "assistant", content: [{ type: "text", text: "The project is ready." }] }, "assistant-3"),
    ]

    expect(toUIMessages(sessionMessages)).toEqual([
      {
        id: "user-1",
        role: "user",
        metadata: {
          sessionId: "session-1",
          parentToolUseId: null,
          parentAgentId: null,
        },
        parts: [{ type: "text", text: "Inspect the project" }],
      },
      {
        id: "assistant-1",
        role: "assistant",
        metadata: {
          sessionId: "session-1",
          parentToolUseId: null,
          parentAgentId: null,
        },
        parts: [
          { type: "text", text: "I will inspect it." },
          {
            type: "tool-Read",
            toolCallId: "tool-1",
            state: "output-available",
            input: { file_path: "README.md" },
            output: "project details",
          },
          { type: "text", text: "The project is ready." },
        ],
      },
    ])
  })
})
