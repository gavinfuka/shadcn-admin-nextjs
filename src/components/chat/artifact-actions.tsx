'use client'

import { CopyIcon, DiffIcon, DownloadIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import type { UIArtifact } from './artifact'
import type { ArtifactActionContext } from './create-artifact'

export function ArtifactActions({
  artifact,
  handleVersionChange,
  mode,
}: {
  artifact: UIArtifact
  handleVersionChange: (type: 'next' | 'prev' | 'toggle' | 'latest') => void
  currentVersionIndex: number
  isCurrentVersion: boolean
  mode: 'edit' | 'diff'
  metadata: ArtifactActionContext['metadata']
  setMetadata: ArtifactActionContext['setMetadata']
}) {
  const copy = async () => {
    await navigator.clipboard.writeText(artifact.content)
    toast.success('Artifact copied')
  }
  const download = () => {
    const link = document.createElement('a')
    link.href = URL.createObjectURL(
      new Blob([artifact.content], { type: 'text/plain' })
    )
    link.download = `${artifact.title || 'artifact'}.${artifact.kind === 'code' ? 'py' : artifact.kind === 'sheet' ? 'csv' : 'txt'}`
    link.click()
    URL.revokeObjectURL(link.href)
  }
  return (
    <div className='flex flex-col gap-1'>
      <Button
        aria-label='Copy artifact'
        onClick={() => void copy()}
        size='icon'
        variant='ghost'
      >
        <CopyIcon />
      </Button>
      <Button
        aria-label='Download artifact'
        onClick={download}
        size='icon'
        variant='ghost'
      >
        <DownloadIcon />
      </Button>
      <Button
        aria-label='View changes'
        className={mode === 'diff' ? 'bg-muted' : undefined}
        onClick={() => handleVersionChange('toggle')}
        size='icon'
        variant='ghost'
      >
        <DiffIcon />
      </Button>
    </div>
  )
}
