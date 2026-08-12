import type { Metadata } from 'next'
import { Suspense } from 'react'
import '@/styles/index.css'
import { Toaster } from '@/components/ui/sonner'
import { NavigationProgress } from '@/components/navigation-progress'
import { Providers } from './providers'

export const metadata: Metadata = {
  metadataBase: new URL('https://shadcn-admin.netlify.app'),
  title: 'Shadcn Admin',
  description: 'Admin Dashboard UI built with Shadcn and Next.js.',
  openGraph: {
    type: 'website',
    title: 'Shadcn Admin',
    description: 'Admin Dashboard UI built with Shadcn and Next.js.',
    images: ['/images/shadcn-admin.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shadcn Admin',
    description: 'Admin Dashboard UI built with Shadcn and Next.js.',
    images: ['/images/shadcn-admin.png'],
  },
  icons: {
    icon: [
      { url: '/images/favicon.svg', media: '(prefers-color-scheme: light)' },
      {
        url: '/images/favicon_light.svg',
        media: '(prefers-color-scheme: dark)',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body>
        <Providers>
          <Suspense>
            <NavigationProgress />
            {children}
          </Suspense>
          <Toaster duration={5000} />
        </Providers>
      </body>
    </html>
  )
}
