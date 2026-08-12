'use client'

import { ChatShell } from '@/components/chat/shell'
import { DataStreamProvider } from '@/components/chat/data-stream-provider'
import { ActiveChatProvider } from '@/hooks/use-active-chat'

export function AiAgent() {
  return (
    <DataStreamProvider>
      <ActiveChatProvider>
        <ChatShell />
      </ActiveChatProvider>
    </DataStreamProvider>
  )
}
