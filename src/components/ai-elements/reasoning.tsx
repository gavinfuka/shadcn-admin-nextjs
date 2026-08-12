'use client'

import {
  type ComponentProps,
  type HTMLAttributes,
  type ReactNode,
  createContext,
  memo,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { ChevronDownIcon } from 'lucide-react'
import { Streamdown } from 'streamdown'
import { cn } from '@/lib/utils'
import { Collapsible, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Shimmer } from './shimmer'

const ReasoningContext = createContext({
  duration: undefined as number | undefined,
  isOpen: false,
  isStreaming: false,
  setIsOpen: (_open: boolean) => {},
})
export const useReasoning = () => useContext(ReasoningContext)
export type ReasoningProps = ComponentProps<typeof Collapsible> & {
  isStreaming?: boolean
  duration?: number
}
export const Reasoning = memo(
  ({
    className,
    isStreaming = false,
    open,
    defaultOpen,
    onOpenChange,
    duration,
    children,
    ...props
  }: ReasoningProps) => {
    const [internalOpen, setInternalOpen] = useState(defaultOpen ?? isStreaming)
    const isOpen = open ?? (isStreaming || internalOpen)
    const setIsOpen = useCallback(
      (next: boolean) => {
        setInternalOpen(next)
        onOpenChange?.(next)
      },
      [onOpenChange]
    )
    const value = useMemo(
      () => ({ duration, isOpen, isStreaming, setIsOpen }),
      [duration, isOpen, isStreaming, setIsOpen]
    )
    return (
      <ReasoningContext.Provider value={value}>
        <Collapsible
          className={cn('not-prose', className)}
          onOpenChange={setIsOpen}
          open={isOpen}
          {...props}
        >
          {children}
        </Collapsible>
      </ReasoningContext.Provider>
    )
  }
)
export type ReasoningTriggerProps = ComponentProps<
  typeof CollapsibleTrigger
> & {
  getThinkingMessage?: (isStreaming: boolean, duration?: number) => ReactNode
}
export const ReasoningTrigger = memo(
  ({
    className,
    children,
    getThinkingMessage,
    ...props
  }: ReasoningTriggerProps) => {
    const { duration, isOpen, isStreaming } = useReasoning()
    const message =
      getThinkingMessage?.(isStreaming, duration) ??
      (isStreaming ? (
        <Shimmer>Thinking...</Shimmer>
      ) : (
        <span>Thought for {duration ?? 'a few'} seconds</span>
      ))
    return (
      <CollapsibleTrigger
        className={cn(
          'flex w-full items-center gap-2 text-[13px] text-muted-foreground',
          className
        )}
        {...props}
      >
        {children ?? (
          <>
            {message}
            <ChevronDownIcon
              className={cn(
                'size-4 transition-transform',
                isOpen && 'rotate-180'
              )}
            />
          </>
        )}
      </CollapsibleTrigger>
    )
  }
)
export type ReasoningContentProps = HTMLAttributes<HTMLDivElement> & {
  children: string
}
export const ReasoningContent = memo(
  ({ className, children, ...props }: ReasoningContentProps) => {
    const { isOpen } = useReasoning()
    if (!isOpen) return null
    return (
      <div
        className={cn(
          'mt-2 max-h-[200px] overflow-y-auto rounded-lg border bg-muted/30 px-3 py-2 text-xs text-muted-foreground',
          className
        )}
        {...props}
      >
        <Streamdown>{children}</Streamdown>
      </div>
    )
  }
)
Reasoning.displayName = 'Reasoning'
ReasoningTrigger.displayName = 'ReasoningTrigger'
ReasoningContent.displayName = 'ReasoningContent'
