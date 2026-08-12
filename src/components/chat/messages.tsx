import { useCallback } from "react"
import type { UseChatHelpers } from "@ai-sdk/react"
import { ArrowDownIcon } from "lucide-react"
import type { ChatMessage, Vote } from "@/lib/chat-types"
import { cn } from "@/lib/utils"
import { useMessages } from "@/hooks/use-messages"
import { Button } from "@/components/ui/button"
import { Greeting } from "./greeting"
import { PreviewMessage, ThinkingMessage } from "./message"

type MessagesProps = {
  addToolApprovalResponse: UseChatHelpers<ChatMessage>["addToolApprovalResponse"]
  chatId: string
  status: UseChatHelpers<ChatMessage>["status"]
  votes: Vote[] | undefined
  messages: ChatMessage[]
  setMessages: UseChatHelpers<ChatMessage>["setMessages"]
  regenerate: UseChatHelpers<ChatMessage>["regenerate"]
  isReadonly: boolean
  isArtifactVisible: boolean
  isLoading?: boolean
  selectedModelId: string
  onEditMessage?: (message: ChatMessage) => void
}

export function Messages({ addToolApprovalResponse, chatId, messages, status, votes, setMessages, regenerate, isReadonly, onEditMessage, isLoading }: MessagesProps) {
  const { containerRef: messagesContainerRef, endRef: messagesEndRef, isAtBottom, scrollToBottom } = useMessages({ messages, status })
  const handleScrollToBottom = useCallback(() => scrollToBottom(), [scrollToBottom])
  const loading = isLoading || status === "submitted" || status === "streaming"

  return (
    <div className="relative min-h-0 flex-1 bg-background">
      {messages.length === 0 && !isLoading ? (
        <div className="flex min-h-full items-center justify-center pb-40">
          <Greeting />
        </div>
      ) : (
        <div className="absolute inset-0 overflow-y-auto" ref={messagesContainerRef}>
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-7 px-4 py-8">
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
            {status === "submitted" && <ThinkingMessage />}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}
      <Button aria-label="Scroll to latest message" className={cn("absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full", isAtBottom && "pointer-events-none invisible")} onClick={handleScrollToBottom} size="icon" type="button" variant="outline">
        <ArrowDownIcon className="size-4" />
      </Button>
    </div>
  )
}
