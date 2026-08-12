'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export function useScrollToBottom() {
  const containerRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const scrollToBottom = useCallback(
    () => endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }),
    []
  )
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const onScroll = () =>
      setIsAtBottom(
        container.scrollHeight - container.scrollTop - container.clientHeight <
          80
      )
    container.addEventListener('scroll', onScroll, { passive: true })
    return () => container.removeEventListener('scroll', onScroll)
  }, [])
  return { containerRef, endRef, isAtBottom, scrollToBottom }
}
