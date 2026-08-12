import { useEffect, useRef } from 'react'
import type { UseChatHelpers } from '@ai-sdk/react'
import { ArrowDownIcon } from 'lucide-react'
import type { ChatMessage, Vote } from '@/lib/chat-types'
import { Button } from '@/components/ui/button'
import { Greeting } from './greeting'
import { PreviewMessage, ThinkingMessage } from './message'

type MessagesProps = {
  addToolApprovalResponse: UseChatHelpers<ChatMessage>['addToolApprovalResponse']
  chatId: string
  status: UseChatHelpers<ChatMessage>['status']
  votes: Vote[] | undefined
  messages: ChatMessage[]
  setMessages: UseChatHelpers<ChatMessage>['setMessages']
  regenerate: UseChatHelpers<ChatMessage>['regenerate']
  isReadonly: boolean
  isArtifactVisible: boolean
  isLoading?: boolean
  selectedModelId: string
  onEditMessage?: (message: ChatMessage) => void
}

export function Messages({
  addToolApprovalResponse,
  chatId,
  messages,
  status,
  votes,
  setMessages,
  regenerate,
  isReadonly,
  onEditMessage,
  isLoading,
}: MessagesProps) {
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [messages, status])
  const loading = isLoading || status === 'submitted' || status === 'streaming'

  return (
    <div className='relative min-h-0 flex-1 overflow-y-auto bg-background'>
      {messages.length === 0 && !isLoading ? (
        <div className='flex min-h-full items-center justify-center pb-40'>
          <Greeting />
        </div>
      ) : (
        <div className='mx-auto flex w-full max-w-4xl flex-col gap-7 px-4 py-8'>
          {messages.map((message, index) => (
            <PreviewMessage
              addToolApprovalResponse={addToolApprovalResponse}
              chatId={chatId}
              isLoading={loading && index === messages.length - 1}
              isReadonly={isReadonly}
              key={message.id}
              message={message}
              onEdit={onEditMessage}
              regenerate={regenerate}
              requiresScrollPadding={index === messages.length - 1}
              setMessages={setMessages}
              vote={votes?.find((vote) => vote.messageId === message.id)}
            />
          ))}
          {status === 'submitted' && <ThinkingMessage />}
          <div ref={endRef} />
        </div>
      )}
      <Button
        aria-label='Scroll to latest message'
        className='sr-only'
        size='icon'
        variant='outline'
      >
        <ArrowDownIcon />
      </Button>
    </div>
  )
}
