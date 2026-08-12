'use client'

import { useCallback, useState } from 'react'
import type { Attachment, ChatMessage } from '@/lib/chat-types'
import { useActiveChat } from '@/hooks/use-active-chat'
import { useArtifact } from '@/hooks/use-artifact'
import { Artifact } from './artifact'
import { ChatHeader } from './chat-header'
import { DataStreamHandler } from './data-stream-handler'
import { Messages } from './messages'
import { MultimodalInput } from './multimodal-input'

export function ChatShell() {
  const chat = useActiveChat()
  const { artifact } = useArtifact()
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null)
  const [attachments, setAttachments] = useState<Attachment[]>([])

  const handleEditMessage = useCallback(
    (message: ChatMessage) => {
      setEditingMessage(message)
      chat.setInput(
        message.parts
          .filter((part) => part.type === 'text')
          .map((part) => part.text)
          .join('')
      )
    },
    [chat]
  )

  const handleSendEditedMessage = useCallback(async () => {
    if (!editingMessage) return
    const index = chat.messages.findIndex(
      (message) => message.id === editingMessage.id
    )
    chat.setMessages(chat.messages.slice(0, index))
    setEditingMessage(null)
    await chat.sendMessage({
      parts: [{ text: chat.input, type: 'text' }],
      role: 'user',
    })
    chat.setInput('')
  }, [chat, editingMessage])

  return (
    <main className='flex h-svh min-h-0 w-full overflow-hidden bg-background'>
      <section
        className={
          artifact.isVisible
            ? 'flex min-w-0 flex-1 flex-col'
            : 'flex w-full min-w-0 flex-col'
        }
      >
        <ChatHeader
          chatId={chat.chatId}
          isReadonly={chat.isReadonly}
          selectedVisibilityType={chat.visibilityType}
        />
        <Messages
          addToolApprovalResponse={chat.addToolApprovalResponse}
          chatId={chat.chatId}
          isArtifactVisible={false}
          isLoading={chat.isLoading}
          isReadonly={chat.isReadonly}
          messages={chat.messages}
          onEditMessage={handleEditMessage}
          regenerate={chat.regenerate}
          selectedModelId={chat.currentModelId}
          setMessages={chat.setMessages}
          status={chat.status}
          votes={chat.votes}
        />
        <div className='shrink-0 bg-gradient-to-t from-background via-background to-transparent px-3 pt-5 pb-4 sm:px-6'>
          <div className='mx-auto w-full max-w-4xl'>
            <MultimodalInput
              attachments={attachments}
              chatId={chat.chatId}
              editingMessage={editingMessage}
              input={chat.input}
              isLoading={chat.isLoading}
              messages={chat.messages}
              onCancelEdit={() => {
                setEditingMessage(null)
                chat.setInput('')
              }}
              onModelChange={chat.setCurrentModelId}
              selectedModelId={chat.currentModelId}
              selectedVisibilityType={chat.visibilityType}
              sendMessage={
                editingMessage ? handleSendEditedMessage : chat.sendMessage
              }
              setAttachments={setAttachments}
              setInput={chat.setInput}
              setMessages={chat.setMessages}
              status={chat.status}
              stop={chat.stop}
            />
            <p className='mt-2 text-center text-[11px] text-muted-foreground'>
              AI can make mistakes. Check important information.
            </p>
          </div>
        </div>
      </section>
      <Artifact
        addToolApprovalResponse={chat.addToolApprovalResponse}
        attachments={attachments}
        chatId={chat.chatId}
        input={chat.input}
        isReadonly={chat.isReadonly}
        messages={chat.messages}
        regenerate={chat.regenerate}
        selectedModelId={chat.currentModelId}
        selectedVisibilityType={chat.visibilityType}
        sendMessage={chat.sendMessage}
        setAttachments={setAttachments}
        setInput={chat.setInput}
        setMessages={chat.setMessages}
        status={chat.status}
        stop={chat.stop}
        votes={chat.votes}
      />
      <DataStreamHandler />
    </main>
  )
}
