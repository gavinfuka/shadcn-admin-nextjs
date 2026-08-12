import type { ComponentType, Dispatch, ReactNode, SetStateAction } from 'react'
import type { UseChatHelpers } from '@ai-sdk/react'
import type {
  ChatDataPart,
  ChatMessage,
  LocalSuggestion,
} from '@/lib/chat-types'
import type { UIArtifact } from './artifact'

export type ArtifactContentProps<Metadata = unknown> = {
  title: string
  content: string
  mode: 'edit' | 'diff'
  isCurrentVersion: boolean
  currentVersionIndex: number
  status: 'streaming' | 'idle'
  suggestions: LocalSuggestion[]
  onSaveContent: (updatedContent: string, debounce: boolean) => void
  isInline: boolean
  getDocumentContentById: (index: number) => string
  isLoading: boolean
  metadata: Metadata
  setMetadata: Dispatch<SetStateAction<Metadata>>
}

export type ArtifactActionContext<Metadata = unknown> = Pick<
  ArtifactContentProps<Metadata>,
  | 'content'
  | 'currentVersionIndex'
  | 'isCurrentVersion'
  | 'metadata'
  | 'setMetadata'
  | 'mode'
> & {
  handleVersionChange: (type: 'next' | 'prev' | 'toggle' | 'latest') => void
}
export type ArtifactToolbarContext = {
  sendMessage: UseChatHelpers<ChatMessage>['sendMessage']
}

export class ArtifactDefinition<Kind extends string, Metadata = unknown> {
  readonly kind: Kind
  readonly description: string
  readonly content: ComponentType<ArtifactContentProps<Metadata>>
  readonly actions: Array<{
    icon: ReactNode
    label?: string
    description: string
    onClick: (context: ArtifactActionContext<Metadata>) => void | Promise<void>
    isDisabled?: (context: ArtifactActionContext<Metadata>) => boolean
  }>
  readonly toolbar: Array<{
    description: string
    icon: ReactNode
    onClick: (context: ArtifactToolbarContext) => void
  }>
  readonly initialize?: (parameters: {
    documentId: string
    setMetadata: Dispatch<SetStateAction<Metadata>>
  }) => void
  readonly onStreamPart: (args: {
    setMetadata: Dispatch<SetStateAction<Metadata>>
    setArtifact: Dispatch<SetStateAction<UIArtifact>>
    streamPart: ChatDataPart
  }) => void

  constructor(config: Omit<ArtifactDefinition<Kind, Metadata>, 'constructor'>) {
    Object.assign(this, config)
    this.kind = config.kind
    this.description = config.description
    this.content = config.content
    this.actions = config.actions
    this.toolbar = config.toolbar
    this.initialize = config.initialize
    this.onStreamPart = config.onStreamPart
  }
}
