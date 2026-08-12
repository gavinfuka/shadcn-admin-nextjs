'use client'

import {
  type ComponentProps,
  type HTMLAttributes,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { CheckIcon, CopyIcon } from 'lucide-react'
import type { BundledLanguage } from 'shiki'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const CodeBlockContext = createContext({ code: '' })

export const highlightCode = (code: string) => ({
  bg: 'transparent',
  fg: 'inherit',
  tokens: code.split('\n'),
})
export const CodeBlockContainer = ({
  className,
  language,
  ...props
}: HTMLAttributes<HTMLDivElement> & { language: string }) => (
  <div
    className={cn(
      'group relative w-full overflow-hidden rounded-md border bg-background text-foreground',
      className
    )}
    data-language={language}
    {...props}
  />
)
export const CodeBlockHeader = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex items-center justify-between border-b bg-muted/80 px-3 py-2 text-xs text-muted-foreground',
      className
    )}
    {...props}
  />
)
export const CodeBlockTitle = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex items-center gap-2', className)} {...props} />
)
export const CodeBlockFilename = ({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn('font-mono', className)} {...props} />
)
export const CodeBlockActions = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('-my-1 -mr-1 flex items-center gap-2', className)}
    {...props}
  />
)
export const CodeBlockContent = ({
  code,
  showLineNumbers = false,
}: {
  code: string
  language: BundledLanguage
  showLineNumbers?: boolean
}) => (
  <div className='relative overflow-auto'>
    <pre className='m-0 p-4 text-sm'>
      <code className='font-mono text-sm'>
        {code.split('\n').map((line, index) => (
          <span className='block' key={`${index}-${line}`}>
            {showLineNumbers ? `${index + 1}  ` : ''}
            {line || '\n'}
          </span>
        ))}
      </code>
    </pre>
  </div>
)
export const CodeBlock = ({
  code,
  language,
  showLineNumbers = false,
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  code: string
  language: BundledLanguage
  showLineNumbers?: boolean
}) => {
  const value = useMemo(() => ({ code }), [code])
  return (
    <CodeBlockContext.Provider value={value}>
      <CodeBlockContainer className={className} language={language} {...props}>
        {children}
        <CodeBlockContent
          code={code}
          language={language}
          showLineNumbers={showLineNumbers}
        />
      </CodeBlockContainer>
    </CodeBlockContext.Provider>
  )
}
export type CodeBlockCopyButtonProps = ComponentProps<typeof Button> & {
  onCopy?: () => void
  onError?: (error: Error) => void
  timeout?: number
}
export const CodeBlockCopyButton = ({
  onCopy,
  onError,
  timeout = 2000,
  children,
  ...props
}: CodeBlockCopyButtonProps) => {
  const { code } = useContext(CodeBlockContext)
  const [copied, setCopied] = useState(false)
  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      onCopy?.()
    } catch (error) {
      onError?.(error as Error)
    }
  }, [code, onCopy, onError])
  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), timeout)
    return () => window.clearTimeout(timer)
  }, [copied, timeout])
  return (
    <Button onClick={copy} size='icon' variant='ghost' {...props}>
      {children ?? (copied ? <CheckIcon /> : <CopyIcon />)}
    </Button>
  )
}
export type CodeBlockLanguageSelectorProps = ComponentProps<typeof Select>
export const CodeBlockLanguageSelector = (
  props: CodeBlockLanguageSelectorProps
) => <Select {...props} />
export const CodeBlockLanguageSelectorTrigger = (
  props: ComponentProps<typeof SelectTrigger>
) => <SelectTrigger {...props} />
export const CodeBlockLanguageSelectorValue = (
  props: ComponentProps<typeof SelectValue>
) => <SelectValue {...props} />
export const CodeBlockLanguageSelectorContent = (
  props: ComponentProps<typeof SelectContent>
) => <SelectContent {...props} />
export const CodeBlockLanguageSelectorItem = (
  props: ComponentProps<typeof SelectItem>
) => <SelectItem {...props} />
