'use client'

import type { UseChatHelpers } from '@ai-sdk/react'
import { FileTextIcon, XIcon } from 'lucide-react'
import { type Dispatch, type SetStateAction, useState } from 'react'
import { codeArtifact } from '@/artifacts/code/client'
import { imageArtifact } from '@/artifacts/image/client'
import { sheetArtifact } from '@/artifacts/sheet/client'
import { textArtifact } from '@/artifacts/text/client'
import { Button } from '@/components/ui/button'
import { useArtifact } from '@/hooks/use-artifact'
import type { ArtifactKind, Attachment, ChatMessage, VisibilityType } from '@/lib/chat-types'
import { localChatPersistence } from './local-persistence'

export type UIArtifact = {
  title: string
  documentId: string
  kind: ArtifactKind
  content: string
  isVisible: boolean
  status: 'streaming' | 'idle'
  boundingBox: { top: number; left: number; width: number; height: number }
}

export const artifactDefinitions = [
  textArtifact,
  codeArtifact,
  imageArtifact,
  sheetArtifact,
]

export function Artifact({ status, stop }: {
  addToolApprovalResponse: UseChatHelpers<ChatMessage>['addToolApprovalResponse']
  chatId: string
  input: string
  setInput: Dispatch<SetStateAction<string>>
  status: UseChatHelpers<ChatMessage>['status']
  stop: UseChatHelpers<ChatMessage>['stop']
  attachments: Attachment[]
  setAttachments: Dispatch<SetStateAction<Attachment[]>>
  messages: ChatMessage[]
  setMessages: UseChatHelpers<ChatMessage>['setMessages']
  votes: undefined
  sendMessage: UseChatHelpers<ChatMessage>['sendMessage']
  regenerate: UseChatHelpers<ChatMessage>['regenerate']
  isReadonly: boolean
  selectedVisibilityType: VisibilityType
  selectedModelId: string
}) {
  const { artifact, setArtifact } = useArtifact()
  const [metadata, setMetadata] = useState<unknown>(null)
  if (!artifact.isVisible) return null
  const definition = artifactDefinitions.find((item) => item.kind === artifact.kind)
  if (!definition) return null
  const Content = definition.content
  const versions = localChatPersistence.getDocuments(artifact.documentId)
  const saveContent = (content: string) => {
    setArtifact((current) => ({ ...current, content }))
    localChatPersistence.saveDocument({ content, createdAt: new Date(), id: artifact.documentId, kind: artifact.kind, title: artifact.title })
  }

  return (
    <aside className='flex h-full min-w-0 flex-1 flex-col border-l bg-background md:w-[60%] md:flex-none'>
      <header className='flex h-14 items-center gap-3 border-b px-4'>
        <FileTextIcon className='size-4' />
        <div className='min-w-0 flex-1'>
          <p className='truncate text-sm font-medium'>{artifact.title || 'Untitled artifact'}</p>
          <p className='text-xs text-muted-foreground'>{artifact.status === 'streaming' ? 'Generating...' : `${artifact.kind} artifact, stored locally`}</p>
        </div>
        {status !== 'ready' && <Button onClick={() => stop()} size='sm' variant='outline'>Stop</Button>}
        <Button aria-label='Close artifact' onClick={() => setArtifact((current) => ({ ...current, isVisible: false }))} size='icon' variant='ghost'><XIcon /></Button>
      </header>
      <div className='min-h-0 flex-1 overflow-auto p-5'>
        <Content content={artifact.content} currentVersionIndex={Math.max(0, versions.length - 1)} getDocumentContentById={(index) => versions[index]?.content ?? ''} isCurrentVersion isInline={false} isLoading={false} metadata={metadata} mode='edit' onSaveContent={saveContent} setMetadata={setMetadata} status={artifact.status} suggestions={localChatPersistence.getSuggestions(artifact.documentId)} title={artifact.title} />
      </div>
      <div className='border-t px-4 py-2 text-xs text-muted-foreground'>Changes remain in this browser session. Server persistence is not configured.</div>
    </aside>
  )
}