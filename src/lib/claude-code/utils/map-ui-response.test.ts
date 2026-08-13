import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk"
import type { UIMessageStreamWriter } from "ai"
import { describe, expect, it } from "vitest"
import { claudeResponseToUiStream, createClaudeUiStreamState } from "./map-ui-response"

function partialMessage(event: unknown, uuid: string): SDKMessage {
  return {
    type: "stream_event",
    event,
    parent_tool_use_id: null,
    session_id: "session-1",
    uuid,
  } as unknown as SDKMessage
}

function sdkMessage(message: unknown): SDKMessage {
  return message as SDKMessage
}

function recordingWriter() {
  const events: unknown[] = []
  const writer = {
    write: (event: unknown) => {
      events.push(event)
    },
  } as unknown as UIMessageStreamWriter

  return { events, writer }
}

describe("claudeResponseToUiStream", () => {
  it("maps partial text events to one incrementally updated text part", () => {
    const { events, writer } = recordingWriter()
    const state = createClaudeUiStreamState()

    claudeResponseToUiStream(
      partialMessage(
        {
          type: "content_block_start",
          index: 0,
          content_block: { type: "text", text: "", citations: null },
        },
        "stream-event-1"
      ),
      writer,
      state
    )
    claudeResponseToUiStream(
      partialMessage(
        {
          type: "content_block_delta",
          index: 0,
          delta: { type: "text_delta", text: "Hello" },
        },
        "stream-event-2"
      ),
      writer,
      state
    )
    claudeResponseToUiStream(
      partialMessage(
        {
          type: "content_block_delta",
          index: 0,
          delta: { type: "text_delta", text: " world" },
        },
        "stream-event-3"
      ),
      writer,
      state
    )
    claudeResponseToUiStream(partialMessage({ type: "content_block_stop", index: 0 }, "stream-event-4"), writer, state)
    claudeResponseToUiStream(
      {
        type: "assistant",
        message: {
          role: "assistant",
          content: [{ type: "text", text: "Hello world" }],
        },
        parent_tool_use_id: null,
        session_id: "session-1",
        uuid: "completed-assistant-message",
      } as unknown as SDKMessage,
      writer,
      state
    )

    expect(events).toEqual([
      { type: "text-start", id: "stream-event-1-0" },
      { type: "text-delta", id: "stream-event-1-0", delta: "Hello" },
      { type: "text-delta", id: "stream-event-1-0", delta: " world" },
      { type: "text-end", id: "stream-event-1-0" },
    ])
  })

  it("streams tool input and publishes the completed input", () => {
    const { events, writer } = recordingWriter()
    const state = createClaudeUiStreamState()

    claudeResponseToUiStream(
      partialMessage(
        {
          type: "content_block_start",
          index: 1,
          content_block: {
            type: "tool_use",
            id: "call-1",
            name: "Read",
            input: {},
          },
        },
        "stream-event-1"
      ),
      writer,
      state
    )
    claudeResponseToUiStream(
      partialMessage(
        {
          type: "content_block_delta",
          index: 1,
          delta: { type: "input_json_delta", partial_json: '{"file_' },
        },
        "stream-event-2"
      ),
      writer,
      state
    )
    claudeResponseToUiStream(
      partialMessage(
        {
          type: "content_block_delta",
          index: 1,
          delta: { type: "input_json_delta", partial_json: 'path":"README.md"}' },
        },
        "stream-event-3"
      ),
      writer,
      state
    )
    claudeResponseToUiStream(partialMessage({ type: "content_block_stop", index: 1 }, "stream-event-4"), writer, state)

    expect(events).toEqual([
      { type: "tool-input-start", toolCallId: "call-1", toolName: "Read" },
      { type: "tool-input-delta", toolCallId: "call-1", inputTextDelta: '{"file_' },
      { type: "tool-input-delta", toolCallId: "call-1", inputTextDelta: 'path":"README.md"}' },
      {
        type: "tool-input-available",
        toolCallId: "call-1",
        toolName: "Read",
        input: { file_path: "README.md" },
      },
    ])
  })

  it("maps tool results back to their streamed tool call", () => {
    const { events, writer } = recordingWriter()

    claudeResponseToUiStream(
      sdkMessage({
        type: "user",
        message: {
          role: "user",
          content: [
            {
              type: "tool_result",
              tool_use_id: "call-1",
              content: "README contents",
            },
          ],
        },
        parent_tool_use_id: null,
        session_id: "session-1",
        uuid: "tool-result-message",
      }),
      writer
    )

    expect(events).toEqual([
      {
        type: "tool-output-available",
        toolCallId: "call-1",
        output: "README contents",
      },
    ])
  })

  it("streams the SDK requesting status as a visible thinking phase", () => {
    const { events, writer } = recordingWriter()
    const state = createClaudeUiStreamState()

    claudeResponseToUiStream(
      sdkMessage({
        type: "system",
        subtype: "status",
        status: "requesting",
        session_id: "session-1",
        uuid: "status-1",
      }),
      writer,
      state
    )
    claudeResponseToUiStream(
      sdkMessage({
        type: "system",
        subtype: "status",
        status: null,
        session_id: "session-1",
        uuid: "status-2",
      }),
      writer,
      state
    )

    expect(events).toEqual([
      { type: "reasoning-start", id: "status-1-status" },
      { type: "reasoning-delta", id: "status-1-status", delta: "Thinking..." },
      { type: "reasoning-end", id: "status-1-status" },
    ])
  })
})
