'use client'

import { useState } from 'react'
import type { VisibilityType } from '@/lib/chat-types'
import { useChatVisibility } from '@/hooks/use-chat-visibility'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDownIcon, GlobeIcon, LockIcon } from './icons'

export type { VisibilityType } from '@/lib/chat-types'

export function VisibilitySelector({
  chatId,
  selectedVisibilityType,
}: {
  chatId: string
  selectedVisibilityType: VisibilityType
}) {
  const [open, setOpen] = useState(false)
  const { visibilityType, setVisibilityType } = useChatVisibility({
    chatId,
    initialVisibilityType: selectedVisibilityType,
  })
  return (
    <DropdownMenu onOpenChange={setOpen} open={open}>
      <DropdownMenuTrigger asChild>
        <Button size='sm' variant='outline'>
          {visibilityType === 'private' ? <LockIcon /> : <GlobeIcon />}
          <span className='hidden md:inline'>
            {visibilityType === 'private' ? 'Private' : 'Public'}
          </span>
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start'>
        <DropdownMenuItem onSelect={() => setVisibilityType('private')}>
          <LockIcon />
          Private (local session)
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setVisibilityType('public')}>
          <GlobeIcon />
          Public UI only
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
