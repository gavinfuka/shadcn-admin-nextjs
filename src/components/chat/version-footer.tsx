'use client'

import { ChevronLeftIcon, ChevronRightIcon, DiffIcon } from 'lucide-react'
import type { Dispatch, SetStateAction } from 'react'
import { Button } from '@/components/ui/button'
import type { LocalDocument } from '@/lib/chat-types'

export function VersionFooter({ handleVersionChange, documents, currentVersionIndex, mode, setMode }: { handleVersionChange: (type: 'next' | 'prev' | 'toggle' | 'latest') => void; documents: LocalDocument[] | undefined; currentVersionIndex: number; mode: 'edit' | 'diff'; setMode: Dispatch<SetStateAction<'edit' | 'diff'>> }) { if (!documents?.length) return null; return <footer className='flex items-center gap-2 border-t px-4 py-2'><Button disabled={currentVersionIndex === 0} onClick={() => handleVersionChange('prev')} size='icon' variant='ghost'><ChevronLeftIcon /></Button><span className='text-xs text-muted-foreground'>{currentVersionIndex + 1} of {documents.length}</span><Button disabled={currentVersionIndex === documents.length - 1} onClick={() => handleVersionChange('next')} size='icon' variant='ghost'><ChevronRightIcon /></Button><Button className={mode === 'diff' ? 'bg-muted' : undefined} onClick={() => setMode(mode === 'diff' ? 'edit' : 'diff')} size='icon' variant='ghost'><DiffIcon /></Button><Button className='ml-auto' onClick={() => handleVersionChange('latest')} size='sm' variant='outline'>Latest</Button></footer> }