'use client'

import type { LocalSuggestion } from '@/lib/chat-types'
import { Textarea } from '@/components/ui/textarea'

export function Editor({ content, onSaveContent, status, suggestions }: { content: string; onSaveContent: (content: string, debounce: boolean) => void; status: 'streaming' | 'idle'; isCurrentVersion: boolean; currentVersionIndex: number; suggestions: LocalSuggestion[] }) {
  return <div className='space-y-3'><Textarea className='min-h-[60vh] resize-none border-0 bg-transparent font-serif text-base leading-7 shadow-none focus-visible:ring-0 dark:bg-transparent' onBlur={(event) => onSaveContent(event.currentTarget.value, false)} onChange={(event) => onSaveContent(event.target.value, true)} readOnly={status === 'streaming'} value={content} />{suggestions.length > 0 && <p className='text-xs text-muted-foreground'>{suggestions.length} local suggestion(s)</p>}</div>
}