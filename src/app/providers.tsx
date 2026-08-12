'use client'

import { useRouter } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { AxiosError } from 'axios'
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { handleServerError } from '@/lib/handle-server-error'
import { DirectionProvider } from '@/context/direction-provider'
import { FontProvider } from '@/context/font-provider'
import { ThemeProvider } from '@/context/theme-provider'

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: (failureCount, error) => {
              if (process.env.NODE_ENV === 'development') return false
              if (failureCount > 3) return false
              return !(
                error instanceof AxiosError &&
                [401, 403].includes(error.response?.status ?? 0)
              )
            },
            refetchOnWindowFocus: process.env.NODE_ENV === 'production',
            staleTime: 10 * 1000,
          },
          mutations: {
            onError: (error) => {
              handleServerError(error)
              if (
                error instanceof AxiosError &&
                error.response?.status === 304
              ) {
                toast.error('Content not modified!')
              }
            },
          },
        },
        queryCache: new QueryCache({
          onError: (error) => {
            if (!(error instanceof AxiosError)) return
            if (error.response?.status === 401) {
              toast.error('Session expired!')
              useAuthStore.getState().auth.reset()
              const redirect = window.location.href
              router.push(`/sign-in?redirect=${encodeURIComponent(redirect)}`)
            }
            if (error.response?.status === 500) {
              toast.error('Internal Server Error!')
              if (process.env.NODE_ENV === 'production') router.push('/500')
            }
          },
        }),
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <FontProvider>
          <DirectionProvider>{children}</DirectionProvider>
        </FontProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
