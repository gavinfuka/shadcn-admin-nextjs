'use client'

import { SignUp } from '@clerk/react'
import { Skeleton } from '@/components/ui/skeleton'

export default function ClerkSignUpPage() {
  return <SignUp fallback={<Skeleton className='h-120 w-100' />} />
}
