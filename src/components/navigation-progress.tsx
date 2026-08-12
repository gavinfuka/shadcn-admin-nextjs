'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'
import LoadingBar, { type LoadingBarRef } from 'react-top-loading-bar'

export function NavigationProgress() {
  const ref = useRef<LoadingBarRef>(null)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const anchor = (event.target as Element).closest('a')
      if (
        anchor?.origin === window.location.origin &&
        anchor.href !== window.location.href
      ) {
        ref.current?.continuousStart()
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  useEffect(() => ref.current?.complete(), [pathname, searchParams])

  return (
    <LoadingBar
      color='var(--muted-foreground)'
      ref={ref}
      shadow={true}
      height={2}
    />
  )
}
