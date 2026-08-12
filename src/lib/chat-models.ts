export type ChatModel = {
  id: string
  name: string
  provider: string
}

export const chatModels: ChatModel[] = [
  { id: 'openai/gpt-5', name: 'GPT-5', provider: 'openai' },
  {
    id: 'anthropic/claude-sonnet-4',
    name: 'Claude Sonnet 4',
    provider: 'anthropic',
  },
  { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'google' },
]

export const DEFAULT_CHAT_MODEL = chatModels[0].id
