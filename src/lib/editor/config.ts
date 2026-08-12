import { inputRules } from 'prosemirror-inputrules'
import { schema as basicSchema } from 'prosemirror-schema-basic'
import { addListNodes } from 'prosemirror-schema-list'
import { Schema } from 'prosemirror-model'
import type { EditorView } from 'prosemirror-view'

export const documentSchema = new Schema({ nodes: addListNodes(basicSchema.spec.nodes, 'paragraph block*', 'block'), marks: basicSchema.spec.marks })
export const headingRule = (_level: number) => inputRules({ rules: [] })
export function handleTransaction({ editorRef, transaction, onSaveContent }: { editorRef: React.RefObject<EditorView | null>; transaction: Parameters<EditorView['dispatch']>[0]; onSaveContent: (content: string, debounce: boolean) => void }) {
  const view = editorRef.current
  if (!view) return
  const nextState = view.state.apply(transaction)
  view.updateState(nextState)
  if (transaction.docChanged && !transaction.getMeta('no-save')) onSaveContent(nextState.doc.textBetween(0, nextState.doc.content.size, '\n'), !transaction.getMeta('no-debounce'))
}