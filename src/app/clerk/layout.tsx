'use client'

import { ClerkProvider } from '@clerk/react'

export default function ClerkLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  if (!publishableKey) {
    return (
      <main className='flex min-h-svh items-center justify-center p-6'>
        <div className='max-w-lg rounded-md border p-6'>
          <h1 className='text-xl font-semibold'>
            No Clerk publishable key found
          </h1>
          <p className='mt-2 text-muted-foreground'>
            Add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env file to use the
            Clerk example routes.
          </p>
        </div>
      </main>
    )
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      afterSignOutUrl='/clerk/sign-in'
      signInUrl='/clerk/sign-in'
      signUpUrl='/clerk/sign-up'
      signInFallbackRedirectUrl='/clerk/user-management'
      signUpFallbackRedirectUrl='/clerk/user-management'
    >
      {children}
    </ClerkProvider>
  )
}
