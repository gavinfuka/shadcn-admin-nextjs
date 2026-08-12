import { Plugin, PluginKey } from 'prosemirror-state'
import { DecorationSet, type EditorView } from 'prosemirror-view'
import type { LocalSuggestion } from '@/lib/chat-types'

export type UISuggestion = LocalSuggestion & {
  selectionStart: number
  selectionEnd: number
}
export const suggestionsPluginKey = new PluginKey<{
  decorations: DecorationSet
}>('suggestions')
export const suggestionsPlugin = new Plugin({
  key: suggestionsPluginKey,
  state: {
    init: () => ({ decorations: DecorationSet.empty }),
    apply: (transaction, value) =>
      transaction.getMeta(suggestionsPluginKey) ?? value,
  },
  props: {
    decorations(state) {
      return suggestionsPluginKey.getState(state)?.decorations
    },
  },
})
export function projectWithPositions(
  documentNode: EditorView['state']['doc'],
  suggestions: LocalSuggestion[]
): UISuggestion[] {
  const text = documentNode.textContent
  return suggestions.map((suggestion) => {
    const selectionStart = Math.max(0, text.indexOf(suggestion.originalText))
    return {
      ...suggestion,
      selectionStart,
      selectionEnd: selectionStart + suggestion.originalText.length,
    }
  })
}
