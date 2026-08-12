'use client'

import { useAuth, UserButton } from '@clerk/react'
import { Loader2 } from 'lucide-react'
import { Link, useNavigate, useSearch } from '@/lib/navigation'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { UsersDialogs } from '@/features/users/components/users-dialogs'
import { UsersPrimaryButtons } from '@/features/users/components/users-primary-buttons'
import { UsersProvider } from '@/features/users/components/users-provider'
import { UsersTable } from '@/features/users/components/users-table'
import { users } from '@/features/users/data/users'

export default function UserManagementPage() {
  const search = useSearch()
  const navigate = useNavigate()
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) {
    return (
      <div className='flex h-svh items-center justify-center'>
        <Loader2 className='size-8 animate-spin' />
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className='m-auto flex h-full flex-col items-center justify-center gap-4'>
        <h1 className='text-7xl font-bold'>401</h1>
        <p className='text-muted-foreground'>
          Sign in with Clerk to access this page.
        </p>
        <Button asChild>
          <Link to='/clerk/sign-in'>Sign in</Link>
        </Button>
      </div>
    )
  }

  return (
    <UsersProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <UserButton />
      </Header>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>User List</h2>
            <p className='text-muted-foreground'>
              Manage your users and their roles here.
            </p>
          </div>
          <UsersPrimaryButtons />
        </div>
        <UsersTable data={users} navigate={navigate} search={search} />
      </Main>
      <UsersDialogs />
    </UsersProvider>
  )
}
