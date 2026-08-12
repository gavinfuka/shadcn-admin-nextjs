import type { UseChatHelpers } from '@ai-sdk/react'
import type { ChatMessage, Vote } from '@/lib/chat-types'
import { PreviewMessage } from './message'

export function ArtifactMessages({
  messages,
  votes,
  status,
  ...props
}: {
  chatId: string
  messages: ChatMessage[]
  votes: Vote[] | undefined
  status: UseChatHelpers<ChatMessage>['status']
  setMessages: UseChatHelpers<ChatMessage>['setMessages']
  regenerate: UseChatHelpers<ChatMessage>['regenerate']
  addToolApprovalResponse: UseChatHelpers<ChatMessage>['addToolApprovalResponse']
  isReadonly: boolean
}) {
  return (
    <div className='space-y-5 p-4'>
      {messages.map((message) => (
        <PreviewMessage
          {...props}
          chatId={props.chatId}
          isLoading={status === 'streaming'}
          key={message.id}
          message={message}
          requiresScrollPadding={false}
          vote={votes?.find((vote) => vote.messageId === message.id)}
        />
      ))}
    </div>
  )
}
