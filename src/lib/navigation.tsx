'use client'

import {
  forwardRef,
  useCallback,
  useMemo,
  type AnchorHTMLAttributes,
  type ReactNode,
} from 'react'
import NextLink from 'next/link'
import {
  usePathname,
  useRouter as useNextRouter,
  useSearchParams,
} from 'next/navigation'

type SearchRecord = Record<string, unknown>

type ParsedSearch = SearchRecord & {
  redirect?: string
  filter?: string
  type?: 'all' | 'connected' | 'notConnected'
  sort?: 'asc' | 'desc'
  page?: number
  pageSize?: number
  status?: string[]
  priority?: string[]
  role?: string[]
  username?: string
}

type NavigateOptions = {
  to?: string
  search?:
    | true
    | SearchRecord
    | ((previous: SearchRecord) => Partial<SearchRecord> | SearchRecord)
  replace?: boolean
}

export type LinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'href'
> & {
  to: string
  disabled?: boolean
  children?: ReactNode
}

function readSearch(params: URLSearchParams): ParsedSearch {
  const search: SearchRecord = {}

  for (const key of new Set(params.keys())) {
    const values = params.getAll(key)
    const parsed = values.map((value) => {
      if (key === 'page' || key === 'pageSize') return Number(value)
      return value
    })
    search[key] = parsed.length > 1 ? parsed : parsed[0]
  }

  return search as ParsedSearch
}

function writeSearch(search: SearchRecord) {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(search)) {
    if (value === undefined || value === null || value === '') continue
    const values = Array.isArray(value) ? value : [value]
    for (const item of values) params.append(key, String(item))
  }

  return params.toString()
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ to, disabled, onClick, ...props }, ref) => (
    <NextLink
      ref={ref}
      href={disabled ? '#' : to}
      aria-disabled={disabled}
      onClick={(event) => {
        if (disabled) event.preventDefault()
        else onClick?.(event)
      }}
      {...props}
    />
  )
)
Link.displayName = 'Link'

export function useNavigate() {
  const router = useNextRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return useCallback(
    ({ to = pathname, search, replace = false }: NavigateOptions) => {
      let query = searchParams.toString()

      if (search !== undefined) {
        const previous = readSearch(
          new URLSearchParams(searchParams.toString())
        )
        const nextSearch =
          search === true
            ? previous
            : typeof search === 'function'
              ? search(previous)
              : search
        query = writeSearch(nextSearch)
      }

      const url = query ? `${to}?${query}` : to
      if (replace) router.replace(url)
      else router.push(url)
    },
    [pathname, router, searchParams]
  )
}

type Location = {
  href: string
  pathname: string
  search: SearchRecord
}

export function useLocation<T = Location>(options?: {
  select?: (location: Location) => T
}): T {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const location = useMemo<Location>(() => {
    const query = searchParams.toString()
    return {
      href: query ? `${pathname}?${query}` : pathname,
      pathname,
      search: readSearch(new URLSearchParams(query)),
    }
  }, [pathname, searchParams])

  return (options?.select ? options.select(location) : location) as T
}

export function useRouter() {
  const router = useNextRouter()
  return {
    history: {
      go(delta: number) {
        if (delta < 0) router.back()
        else if (delta > 0) router.forward()
        else router.refresh()
      },
      push(url: string) {
        router.push(url)
      },
    },
  }
}

export function useSearch(_options?: { from?: string }): ParsedSearch {
  const searchParams = useSearchParams()
  return useMemo(
    () => readSearch(new URLSearchParams(searchParams.toString())),
    [searchParams]
  )
}

export function getRouteApi(_route: string) {
  return { useNavigate, useSearch }
}
