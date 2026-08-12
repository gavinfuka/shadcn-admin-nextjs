'use client'

import { useRef } from 'react'
import type { ArtifactKind } from '@/lib/chat-types'
import { useArtifact } from '@/hooks/use-artifact'
import { CodeEditor } from './code-editor'
import { DocumentSkeleton } from './document-skeleton'
import {
  CodeIcon,
  FileIcon,
  FullscreenIcon,
  ImageIcon,
  LoaderIcon,
} from './icons'
import { ImageEditor } from './image-editor'
import { SpreadsheetEditor } from './sheet-editor'
import { Editor } from './text-editor'

type Output = {
  id: string
  title: string
  kind: ArtifactKind
  content?: string
}

export function DocumentPreview({
  result,
  args,
}: {
  isReadonly: boolean
  result?: Partial<Output>
  args?: Partial<Output> & { isUpdate?: boolean }
}) {
  const { artifact, setArtifact } = useArtifact()
  const hitboxRef = useRef<HTMLButtonElement>(null)
  const kind = result?.kind ?? args?.kind ?? artifact.kind
  const title =
    (result?.title ?? args?.title ?? artifact.title) || 'Untitled artifact'
  const content = result?.content ?? artifact.content
  const Icon =
    kind === 'image' ? ImageIcon : kind === 'code' ? CodeIcon : FileIcon
  if (!result && artifact.status !== 'streaming')
    return (
      <div className='w-full max-w-[450px] rounded-2xl border'>
        <DocumentSkeleton />
      </div>
    )
  const common = {
    content,
    currentVersionIndex: 0,
    isCurrentVersion: true,
    status: artifact.status,
    suggestions: [],
  }
  return (
    <div className='relative w-full max-w-[450px] overflow-hidden rounded-2xl border'>
      <button
        aria-label='Open artifact'
        className='absolute inset-0 z-10 cursor-pointer'
        onClick={() => {
          const rect = hitboxRef.current?.getBoundingClientRect()
          setArtifact((current) => ({
            ...current,
            documentId: result?.id ?? current.documentId,
            title,
            kind,
            content,
            isVisible: true,
            boundingBox: rect
              ? {
                  height: rect.height,
                  left: rect.left,
                  top: rect.top,
                  width: rect.width,
                }
              : current.boundingBox,
          }))
        }}
        ref={hitboxRef}
        type='button'
      >
        <FullscreenIcon className='absolute top-3 right-3' />
      </button>
      <header className='flex items-center gap-2 border-b px-4 py-3'>
        {artifact.status === 'streaming' ? (
          <LoaderIcon className='animate-spin' />
        ) : (
          <Icon />
        )}
        <span className='text-sm font-medium'>{title}</span>
      </header>
      <div className='relative h-64 overflow-hidden p-4'>
        {kind === 'text' ? (
          <Editor {...common} onSaveContent={() => {}} />
        ) : kind === 'code' ? (
          <CodeEditor {...common} onSaveContent={() => {}} />
        ) : kind === 'sheet' ? (
          <SpreadsheetEditor {...common} saveContent={() => {}} />
        ) : (
          <ImageEditor {...common} isInline title={title} />
        )}
      </div>
    </div>
  )
}
