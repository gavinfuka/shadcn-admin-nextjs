'use client'

import { type Dispatch, type SetStateAction, useRef } from 'react'
import type { UseChatHelpers } from '@ai-sdk/react'
import {
  ArrowUpIcon,
  ChevronDownIcon,
  PaperclipIcon,
  SquareIcon,
  XIcon,
} from 'lucide-react'
import { chatModels } from '@/lib/chat-models'
import type { Attachment, ChatMessage, VisibilityType } from '@/lib/chat-types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorGroup,
  ModelSelectorItem,
  ModelSelectorLogo,
  ModelSelectorName,
  ModelSelectorTrigger,
} from '@/components/ai-elements/model-selector'

export function MultimodalInput({
  input,
  setInput,
  status,
  stop,
  attachments,
  setAttachments,
  sendMessage,
  selectedModelId,
  onModelChange,
  editingMessage,
  onCancelEdit,
}: {
  chatId: string
  input: string
  setInput: Dispatch<SetStateAction<string>>
  status: UseChatHelpers<ChatMessage>['status']
  stop: () => void
  attachments: Attachment[]
  setAttachments: Dispatch<SetStateAction<Attachment[]>>
  messages: ChatMessage[]
  setMessages: UseChatHelpers<ChatMessage>['setMessages']
  sendMessage:
    | UseChatHelpers<ChatMessage>['sendMessage']
    | (() => Promise<void>)
  selectedVisibilityType: VisibilityType
  selectedModelId: string
  onModelChange?: (modelId: string) => void
  editingMessage?: ChatMessage | null
  onCancelEdit?: () => void
  isLoading?: boolean
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const selectedModel =
    chatModels.find((model) => model.id === selectedModelId) ?? chatModels[0]

  const submit = () => {
    if ((!input.trim() && attachments.length === 0) || status !== 'ready')
      return
    sendMessage({
      parts: [
        ...attachments.map((attachment) => ({
          mediaType: attachment.contentType,
          name: attachment.name,
          type: 'file' as const,
          url: attachment.url,
        })),
        { text: input, type: 'text' as const },
      ],
      role: 'user',
    })
    setInput('')
    setAttachments([])
  }

  return (
    <div className='relative flex w-full flex-col gap-2'>
      {editingMessage && (
        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
          Editing message{' '}
          <button onClick={onCancelEdit} type='button'>
            Cancel
          </button>
        </div>
      )}
      {attachments.length > 0 && (
        <div className='flex gap-2 overflow-x-auto'>
          {attachments.map((attachment) => (
            <div
              className='flex items-center gap-2 rounded-md border bg-card px-2 py-1 text-xs'
              key={attachment.url}
            >
              <span className='max-w-40 truncate'>{attachment.name}</span>
              <button
                aria-label='Remove attachment'
                onClick={() =>
                  setAttachments((items) =>
                    items.filter((item) => item.url !== attachment.url)
                  )
                }
                type='button'
              >
                <XIcon className='size-3' />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className='rounded-2xl border bg-card/80 p-2 shadow-sm focus-within:ring-1 focus-within:ring-ring'>
        <Textarea
          className='min-h-20 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent'
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              submit()
            }
          }}
          placeholder={
            editingMessage ? 'Edit your message...' : 'Ask anything...'
          }
          value={input}
        />
        <div className='flex items-center gap-1'>
          <input
            className='hidden'
            multiple
            onChange={(event) =>
              setAttachments(
                Array.from(event.target.files ?? []).map((file) => ({
                  contentType: file.type,
                  name: file.name,
                  url: URL.createObjectURL(file),
                }))
              )
            }
            ref={fileInputRef}
            type='file'
          />
          <Button
            aria-label='Attach files'
            onClick={() => fileInputRef.current?.click()}
            size='icon'
            type='button'
            variant='ghost'
          >
            <PaperclipIcon />
          </Button>
          <ModelSelector>
            <ModelSelectorTrigger asChild>
              <Button className='min-w-0' type='button' variant='ghost'>
                <ModelSelectorLogo provider={selectedModel.provider} />
                <span className='max-w-36 truncate'>{selectedModel.name}</span>
                <ChevronDownIcon />
              </Button>
            </ModelSelectorTrigger>
            <ModelSelectorContent>
              <ModelSelectorGroup heading='Models'>
                {chatModels.map((model) => (
                  <ModelSelectorItem
                    key={model.id}
                    onSelect={() => onModelChange?.(model.id)}
                    value={model.id}
                  >
                    <ModelSelectorLogo provider={model.provider} />
                    <ModelSelectorName>{model.name}</ModelSelectorName>
                  </ModelSelectorItem>
                ))}
              </ModelSelectorGroup>
            </ModelSelectorContent>
          </ModelSelector>
          <Button
            aria-label={status === 'ready' ? 'Send message' : 'Stop response'}
            className='ml-auto rounded-full'
            disabled={
              status === 'ready' && !input.trim() && attachments.length === 0
            }
            onClick={status === 'ready' ? submit : stop}
            size='icon'
            type='button'
          >
            {status === 'ready' ? (
              <ArrowUpIcon />
            ) : (
              <SquareIcon className='fill-current' />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
