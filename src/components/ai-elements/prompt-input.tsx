'use client'

import type { ChatStatus, FileUIPart } from 'ai'
import { ArrowUpIcon, SquareIcon } from 'lucide-react'
import { type ComponentProps, type FormEvent, type HTMLAttributes, type PropsWithChildren, createContext, useContext, useMemo, useState } from 'react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea } from '@/components/ui/input-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

export interface AttachmentsContext { files: (FileUIPart & { id: string })[]; add: (files: File[] | FileList) => void; remove: (id: string) => void; clear: () => void; openFileDialog: () => void }
export interface TextInputContext { value: string; setInput: (value: string) => void; clear: () => void }
export interface PromptInputControllerProps { textInput: TextInputContext; attachments: AttachmentsContext }
const Controller = createContext<PromptInputControllerProps | null>(null)
export const usePromptInputController = () => { const value = useContext(Controller); if (!value) throw new Error('PromptInputProvider is required'); return value }
export const useProviderAttachments = () => usePromptInputController().attachments
export type PromptInputProviderProps = PropsWithChildren<{ initialInput?: string }>
export const PromptInputProvider = ({ initialInput = '', children }: PromptInputProviderProps) => {
  const [value, setInput] = useState(initialInput)
  const [files, setFiles] = useState<(FileUIPart & { id: string })[]>([])
  const attachments = useMemo<AttachmentsContext>(() => ({ files, add: (incoming) => setFiles((current) => [...current, ...Array.from(incoming).map((file) => ({ filename: file.name, id: crypto.randomUUID(), mediaType: file.type, type: 'file' as const, url: URL.createObjectURL(file) }))]), remove: (id) => setFiles((current) => current.filter((file) => file.id !== id)), clear: () => setFiles([]), openFileDialog: () => {} }), [files])
  const controller = useMemo(() => ({ attachments, textInput: { value, setInput, clear: () => setInput('') } }), [attachments, value])
  return <Controller.Provider value={controller}>{children}</Controller.Provider>
}
export const usePromptInputAttachments = useProviderAttachments
export interface PromptInputMessage { text: string; files: FileUIPart[] }
export type PromptInputProps = Omit<HTMLAttributes<HTMLFormElement>, 'onSubmit'> & { onSubmit: (message: PromptInputMessage, event: FormEvent<HTMLFormElement>) => void | Promise<void> }
export const PromptInput = ({ className, onSubmit, children, ...props }: PromptInputProps) => <form className={cn('w-full', className)} onSubmit={(event) => { event.preventDefault(); void onSubmit({ files: [], text: '' }, event) }} {...props}><InputGroup className='h-auto'>{children}</InputGroup></form>
export const PromptInputBody = (props: HTMLAttributes<HTMLDivElement>) => <div {...props} />
export const PromptInputTextarea = (props: ComponentProps<typeof InputGroupTextarea>) => <InputGroupTextarea name='message' {...props} />
export const PromptInputHeader = (props: ComponentProps<typeof InputGroupAddon>) => <InputGroupAddon align='block-start' {...props} />
export const PromptInputFooter = (props: ComponentProps<typeof InputGroupAddon>) => <InputGroupAddon align='block-end' {...props} />
export const PromptInputTools = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => <div className={cn('flex items-center gap-1', className)} {...props} />
export const PromptInputButton = (props: ComponentProps<typeof InputGroupButton>) => <InputGroupButton {...props} />
export const PromptInputSubmit = ({ status = 'ready', children, ...props }: ComponentProps<typeof InputGroupButton> & { status?: ChatStatus }) => <InputGroupButton aria-label={status === 'ready' ? 'Send' : 'Stop'} type='submit' {...props}>{children ?? (status === 'ready' ? <ArrowUpIcon /> : <SquareIcon />)}</InputGroupButton>
export const PromptInputActionMenu = (props: ComponentProps<typeof DropdownMenu>) => <DropdownMenu {...props} />
export const PromptInputActionMenuTrigger = (props: ComponentProps<typeof DropdownMenuTrigger>) => <DropdownMenuTrigger {...props} />
export const PromptInputActionMenuContent = (props: ComponentProps<typeof DropdownMenuContent>) => <DropdownMenuContent {...props} />
export const PromptInputActionMenuItem = (props: ComponentProps<typeof DropdownMenuItem>) => <DropdownMenuItem {...props} />
export const PromptInputSelect = (props: ComponentProps<typeof Select>) => <Select {...props} />
export const PromptInputSelectTrigger = (props: ComponentProps<typeof SelectTrigger>) => <SelectTrigger {...props} />
export const PromptInputSelectContent = (props: ComponentProps<typeof SelectContent>) => <SelectContent {...props} />
export const PromptInputSelectItem = (props: ComponentProps<typeof SelectItem>) => <SelectItem {...props} />
export const PromptInputSelectValue = (props: ComponentProps<typeof SelectValue>) => <SelectValue {...props} />
export const PromptInputCommand = (props: ComponentProps<typeof Command>) => <Command {...props} />
export const PromptInputCommandInput = (props: ComponentProps<typeof CommandInput>) => <CommandInput {...props} />
export const PromptInputCommandList = (props: ComponentProps<typeof CommandList>) => <CommandList {...props} />
export const PromptInputCommandEmpty = (props: ComponentProps<typeof CommandEmpty>) => <CommandEmpty {...props} />
export const PromptInputCommandGroup = (props: ComponentProps<typeof CommandGroup>) => <CommandGroup {...props} />
export const PromptInputCommandItem = (props: ComponentProps<typeof CommandItem>) => <CommandItem {...props} />
export const PromptInputCommandSeparator = (props: ComponentProps<typeof CommandSeparator>) => <CommandSeparator {...props} />