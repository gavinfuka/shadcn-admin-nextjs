'use client'

import type { UseChatHelpers } from '@ai-sdk/react'
import { useEffect } from 'react'
import type { ChatMessage } from '@/lib/chat-types'
import { useScrollToBottom } from './use-scroll-to-bottom'

export function useMessages({ messages, status }: { messages: ChatMessage[]; status: UseChatHelpers<ChatMessage>['status'] }) {
  const scroll = useScrollToBottom()
  useEffect(() => { if (scroll.isAtBottom || status === 'submitted') scroll.scrollToBottom() }, [messages, status, scroll])
  return scroll
}