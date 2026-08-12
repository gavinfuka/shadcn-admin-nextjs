import type { LocalDocument, LocalSuggestion, Vote } from '@/lib/chat-types'

const documents = new Map<string, LocalDocument[]>()
const suggestions = new Map<string, LocalSuggestion[]>()
const votes = new Map<string, Vote>()

export const localChatPersistence = {
  getDocuments: (id: string) => documents.get(id) ?? [],
  saveDocument(document: LocalDocument) {
    const versions = documents.get(document.id) ?? []
    documents.set(document.id, [...versions, document])
    return document
  },
  getSuggestions: (documentId: string) => suggestions.get(documentId) ?? [],
  saveSuggestions(documentId: string, next: LocalSuggestion[]) {
    suggestions.set(documentId, next)
    return next
  },
  getVote: (messageId: string) => votes.get(messageId),
  saveVote(vote: Vote) {
    votes.set(vote.messageId, vote)
    return vote
  },
}
