'use client'

import { Button } from '@/components/ui/button'

export function Suggestion({
  suggestion,
  onApply,
}: {
  suggestion: string
  onApply?: (suggestion: string) => void
}) {
  return (
    <Button
      className='h-auto text-left whitespace-normal'
      onClick={() => onApply?.(suggestion)}
      size='sm'
      type='button'
      variant='outline'
    >
      {suggestion}
    </Button>
  )
}
