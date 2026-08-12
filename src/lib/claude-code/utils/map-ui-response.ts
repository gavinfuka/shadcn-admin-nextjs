import { SDKMessage } from '@anthropic-ai/claude-agent-sdk'
import { UIMessageStreamWriter } from 'ai'
import { EventStreamWriter } from './event-stream-writer'

export type UiEventComponent = 'thinking-step' | 'tool-use'

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

export function claudeResponseToUiStream(
  message: SDKMessage,
  writer: UIMessageStreamWriter
) {
  const eventWriter = new EventStreamWriter<Record<string, unknown>>(writer)

  switch (message.type) {
    case 'assistant': {
      message.message.content.forEach((block) => {
        if (block.type === 'text') {
          eventWriter.text((block as { text: string }).text)
        } else if (block.type === 'thinking') {
          eventWriter.reasoning(block.thinking)
        }
      })
      break
    }

    case 'system': {
      if (message.subtype === 'init') {
        console.log('Available slash commands:', message.slash_commands)
        console.log(message.skills) // Lists loaded skills
      }
      const kind =
        typeof message.subtype === 'string'
          ? (`claude-agent.system.${message.subtype}` as `${string}.${string}`)
          : ('claude-agent.system' as `${string}.${string}`)
      eventWriter.custom(kind)
      break
    }

    case 'tool_progress': {
      const toolName =
        typeof message.tool_name === 'string' ? message.tool_name : 'tool'
      eventWriter.tool(toolName, { input: message })
      break
    }

    case 'tool_use_summary':
      console.log('Tool triggered:', message.summary)
      console.log(`Received SDK message of type: ${message.type}`)
      eventWriter.tool('tool', { input: {} }).result(JSON.stringify(message))
      break

    case 'auth_status':
    case 'prompt_suggestion':
    case 'rate_limit_event':
    case 'conversation_reset':
      eventWriter.custom(
        `claude-agent.${message.type}` as `${string}.${string}`
      )
      break

    default: {
      eventWriter.data({ name: 'sdk-message', value: message })
      break
    }
  }
}

// default interval is 10 seconds
export async function preventTimeoutStream(
  writer: UIMessageStreamWriter,
  interval: number = 10000
) {
  const eventWriter = new EventStreamWriter<Record<string, unknown>>(writer)
  const timer = setInterval(() => {
    console.log('Sending keep-alive message to prevent timeout')
    eventWriter.writeKeepAlive()
  }, interval)

  return () => clearInterval(timer)
}
