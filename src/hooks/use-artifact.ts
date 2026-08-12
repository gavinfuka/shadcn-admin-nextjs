'use client'

import { useCallback, useMemo } from 'react'
import useSWR from 'swr'
import type { UIArtifact } from '@/components/chat/artifact'

export const initialArtifactData: UIArtifact = {
  boundingBox: { height: 0, left: 0, top: 0, width: 0 },
  content: '',
  documentId: 'init',
  isVisible: false,
  kind: 'text',
  status: 'idle',
  title: '',
}

export function useArtifactSelector<Selected>(selector: (state: UIArtifact) => Selected) {
  const { data } = useSWR<UIArtifact>('artifact', null, { fallbackData: initialArtifactData })
  return useMemo(() => selector(data ?? initialArtifactData), [data, selector])
}

export function useArtifact() {
  const { data, mutate } = useSWR<UIArtifact>('artifact', null, { fallbackData: initialArtifactData })
  const artifact = data ?? initialArtifactData
  const setArtifact = useCallback(
    (updater: UIArtifact | ((current: UIArtifact) => UIArtifact)) => {
      void mutate((current) =>
        typeof updater === 'function' ? updater(current ?? initialArtifactData) : updater
      )
    },
    [mutate]
  )
  const metadataKey = artifact.documentId ? `artifact-metadata-${artifact.documentId}` : null
  const { data: metadata = null, mutate: setMetadata } = useSWR<unknown>(metadataKey, null)

  return useMemo(
    () => ({ artifact, metadata, setArtifact, setMetadata }),
    [artifact, metadata, setArtifact, setMetadata]
  )
}