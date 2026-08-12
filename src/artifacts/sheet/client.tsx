import { Table2Icon } from 'lucide-react'
import {
  ArtifactDefinition,
  type ArtifactContentProps,
} from '@/components/chat/create-artifact'
import { SpreadsheetEditor } from '@/components/chat/sheet-editor'

const SheetContent = ({
  content,
  onSaveContent,
  currentVersionIndex,
  isCurrentVersion,
  status,
}: ArtifactContentProps) => (
  <SpreadsheetEditor
    content={content}
    currentVersionIndex={currentVersionIndex}
    isCurrentVersion={isCurrentVersion}
    saveContent={(value) => onSaveContent(value, true)}
    status={status}
  />
)

export const sheetArtifact = new ArtifactDefinition({
  kind: 'sheet',
  description: 'Useful for tabular CSV data',
  content: SheetContent,
  actions: [],
  toolbar: [
    {
      description: 'Analyze sheet',
      icon: <Table2Icon />,
      onClick: ({ sendMessage }) => {
        void sendMessage({
          role: 'user',
          parts: [
            { type: 'text', text: 'Analyze the data in the current sheet.' },
          ],
        })
      },
    },
  ],
  onStreamPart: ({ setArtifact, streamPart }) => {
    if (streamPart.type === 'data-sheetDelta')
      setArtifact((artifact) => ({
        ...artifact,
        content: artifact.content + streamPart.data,
        isVisible: true,
        status: 'streaming',
      }))
  },
})
