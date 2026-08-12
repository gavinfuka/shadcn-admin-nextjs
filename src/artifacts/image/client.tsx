import { ImageIcon } from 'lucide-react'
import { ArtifactDefinition } from '@/components/chat/create-artifact'
import { ImageEditor } from '@/components/chat/image-editor'

export const imageArtifact = new ArtifactDefinition({
  kind: 'image',
  description: 'Useful for generated images',
  content: ImageEditor,
  actions: [],
  toolbar: [
    {
      description: 'Regenerate image',
      icon: <ImageIcon />,
      onClick: ({ sendMessage }) => {
        void sendMessage({
          role: 'user',
          parts: [
            { type: 'text', text: 'Regenerate the current image artifact.' },
          ],
        })
      },
    },
  ],
  onStreamPart: ({ setArtifact, streamPart }) => {
    if (streamPart.type === 'data-imageDelta')
      setArtifact((artifact) => ({
        ...artifact,
        content: artifact.content + streamPart.data,
        isVisible: true,
        status: 'streaming',
      }))
  },
})
