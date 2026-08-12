import Image from 'next/image'
import type { Attachment } from '@/lib/chat-types'
import { Spinner } from '@/components/ui/spinner'
import { CrossSmallIcon } from './icons'

export function PreviewAttachment({ attachment, isUploading = false, onRemove }: { attachment: Attachment; isUploading?: boolean; onRemove?: () => void }) {
  return (
    <div className='group relative size-24 shrink-0 overflow-hidden rounded-xl border bg-muted' data-testid='input-attachment-preview'>
      {attachment.contentType.startsWith('image') ? (
        <Image alt={attachment.name || 'attachment'} className='size-full object-cover' height={96} src={attachment.url} unoptimized width={96} />
      ) : (
        <div className='flex size-full items-center justify-center px-2 text-center text-xs text-muted-foreground'>{attachment.name || 'File'}</div>
      )}
      {isUploading && <div className='absolute inset-0 flex items-center justify-center bg-black/40'><Spinner className='text-white' /></div>}
      {onRemove && !isUploading && <button aria-label='Remove attachment' className='absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100' onClick={onRemove} type='button'><CrossSmallIcon size={10} /></button>}
    </div>
  )
}