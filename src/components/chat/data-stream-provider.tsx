'use client'

import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react'
import type { ChatDataPart, WaitingStatusData } from '@/lib/chat-types'

type DataStreamContextValue = {
  dataStream: ChatDataPart[]
  setDataStream: React.Dispatch<React.SetStateAction<ChatDataPart[]>>
  waitingStatus: WaitingStatusData | undefined
  setWaitingStatus: React.Dispatch<React.SetStateAction<WaitingStatusData | undefined>>
}

const DataStreamContext = createContext<DataStreamContextValue | null>(null)

export function DataStreamProvider({ children }: { children: ReactNode }) {
  const [dataStream, setDataStream] = useState<ChatDataPart[]>([])
  const [waitingStatus, setWaitingStatus] = useState<WaitingStatusData>()
  const value = useMemo(
    () => ({ dataStream, setDataStream, setWaitingStatus, waitingStatus }),
    [dataStream, waitingStatus]
  )

  return (
    <DataStreamContext.Provider value={value}>
      {children}
    </DataStreamContext.Provider>
  )
}

export function useDataStream() {
  const context = useContext(DataStreamContext)
  if (!context) {
    throw new Error('useDataStream must be used within a DataStreamProvider')
  }
  return context
}