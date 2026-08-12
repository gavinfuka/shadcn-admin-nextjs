'use client'

import { ActiveChatProvider } from '@/hooks/use-active-chat'
import { DataStreamProvider } from '@/components/chat/data-stream-provider'
import { ChatShell } from '@/components/chat/shell'

export function AiAgent() {
  return (
    <DataStreamProvider>
      <ActiveChatProvider>
        <ChatShell />
      </ActiveChatProvider>
    </DataStreamProvider>
  )
}
