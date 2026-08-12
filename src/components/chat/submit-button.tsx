import type { ChatStatus } from 'ai'
import { Button } from '@/components/ui/button'
import { ArrowUpIcon, StopIcon } from './icons'

export function SubmitButton({
  status,
  submitForm,
  stop,
  disabled,
}: {
  status: ChatStatus
  submitForm: () => void
  stop: () => void
  disabled?: boolean
}) {
  const running = status === 'submitted' || status === 'streaming'
  return (
    <Button
      aria-label={running ? 'Stop response' : 'Send message'}
      className='rounded-full'
      disabled={!running && disabled}
      onClick={running ? stop : submitForm}
      size='icon'
      type='button'
    >
      {running ? <StopIcon className='fill-current' /> : <ArrowUpIcon />}
    </Button>
  )
}
