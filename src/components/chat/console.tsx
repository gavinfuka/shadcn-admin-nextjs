'use client'

import { useState } from 'react'
import { ChevronDownIcon, TerminalIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type ConsoleOutput = {
  id?: string
  status: 'completed' | 'failed' | 'running'
  contents: Array<{ type: string; value: string }>
}

export function Console({ outputs = [] }: { outputs?: ConsoleOutput[] }) {
  const [open, setOpen] = useState(true)
  return (
    <section className='border-t bg-zinc-950 text-zinc-100'>
      <Button
        className='w-full justify-start text-zinc-300 hover:bg-zinc-900 hover:text-white'
        onClick={() => setOpen((value) => !value)}
        variant='ghost'
      >
        <TerminalIcon />
        Console
        <ChevronDownIcon className={open ? 'ml-auto rotate-180' : 'ml-auto'} />
      </Button>
      {open && (
        <pre className='max-h-52 overflow-auto px-4 pb-4 text-xs'>
          {outputs.length
            ? outputs
                .flatMap((output) =>
                  output.contents.map((content) => content.value)
                )
                .join('\n')
            : 'No output'}
        </pre>
      )}
    </section>
  )
}
