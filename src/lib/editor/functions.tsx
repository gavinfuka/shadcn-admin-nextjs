import { DOMParser as ProseMirrorDOMParser, type Node as ProseMirrorNode } from 'prosemirror-model'
import { Decoration, DecorationSet, type EditorView } from 'prosemirror-view'
import { documentSchema } from './config'
import type { UISuggestion } from './suggestions'

export function buildDocumentFromContent(content: string) {
  if (typeof document === 'undefined') return documentSchema.node('doc', null, content ? [documentSchema.node('paragraph', null, documentSchema.text(content))] : [])
  const container = document.createElement('div')
  for (const line of content.split('\n')) { const paragraph = document.createElement('p'); paragraph.textContent = line || ' '; container.append(paragraph) }
  return ProseMirrorDOMParser.fromSchema(documentSchema).parse(container)
}
export const buildContentFromDocument = (documentNode: ProseMirrorNode) => documentNode.textBetween(0, documentNode.content.size, '\n')
export function createDecorations(suggestions: UISuggestion[], view: EditorView) { return DecorationSet.create(view.state.doc, suggestions.map((suggestion) => Decoration.inline(suggestion.selectionStart, suggestion.selectionEnd, { class: 'suggestion-highlight', 'data-suggestion-id': suggestion.id }, { suggestionId: suggestion.id }))) }