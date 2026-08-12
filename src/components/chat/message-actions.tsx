'use client'

import { toast } from 'sonner'
import type { ChatMessage, Vote } from '@/lib/chat-types'
import {
  MessageAction,
  MessageActions as Actions,
} from '@/components/ai-elements/message'
import { CopyIcon, PencilEditIcon, ThumbDownIcon, ThumbUpIcon } from './icons'

export function MessageActions({
  message,
  vote,
  isLoading,
  onEdit,
}: {
  chatId: string
  message: ChatMessage
  vote: Vote | undefined
  isLoading: boolean
  onEdit?: () => void
}) {
  if (isLoading) return null
  const text = message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('\n')
    .trim()
  const copy = async () => {
    if (!text) return toast.error("There's no text to copy")
    await navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }
  const voteLocally = (isUpvoted: boolean) =>
    toast.info(
      `${isUpvoted ? 'Upvote' : 'Downvote'} recorded for this session only`
    )

  return (
    <Actions className='opacity-0 transition-opacity group-hover/message:opacity-100'>
      {onEdit && (
        <MessageAction onClick={onEdit} tooltip='Edit'>
          <PencilEditIcon />
        </MessageAction>
      )}
      <MessageAction onClick={() => void copy()} tooltip='Copy'>
        <CopyIcon />
      </MessageAction>
      {message.role === 'assistant' && (
        <MessageAction
          disabled={vote?.isUpvoted}
          onClick={() => voteLocally(true)}
          tooltip='Upvote response'
        >
          <ThumbUpIcon />
        </MessageAction>
      )}
      {message.role === 'assistant' && (
        <MessageAction
          disabled={vote ? !vote.isUpvoted : false}
          onClick={() => voteLocally(false)}
          tooltip='Downvote response'
        >
          <ThumbDownIcon />
        </MessageAction>
      )}
    </Actions>
  )
}
