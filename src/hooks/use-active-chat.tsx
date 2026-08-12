'use client'

import { useChat, type UseChatHelpers } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { DEFAULT_CHAT_MODEL } from '@/lib/chat-models'
import { useDataStream } from '@/components/chat/data-stream-provider'
import type { ChatDataPart, ChatMessage, VisibilityType } from '@/lib/chat-types'

type ActiveChatContextValue = {
  chatId: string
  messages: ChatMessage[]
  setMessages: UseChatHelpers<ChatMessage>['setMessages']
  sendMessage: UseChatHelpers<ChatMessage>['sendMessage']
  status: UseChatHelpers<ChatMessage>['status']
  stop: UseChatHelpers<ChatMessage>['stop']
  regenerate: UseChatHelpers<ChatMessage>['regenerate']
  addToolApprovalResponse: UseChatHelpers<ChatMessage>['addToolApprovalResponse']
  input: string
  setInput: Dispatch<SetStateAction<string>>
  visibilityType: VisibilityType
  isReadonly: boolean
  isLoading: boolean
  votes: undefined
  currentModelId: string
  setCurrentModelId: (id: string) => void
  showCreditCardAlert: boolean
  setShowCreditCardAlert: Dispatch<SetStateAction<boolean>>
  resetChat: () => void
}

const ActiveChatContext = createContext<ActiveChatContextValue | null>(null)

const generateId = () => crypto.randomUUID()

export function ActiveChatProvider({ children }: { children: ReactNode }) {
  const { setDataStream, setWaitingStatus } = useDataStream()
  const [chatId, setChatId] = useState(generateId)
  const [input, setInput] = useState('')
  const [currentModelId, setCurrentModelId] = useState(DEFAULT_CHAT_MODEL)
  const [showCreditCardAlert, setShowCreditCardAlert] = useState(false)
  const chat = useChat<ChatMessage>({
    generateId,
    id: chatId,
    onData: (part) => {
      const dataPart = part as ChatDataPart
      if (dataPart.type === 'data-waiting-status') setWaitingStatus(dataPart.data)
      setDataStream((current) => [...current, dataPart])
    },
    transport: new DefaultChatTransport({ api: '/api/chat', body: { modelId: currentModelId } }),
  })

  const resetChat = useCallback(() => {
    chat.stop()
    chat.setMessages([])
    setInput('')
    setChatId(generateId())
    window.history.replaceState({}, '', '/ai-agent')
  }, [chat])

  const value = useMemo<ActiveChatContextValue>(
    () => ({
      addToolApprovalResponse: chat.addToolApprovalResponse,
      chatId,
      currentModelId,
      input,
      isLoading: false,
      isReadonly: false,
      messages: chat.messages,
      regenerate: chat.regenerate,
      resetChat,
      sendMessage: chat.sendMessage,
      setCurrentModelId,
      setInput,
      setMessages: chat.setMessages,
      setShowCreditCardAlert,
      showCreditCardAlert,
      status: chat.status,
      stop: chat.stop,
      visibilityType: 'private',
      votes: undefined,
    }),
    [chat, chatId, currentModelId, input, resetChat, showCreditCardAlert]
  )

  return (
    <ActiveChatContext.Provider value={value}>
      {children}
    </ActiveChatContext.Provider>
  )
}

export function useActiveChat() {
  const context = useContext(ActiveChatContext)
  if (!context) {
    throw new Error('useActiveChat must be used within ActiveChatProvider')
  }
  return context
}