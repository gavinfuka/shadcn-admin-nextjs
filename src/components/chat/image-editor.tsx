import { cn } from '@/lib/utils'
import { LoaderIcon } from './icons'

export function ImageEditor({ title, content, status, isInline }: { title: string; content: string; isCurrentVersion: boolean; currentVersionIndex: number; status: string; isInline: boolean }) {
  if (status === 'streaming') return <div className={cn('flex items-center justify-center gap-3', isInline ? 'h-52' : 'h-[calc(100dvh-60px)]')}><LoaderIcon className='animate-spin' />Generating image...</div>
  const source = content.startsWith('data:') || content.startsWith('http') ? content : `data:image/png;base64,${content}`
  return <div className='flex h-full items-center justify-center'><img alt={title} className='max-h-full max-w-full object-contain' src={source} /></div>
}