'use client'

import { useCallback, useState } from 'react'
import type { VisibilityType } from '@/lib/chat-types'

export function useChatVisibility({
  initialVisibilityType,
}: {
  chatId: string
  initialVisibilityType: VisibilityType
}) {
  const [visibilityType, setLocalVisibilityType] = useState(
    initialVisibilityType
  )
  const setVisibilityType = useCallback(
    (value: VisibilityType) => setLocalVisibilityType(value),
    []
  )
  return { visibilityType, setVisibilityType }
}
