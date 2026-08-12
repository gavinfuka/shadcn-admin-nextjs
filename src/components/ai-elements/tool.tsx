'use client'

import type { DynamicToolUIPart, ToolUIPart } from 'ai'
import { CheckCircleIcon, ChevronDownIcon, ClockIcon, WrenchIcon, XCircleIcon } from 'lucide-react'
import { type ComponentProps, type ReactNode, isValidElement } from 'react'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { CodeBlock } from './code-block'

export type ToolProps = ComponentProps<typeof Collapsible>
export const Tool = ({ className, ...props }: ToolProps) => <Collapsible className={cn('group not-prose mb-4 w-full rounded-md border', className)} {...props} />
export type ToolPart = ToolUIPart | DynamicToolUIPart
export type ToolHeaderProps = { title?: string; className?: string; type: ToolPart['type']; state: ToolPart['state']; toolName?: string }
const labels: Record<ToolPart['state'], string> = { 'approval-requested': 'Awaiting Approval', 'approval-responded': 'Responded', 'input-available': 'Running', 'input-streaming': 'Pending', 'output-available': 'Completed', 'output-denied': 'Denied', 'output-error': 'Error' }
export const getStatusBadge = (status: ToolPart['state']) => <Badge className='gap-1.5 rounded-full text-xs' variant='secondary'>{status === 'output-error' || status === 'output-denied' ? <XCircleIcon /> : status === 'output-available' ? <CheckCircleIcon /> : <ClockIcon />}{labels[status]}</Badge>
export const ToolHeader = ({ className, title, type, state, toolName, ...props }: ToolHeaderProps) => <CollapsibleTrigger className={cn('flex w-full items-center justify-between gap-4 p-3', className)} {...props}><div className='flex items-center gap-2'><WrenchIcon className='size-4' /><span className='text-sm font-medium'>{title ?? toolName ?? type.replace('tool-', '')}</span>{getStatusBadge(state)}</div><ChevronDownIcon className='size-4 group-data-[state=open]:rotate-180' /></CollapsibleTrigger>
export type ToolContentProps = ComponentProps<typeof CollapsibleContent>
export const ToolContent = ({ className, ...props }: ToolContentProps) => <CollapsibleContent className={cn('space-y-4 p-4', className)} {...props} />
export type ToolInputProps = ComponentProps<'div'> & { input: ToolPart['input'] }
export const ToolInput = ({ className, input, ...props }: ToolInputProps) => <div className={cn('space-y-2', className)} {...props}><h4 className='text-xs font-medium uppercase text-muted-foreground'>Parameters</h4><CodeBlock code={JSON.stringify(input, null, 2)} language='json' /></div>
export type ToolOutputProps = ComponentProps<'div'> & { output: ToolPart['output']; errorText: ToolPart['errorText'] }
export const ToolOutput = ({ className, output, errorText, ...props }: ToolOutputProps) => {
  if (!(output || errorText)) return null
  const rendered: ReactNode = isValidElement(output) ? output : <CodeBlock code={typeof output === 'string' ? output : JSON.stringify(output, null, 2)} language='json' />
  return <div className={cn('space-y-2', className)} {...props}><h4 className='text-xs font-medium uppercase text-muted-foreground'>{errorText ? 'Error' : 'Result'}</h4>{errorText ? <div className='text-destructive'>{errorText}</div> : rendered}</div>
}