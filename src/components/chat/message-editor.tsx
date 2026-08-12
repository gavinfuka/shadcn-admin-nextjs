'use client'

import type { UseChatHelpers } from '@ai-sdk/react'
import type { ChatMessage } from '@/lib/chat-types'

export async function submitEditedMessage({ message, text, setMessages, regenerate }: { message: ChatMessage; text: string; setMessages: UseChatHelpers<ChatMessage>['setMessages']; regenerate: UseChatHelpers<ChatMessage>['regenerate'] }) {
  setMessages((messages) => {
    const index = messages.findIndex((item) => item.id === message.id)
    if (index === -1) return messages
    return [...messages.slice(0, index), { ...message, parts: [{ text, type: 'text' as const }] }]
  })
  await regenerate()
}