import type { UIMessage } from 'ai'
import type { ArtifactKind, VisibilityType, Vote } from '@/lib/chat-types'

export type ChatRecord = {
  id: string
  title: string
  userId: string
  visibility: VisibilityType
  createdAt: string
  updatedAt: string
  messages: UIMessage[]
  votes: Vote[]
}

type ChatStore = Map<string, Map<string, ChatRecord>>

const globalStore = globalThis as typeof globalThis & {
  __adminChatStore?: ChatStore
}

const store = (globalStore.__adminChatStore ??= new Map())

export function getSessionId(request: Request) {
  const headerSession = request.headers.get('x-chat-session')
  if (headerSession) return headerSession
  const cookie = request.headers.get('cookie') ?? ''
  return cookie.match(/(?:^|;\s*)chat_session=([^;]+)/)?.[1] ?? 'anonymous'
}

export function getOrCreateSessionId(request: Request) {
  const sessionId = getSessionId(request)
  return sessionId === 'anonymous' ? crypto.randomUUID() : sessionId
}

export function withSessionCookie<T extends Response>(
  response: T,
  sessionId: string
) {
  if (sessionId === 'anonymous') return response
  response.headers.set(
    'Set-Cookie',
    `chat_session=${encodeURIComponent(sessionId)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`
  )
  return response
}

function getSessionChats(sessionId: string) {
  let chats = store.get(sessionId)
  if (!chats) {
    chats = new Map()
    store.set(sessionId, chats)
  }
  return chats
}

export function getChat(sessionId: string, chatId: string) {
  return getSessionChats(sessionId).get(chatId)
}

export function createChat(
  sessionId: string,
  input: { id: string; title?: string; visibility?: VisibilityType }
) {
  const now = new Date().toISOString()
  const chat: ChatRecord = {
    id: input.id,
    title: input.title ?? 'New chat',
    userId: sessionId,
    visibility: input.visibility ?? 'private',
    createdAt: now,
    updatedAt: now,
    messages: [],
    votes: [],
  }
  getSessionChats(sessionId).set(chat.id, chat)
  return chat
}

export function getOrCreateChat(
  sessionId: string,
  input: { id: string; visibility?: VisibilityType }
) {
  return getChat(sessionId, input.id) ?? createChat(sessionId, input)
}

export function appendMessages(
  sessionId: string,
  chatId: string,
  messages: UIMessage[]
) {
  const chat = getOrCreateChat(sessionId, { id: chatId })
  const known = new Set(chat.messages.map((message: UIMessage) => message.id))
  chat.messages.push(
    ...messages.filter((message: UIMessage) => !known.has(message.id))
  )
  chat.updatedAt = new Date().toISOString()
  return chat
}

export function listChats(sessionId: string) {
  return [...getSessionChats(sessionId).values()]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map(({ messages: _messages, votes: _votes, ...chat }) => chat)
}

export function deleteChat(sessionId: string, chatId: string) {
  return getSessionChats(sessionId).delete(chatId)
}

export function deleteAllChats(sessionId: string) {
  getSessionChats(sessionId).clear()
}

export function updateChat(
  sessionId: string,
  chatId: string,
  input: { title?: string; visibility?: VisibilityType }
) {
  const chat = getChat(sessionId, chatId)
  if (!chat) return undefined
  Object.assign(chat, input, { updatedAt: new Date().toISOString() })
  return chat
}

export function setVote(sessionId: string, chatId: string, vote: Vote) {
  const chat = getChat(sessionId, chatId)
  if (!chat) return undefined
  chat.votes = [
    ...chat.votes.filter((item: Vote) => item.messageId !== vote.messageId),
    vote,
  ]
  return vote
}

export function getVotes(sessionId: string, chatId: string) {
  return getChat(sessionId, chatId)?.votes ?? []
}

export function createDocumentId(kind: ArtifactKind) {
  return `${kind}-${crypto.randomUUID()}`
}
