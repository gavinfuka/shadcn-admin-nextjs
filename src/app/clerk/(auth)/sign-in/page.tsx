'use client'

import { SignIn } from '@clerk/react'
import { Skeleton } from '@/components/ui/skeleton'

export default function ClerkSignInPage() {
  return (
    <SignIn
      initialValues={{ emailAddress: 'your_mail+shadcn_admin@gmail.com' }}
      fallback={<Skeleton className='h-120 w-100' />}
    />
  )
}
