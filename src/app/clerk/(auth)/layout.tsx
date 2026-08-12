'use client'

import { ClerkFullLogo } from '@/assets/clerk-full-logo'
import { Logo } from '@/assets/logo'
import { Link } from '@/lib/navigation'

export default function ClerkAuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='relative container grid h-svh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <div className='relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-e'>
        <div className='absolute inset-0 bg-slate-500' />
        <Link
          to='/'
          className='relative z-20 flex items-center text-lg font-medium'
        >
          <Logo className='me-2' />
          Shadcn Admin
        </Link>
        <ClerkFullLogo className='relative m-auto size-96' />
        <blockquote className='relative z-20 mt-auto space-y-2'>
          <p className='text-lg'>
            &ldquo;Manage your team with a complete Clerk authentication
            flow.&rdquo;
          </p>
          <footer className='text-sm'>Shadcn Admin</footer>
        </blockquote>
      </div>
      <div className='lg:p-8'>
        <div className='mx-auto flex w-full flex-col items-center justify-center gap-4'>
          {children}
        </div>
      </div>
    </div>
  )
}
