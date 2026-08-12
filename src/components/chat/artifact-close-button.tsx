'use client'

import { Button } from '@/components/ui/button'
import { useArtifact } from '@/hooks/use-artifact'
import { CrossIcon } from './icons'

export function ArtifactCloseButton() {
  const { setArtifact } = useArtifact()
  return <Button aria-label='Close artifact' onClick={() => setArtifact((artifact) => ({ ...artifact, isVisible: false }))} size='icon' variant='ghost'><CrossIcon /></Button>
}