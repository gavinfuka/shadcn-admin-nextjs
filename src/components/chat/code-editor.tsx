'use client'

import { memo, useEffect, useRef } from 'react'
import { python } from '@codemirror/lang-python'
import { EditorState, Transaction } from '@codemirror/state'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import { basicSetup } from 'codemirror'
import type { LocalSuggestion } from '@/lib/chat-types'

type Props = {
  content: string
  onSaveContent: (content: string, debounce: boolean) => void
  status: 'streaming' | 'idle'
  isCurrentVersion: boolean
  currentVersionIndex: number
  suggestions: LocalSuggestion[]
}

function PureCodeEditor({ content, onSaveContent, status }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<EditorView | null>(null)
  const initialContentRef = useRef(content)
  useEffect(() => {
    if (!containerRef.current) return
    const listener = EditorView.updateListener.of((update) => {
      if (
        update.docChanged &&
        update.transactions.some(
          (transaction) => !transaction.annotation(Transaction.remote)
        )
      )
        onSaveContent(update.state.doc.toString(), true)
    })
    editorRef.current = new EditorView({
      parent: containerRef.current,
      state: EditorState.create({
        doc: initialContentRef.current,
        extensions: [basicSetup, python(), oneDark, listener],
      }),
    })
    return () => {
      editorRef.current?.destroy()
      editorRef.current = null
    }
  }, [onSaveContent])
  useEffect(() => {
    const view = editorRef.current
    if (!view || view.state.doc.toString() === content) return
    view.dispatch({
      annotations: Transaction.remote.of(true),
      changes: { from: 0, to: view.state.doc.length, insert: content },
      scrollIntoView: status === 'streaming',
    })
  }, [content, status])
  return (
    <div
      className='not-prose min-h-[300px] w-full pb-[30vh]'
      ref={containerRef}
    />
  )
}

export const CodeEditor = memo(PureCodeEditor)
