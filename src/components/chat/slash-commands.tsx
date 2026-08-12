'use client'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

export const slashCommands = [
  { command: '/summarize', description: 'Summarize the current topic' },
  { command: '/write', description: 'Draft structured content' },
  { command: '/code', description: 'Create or explain code' },
]
export function SlashCommands({
  onSelect,
}: {
  onSelect: (command: string) => void
}) {
  return (
    <Command className='rounded-lg border shadow-md'>
      <CommandList>
        <CommandEmpty>No commands found</CommandEmpty>
        <CommandGroup heading='Commands'>
          {slashCommands.map((item) => (
            <CommandItem
              key={item.command}
              onSelect={() => onSelect(item.command)}
            >
              <span className='font-mono'>{item.command}</span>
              <span className='ml-2 text-muted-foreground'>
                {item.description}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
