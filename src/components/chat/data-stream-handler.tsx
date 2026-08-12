'use client'

import { useEffect } from 'react'
import { initialArtifactData, useArtifact } from '@/hooks/use-artifact'
import { useDataStream } from './data-stream-provider'

export function DataStreamHandler() {
  const { dataStream, setDataStream, setWaitingStatus } = useDataStream()
  const { setArtifact } = useArtifact()

  useEffect(() => {
    if (dataStream.length === 0) return
    const deltas = dataStream.slice()
    setDataStream([])

    for (const delta of deltas) {
      if (delta.type === 'data-waiting-status') {
        setWaitingStatus(delta.data)
        continue
      }
      if (delta.type === 'data-chat-title') continue

      setArtifact((current) => {
        const artifact = current ?? initialArtifactData
        switch (delta.type) {
          case 'data-id':
            return {
              ...artifact,
              documentId: delta.data,
              isVisible: true,
              status: 'streaming',
            }
          case 'data-title':
            return {
              ...artifact,
              title: delta.data,
              isVisible: true,
              status: 'streaming',
            }
          case 'data-kind':
            return {
              ...artifact,
              kind: delta.data,
              isVisible: true,
              status: 'streaming',
            }
          case 'data-clear':
            return {
              ...artifact,
              content: '',
              isVisible: true,
              status: 'streaming',
            }
          case 'data-textDelta':
          case 'data-codeDelta':
          case 'data-imageDelta':
          case 'data-sheetDelta':
            return {
              ...artifact,
              content: artifact.content + delta.data,
              isVisible: true,
              status: 'streaming',
            }
          case 'data-finish':
            return { ...artifact, status: 'idle' }
        }
      })
    }
  }, [dataStream, setArtifact, setDataStream, setWaitingStatus])

  return null
}
