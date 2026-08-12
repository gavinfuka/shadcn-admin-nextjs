import type { ArtifactKind } from '@/lib/chat-types'
import { localChatPersistence } from '@/components/chat/local-persistence'

export async function saveArtifactContent({
  id,
  title,
  kind,
  content,
}: {
  id: string
  title: string
  kind: ArtifactKind
  content: string
}) {
  return localChatPersistence.saveDocument({
    id,
    title,
    kind,
    content,
    createdAt: new Date(),
  })
}

export async function getArtifactVersions(id: string) {
  return localChatPersistence.getDocuments(id)
}
