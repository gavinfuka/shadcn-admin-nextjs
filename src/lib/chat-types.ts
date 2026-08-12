import type { UIMessage } from 'ai'

export type ChatMessage = UIMessage

export type Attachment = {
  name: string
  url: string
  contentType: string
}

export type VisibilityType = 'private' | 'public'

export type ArtifactKind = 'text' | 'code' | 'image' | 'sheet'

export type WaitingStatusData = {
  phase: 'waiting' | 'still-waiting' | 'health' | 'thinking'
  message: string
  modelId: string
  modelName: string
}

export type ChatDataPart =
  | { type: 'data-textDelta'; data: string }
  | { type: 'data-codeDelta'; data: string }
  | { type: 'data-imageDelta'; data: string }
  | { type: 'data-sheetDelta'; data: string }
  | { type: 'data-id'; data: string }
  | { type: 'data-title'; data: string }
  | { type: 'data-kind'; data: ArtifactKind }
  | { type: 'data-clear'; data: null }
  | { type: 'data-finish'; data: null }
  | { type: 'data-chat-title'; data: string }
  | { type: 'data-waiting-status'; data: WaitingStatusData }

export type LocalDocument = {
  id: string
  title: string
  content: string
  kind: ArtifactKind
  createdAt: Date
}

export type LocalSuggestion = {
  id: string
  documentId: string
  originalText: string
  suggestedText: string
  description?: string
  isResolved: boolean
}

export type Vote = {
  messageId: string
  isUpvoted: boolean
}
