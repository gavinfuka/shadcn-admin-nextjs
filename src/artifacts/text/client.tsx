import { FileTextIcon } from 'lucide-react'
import { ArtifactDefinition } from '@/components/chat/create-artifact'
import { Editor } from '@/components/chat/text-editor'

export const textArtifact = new ArtifactDefinition({
  kind: 'text',
  description: 'Useful for writing and editing prose',
  content: Editor,
  actions: [],
  toolbar: [
    {
      description: 'Improve writing',
      icon: <FileTextIcon />,
      onClick: ({ sendMessage }) => {
        void sendMessage({
          role: 'user',
          parts: [
            {
              type: 'text',
              text: 'Improve the writing in the current document.',
            },
          ],
        })
      },
    },
  ],
  onStreamPart: ({ setArtifact, streamPart }) => {
    if (streamPart.type === 'data-textDelta')
      setArtifact((artifact) => ({
        ...artifact,
        content: artifact.content + streamPart.data,
        isVisible: true,
        status: 'streaming',
      }))
  },
})
