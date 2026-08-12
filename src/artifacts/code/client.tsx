import { Code2Icon } from 'lucide-react'
import { CodeEditor } from '@/components/chat/code-editor'
import { ArtifactDefinition } from '@/components/chat/create-artifact'

export const codeArtifact = new ArtifactDefinition({
  kind: 'code',
  description: 'Useful for creating and editing Python code',
  content: CodeEditor,
  actions: [],
  toolbar: [{ description: 'Explain code', icon: <Code2Icon />, onClick: ({ sendMessage }) => { void sendMessage({ role: 'user', parts: [{ type: 'text', text: 'Explain the code in the current artifact.' }] }) } }],
  onStreamPart: ({ setArtifact, streamPart }) => { if (streamPart.type === 'data-codeDelta') setArtifact((artifact) => ({ ...artifact, content: artifact.content + streamPart.data, isVisible: true, status: 'streaming' })) },
})