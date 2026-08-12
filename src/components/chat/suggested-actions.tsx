'use client'

import type { UseChatHelpers } from '@ai-sdk/react'
import type { ChatMessage } from '@/lib/chat-types'
import { Suggestion } from './suggestion'

const prompts = [
  'Summarize a complex topic',
  'Help me draft an email',
  'Explain this code',
  'Plan a project',
]

export function SuggestedActions({
  sendMessage,
}: {
  chatId: string
  sendMessage: UseChatHelpers<ChatMessage>['sendMessage']
  selectedVisibilityType: string
}) {
  return (
    <div className='grid gap-2 sm:grid-cols-2'>
      {prompts.map((prompt) => (
        <Suggestion
          key={prompt}
          onApply={(text) =>
            void sendMessage({ role: 'user', parts: [{ type: 'text', text }] })
          }
          suggestion={prompt}
        />
      ))}
    </div>
  )
}
