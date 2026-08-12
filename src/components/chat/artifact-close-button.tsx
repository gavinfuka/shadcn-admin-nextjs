'use client'

import { useArtifact } from '@/hooks/use-artifact'
import { Button } from '@/components/ui/button'
import { CrossIcon } from './icons'

export function ArtifactCloseButton() {
  const { setArtifact } = useArtifact()
  return (
    <Button
      aria-label='Close artifact'
      onClick={() =>
        setArtifact((artifact) => ({ ...artifact, isVisible: false }))
      }
      size='icon'
      variant='ghost'
    >
      <CrossIcon />
    </Button>
  )
}
