'use client'

import { useRouter } from 'next/navigation'
import { SparklesIcon } from './icons'

const prompts = ['Summarize a complex topic', 'Draft a concise email', 'Explain some code', 'Plan a project']
export function Preview() { const router = useRouter(); return <div className='flex h-full flex-col items-center justify-center gap-6 p-8'><SparklesIcon /><h2 className='text-xl font-semibold'>What can I help with?</h2><div className='grid max-w-md grid-cols-2 gap-2'>{prompts.map((prompt) => <button className='rounded-xl border p-3 text-left text-xs text-muted-foreground hover:bg-muted' key={prompt} onClick={() => router.push(`/ai-agent?query=${encodeURIComponent(prompt)}`)} type='button'>{prompt}</button>)}</div></div> }