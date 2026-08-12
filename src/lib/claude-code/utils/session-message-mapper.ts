import type { SessionMessage } from '@anthropic-ai/claude-agent-sdk'
import type { UIMessage } from 'ai'

export function toUIMessage(
  entry: SessionMessage,
  index: number,
  toolCallMap: Map<string, { name: string; input: unknown }>
): UIMessage | null {
  if (!entry || typeof entry !== 'object') return null

  const role = entry.type
  if (role !== 'user' && role !== 'assistant' && role !== 'system') return null

  const rawMessage = (entry.message ?? {}) as Record<string, unknown>
  const parts = toUIMessageParts(rawMessage, toolCallMap)

  if (parts.length === 0) {
    parts.push({ type: 'text', text: '' } as UIMessage['parts'][number])
  }

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

export function buildToolCallMap(
  sessionMessages: SessionMessage[]
): Map<string, { name: string; input: unknown }> {
  const map = new Map<string, { name: string; input: unknown }>()
  for (const entry of sessionMessages) {
    const blocks = extractContentBlocks(entry.message)
    for (const block of blocks) {
      if (block.type === 'tool_use' && typeof block.id === 'string') {
        map.set(block.id, {
          name: typeof block.name === 'string' ? block.name : 'unknown',
          input: block.input,
        })
      }
    }
  }
  return map
}

function extractContentBlocks(
  message: unknown
): Array<Record<string, unknown>> {
  if (!message || typeof message !== 'object') return []

  const msg = message as Record<string, unknown>
  const content = msg.content

  if (typeof content === 'string') {
    return content.trim() ? [{ type: 'text', text: content }] : []
  }

  if (Array.isArray(content)) {
    return content.filter(
      (block): block is Record<string, unknown> =>
        block !== null && typeof block === 'object'
    )
  }

  return []
}

function extractToolResultOutput(block: Record<string, unknown>): unknown {
  const content = block.content
  if (typeof content === 'string') return content

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') return part
        if (part && typeof part === 'object') {
          const candidate = part as Record<string, unknown>
          if (typeof candidate.text === 'string') return candidate.text
          if (typeof candidate.thinking === 'string') return candidate.thinking
        }
        return ''
      })
      .filter(Boolean)
      .join('\n')
  }

  return content
}

function toUIMessageParts(
  message: Record<string, unknown>,
  toolCallMap: Map<string, { name: string; input: unknown }>
): UIMessage['parts'] {
  const blocks = extractContentBlocks(message)
  const parts: UIMessage['parts'] = []

  for (const block of blocks) {
    const part = toUIPart(block, toolCallMap)
    if (part) parts.push(part)
  }

  return parts
}

function toUIPart(
  block: Record<string, unknown>,
  toolCallMap: Map<string, { name: string; input: unknown }>
): UIMessage['parts'][number] | null {
  const type = block.type

  if (type === 'text' && typeof block.text === 'string') {
    return { type: 'text', text: block.text } as UIMessage['parts'][number]
  }

  if (type === 'thinking' && typeof block.thinking === 'string') {
    return {
      type: 'reasoning',
      text: block.thinking,
    } as UIMessage['parts'][number]
  }

  if (type === 'redacted_thinking' && typeof block.data === 'string') {
    return {
      type: 'reasoning',
      text: '[redacted thinking]',
    } as UIMessage['parts'][number]
  }

  if (type === 'tool_use' && typeof block.id === 'string') {
    return {
      type: 'dynamic-tool',
      toolName: typeof block.name === 'string' ? block.name : 'unknown',
      toolCallId: block.id,
      state: 'input-available',
      input: block.input,
    } as UIMessage['parts'][number]
  }

  if (type === 'tool_result' && typeof block.tool_use_id === 'string') {
    const toolCall = toolCallMap.get(block.tool_use_id)
    const output = extractToolResultOutput(block)

    return {
      type: 'dynamic-tool',
      toolName: toolCall?.name ?? 'unknown',
      toolCallId: block.tool_use_id,
      state: 'output-available',
      input: toolCall?.input,
      output,
    } as UIMessage['parts'][number]
  }

  if (type === 'image' && block.source && typeof block.source === 'object') {
    const source = block.source as Record<string, unknown>
    if (
      source.type === 'base64' &&
      typeof source.data === 'string' &&
      typeof source.media_type === 'string'
    ) {
      return {
        type: 'file',
        mediaType: source.media_type,
        url: `data:${source.media_type};base64,${source.data}`,
      } as UIMessage['parts'][number]
    }
  }

  return null
}
