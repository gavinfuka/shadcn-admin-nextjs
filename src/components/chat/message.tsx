"use client"

import type { UseChatHelpers } from "@ai-sdk/react"
import type { ChatMessage, Vote } from "@/lib/chat-types"
import { cn } from "@/lib/utils"
import { MessageContent, MessageResponse } from "@/components/ai-elements/message"
import { Shimmer } from "@/components/ai-elements/shimmer"
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from "@/components/ai-elements/tool"
import { DocumentPreview } from "./document-preview"
import { SparklesIcon } from "./icons"
import { MessageActions } from "./message-actions"
import { MessageReasoning } from "./message-reasoning"
import { PreviewAttachment } from "./preview-attachment"

export function PreviewMessage({
  addToolApprovalResponse: _approval,
  chatId,
  message,
  vote,
  isLoading,
  isReadonly,
  onEdit,
}: {
  addToolApprovalResponse: UseChatHelpers<ChatMessage>["addToolApprovalResponse"]
  chatId: string
  message: ChatMessage
  vote: Vote | undefined
  isLoading: boolean
  setMessages: UseChatHelpers<ChatMessage>["setMessages"]
  regenerate: UseChatHelpers<ChatMessage>["regenerate"]
  isReadonly: boolean
  requiresScrollPadding: boolean
  onEdit?: (message: ChatMessage) => void
}) {
  const parts = message.parts.map((part, index) => {
    const key = `${message.id}-${index}`
    if (part.type === "text")
      return (
        <MessageContent className={cn("text-[13px] leading-6", message.role === "user" && "w-fit max-w-[80%] rounded-2xl bg-muted px-3.5 py-2")} key={key}>
          <MessageResponse>{part.text}</MessageResponse>
        </MessageContent>
      )
    if (part.type === "reasoning") return <MessageReasoning isLoading={isLoading} key={key} reasoning={part.text} />
    if (part.type === "file")
      return (
        <PreviewAttachment
          attachment={{
            contentType: part.mediaType,
            name: part.filename ?? "file",
            url: part.url,
          }}
          key={key}
        />
      )
    if (part.type.startsWith("tool-")) {
      const toolPart = part as {
        type: `tool-${string}`
        state: "input-streaming" | "input-available" | "approval-requested" | "approval-responded" | "output-available" | "output-error" | "output-denied"
        input?: unknown
        output?: unknown
        errorText?: string
        toolCallId?: string
      }
      if ((part.type === "tool-createDocument" || part.type === "tool-updateDocument") && toolPart.output && typeof toolPart.output === "object")
        return (
          <DocumentPreview
            isReadonly={isReadonly}
            key={key}
            result={
              toolPart.output as {
                id: string
                title: string
                kind: "text" | "code" | "image" | "sheet"
                content?: string
              }
            }
          />
        )

      return (
        <Tool defaultOpen key={toolPart.toolCallId ?? key}>
          <ToolHeader state={toolPart.state} type={toolPart.type} />
          <ToolContent>
            {toolPart.input !== undefined && <ToolInput input={toolPart.input} />}
            {(toolPart.state === "output-available" || toolPart.state === "output-error") && <ToolOutput errorText={toolPart.errorText} output={toolPart.output} />}
          </ToolContent>
        </Tool>
      )
    }
    return null
  })
  return (
    <article className="group/message w-full" data-role={message.role}>
      <div className={cn("flex gap-3", message.role === "user" && "justify-end")}>
        {message.role === "assistant" && (
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted">
            <SparklesIcon size={13} />
          </span>
        )}
        <div className={cn("flex min-w-0 flex-col gap-2", message.role === "assistant" && "flex-1")}>
          {parts}
          <MessageActions chatId={chatId} isLoading={isLoading} message={message} onEdit={onEdit ? () => onEdit(message) : undefined} vote={vote} />
        </div>
      </div>
    </article>
  )
}

export function ThinkingMessage() {
  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      <SparklesIcon className="size-4" />
      <Shimmer>Thinking...</Shimmer>
    </div>
  )
}
