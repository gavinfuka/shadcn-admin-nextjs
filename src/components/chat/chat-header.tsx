'use client'

import { PlusIcon, SparklesIcon } from 'lucide-react'
import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useActiveChat } from '@/hooks/use-active-chat'
import type { VisibilityType } from '@/lib/chat-types'

function PureChatHeader({
  chatId: _chatId,
  selectedVisibilityType: _selectedVisibilityType,
  isReadonly: _isReadonly,
}: {
  chatId: string
  selectedVisibilityType: VisibilityType
  isReadonly: boolean
}) {
  const { resetChat } = useActiveChat()

  return (
    <header className='flex h-14 shrink-0 items-center gap-2 border-b bg-sidebar px-3 sm:px-5'>
      <SidebarTrigger className='-ms-1' />
      <div className='h-5 w-px bg-border' />
      <SparklesIcon className='size-4' />
      <span className='text-sm font-medium'>AI Agent</span>
      <Button className='ml-auto' onClick={resetChat} size='sm' variant='outline'>
        <PlusIcon />
        <span className='hidden sm:inline'>New chat</span>
      </Button>
    </header>
  )
}

export const ChatHeader = memo(PureChatHeader)