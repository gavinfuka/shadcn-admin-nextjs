'use client'

import { memo } from 'react'
import { toast } from 'sonner'
import type { ArtifactKind } from '@/lib/chat-types'
import { useArtifact } from '@/hooks/use-artifact'
import { FileIcon, LoaderIcon, MessageIcon, PencilEditIcon } from './icons'

type Result = { id: string; title: string; kind: ArtifactKind }

export const DocumentToolResult = memo(function DocumentToolResult({
  type,
  result,
  isReadonly,
}: {
  type: 'create' | 'update' | 'request-suggestions'
  result: Result
  isReadonly: boolean
}) {
  const { setArtifact } = useArtifact()
  const Icon =
    type === 'create'
      ? FileIcon
      : type === 'update'
        ? PencilEditIcon
        : MessageIcon
  return (
    <button
      className='flex items-center gap-2 rounded-xl border bg-background px-3 py-2 text-left'
      onClick={(event) => {
        if (isReadonly)
          return toast.error('Viewing shared artifacts is not supported')
        const rect = event.currentTarget.getBoundingClientRect()
        setArtifact((current) => ({
          ...current,
          boundingBox: {
            height: rect.height,
            left: rect.left,
            top: rect.top,
            width: rect.width,
          },
          documentId: result.id,
          isVisible: true,
          kind: result.kind,
          title: result.title,
        }))
      }}
      type='button'
    >
      <Icon />
      {type === 'create'
        ? 'Created'
        : type === 'update'
          ? 'Updated'
          : 'Added suggestions to'}{' '}
      &quot;{result.title}&quot;
    </button>
  )
})

export const DocumentToolCall = memo(function DocumentToolCall({
  type,
  args,
  isReadonly,
}: {
  type: 'create' | 'update' | 'request-suggestions'
  args: {
    title?: string
    kind?: ArtifactKind
    id?: string
    description?: string
    documentId?: string
  }
  isReadonly: boolean
}) {
  const { setArtifact } = useArtifact()
  return (
    <button
      className='flex items-center gap-3 rounded-xl border px-3 py-2'
      disabled={isReadonly}
      onClick={() =>
        setArtifact((current) => ({ ...current, isVisible: true }))
      }
      type='button'
    >
      <span>
        {type === 'create'
          ? `Creating “${args.title ?? 'document'}”`
          : type === 'update'
            ? `Updating “${args.description ?? 'document'}”`
            : 'Adding suggestions'}
      </span>
      <LoaderIcon className='animate-spin' />
    </button>
  )
})
