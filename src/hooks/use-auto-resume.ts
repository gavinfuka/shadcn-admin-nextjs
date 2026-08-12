'use client'

import { useEffect } from 'react'

export function useAutoResume({ enabled = false, resume }: { enabled?: boolean; resume?: () => void | Promise<void> }) {
  useEffect(() => { if (enabled) void resume?.() }, [enabled, resume])
}