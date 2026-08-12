import { CheckCircleFillIcon, WarningIcon } from './icons'

export function ChatToast({
  type = 'success',
  children,
}: {
  type?: 'success' | 'error'
  children: React.ReactNode
}) {
  return (
    <div className='flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm shadow-lg'>
      {type === 'success' ? (
        <CheckCircleFillIcon className='text-emerald-600' />
      ) : (
        <WarningIcon className='text-destructive' />
      )}
      {children}
    </div>
  )
}
