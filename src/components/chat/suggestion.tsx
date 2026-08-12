'use client'

import { Button } from '@/components/ui/button'

export function Suggestion({ suggestion, onApply }: { suggestion: string; onApply?: (suggestion: string) => void }) {
  return <Button className='h-auto whitespace-normal text-left' onClick={() => onApply?.(suggestion)} size='sm' type='button' variant='outline'>{suggestion}</Button>
}