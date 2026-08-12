'use client'

import type { Dispatch, ReactNode, SetStateAction } from 'react'
import type { UseChatHelpers } from '@ai-sdk/react'
import { XIcon } from 'lucide-react'
import type { ArtifactKind, ChatMessage } from '@/lib/chat-types'
import { Button } from '@/components/ui/button'
import { StopIcon } from './icons'

export function Toolbar({
  status,
  stop,
  artifactActions,
  onClose,
}: {
  isToolbarVisible: boolean
  setIsToolbarVisible: Dispatch<SetStateAction<boolean>>
  status: UseChatHelpers<ChatMessage>['status']
  sendMessage: UseChatHelpers<ChatMessage>['sendMessage']
  stop: UseChatHelpers<ChatMessage>['stop']
  setMessages: UseChatHelpers<ChatMessage>['setMessages']
  artifactKind: ArtifactKind
  consoleError?: string
  documentId?: string
  artifactActions?: ReactNode
  onClose?: () => void
}) {
  return (
    <div className='fixed right-6 bottom-6 z-50 flex flex-col rounded-2xl border bg-background p-1 shadow-lg'>
      {onClose && (
        <Button
          aria-label='Close toolbar'
          onClick={onClose}
          size='icon'
          variant='ghost'
        >
          <XIcon />
        </Button>
      )}
      {status === 'streaming' ? (
        <Button
          aria-label='Stop generation'
          onClick={() => stop()}
          size='icon'
          variant='ghost'
        >
          <StopIcon />
        </Button>
      ) : (
        artifactActions
      )}
    </div>
  )
}
