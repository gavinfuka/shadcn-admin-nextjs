import { Reasoning, ReasoningContent, ReasoningTrigger } from '@/components/ai-elements/reasoning'

export function MessageReasoning({ isLoading, reasoning }: { isLoading: boolean; reasoning: string }) {
  return <Reasoning defaultOpen={isLoading} isStreaming={isLoading}><ReasoningTrigger /><ReasoningContent>{reasoning}</ReasoningContent></Reasoning>
}