"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Edit, MessageSquare, Search, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useActiveChat } from "@/hooks/use-active-chat"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

type ChatSummary = {
  id: string
  title: string
  updatedAt: string
}

export function ChatHistorySidebar() {
  const pathname = usePathname()
  const { messages, resetChat } = useActiveChat()
  const [search, setSearch] = useState("")
  const [chats, setChats] = useState<ChatSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const loadChats = useCallback(async () => {
    try {
      const response = await fetch("/api/history?limit=50")
      if (!response.ok) return
      setChats((await response.json()) as ChatSummary[])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadChats()
    window.addEventListener("focus", loadChats)
    return () => window.removeEventListener("focus", loadChats)
  }, [loadChats])

  useEffect(() => {
    if (messages.length > 0) void loadChats()
  }, [loadChats, messages.length])

  const handleDeleteAll = async () => {
    const response = await fetch("/api/history", { method: "DELETE" })
    if (!response.ok) return
    setChats([])
    setShowDeleteDialog(false)
    resetChat()
  }

  const filteredChats = useMemo(() => chats.filter((chat) => chat.title.toLowerCase().includes(search.trim().toLowerCase())), [chats, search])

  return (
    <aside className="flex h-full w-full flex-col gap-2 border-e bg-background p-4 sm:w-56 lg:w-72 2xl:w-80">
      <div className="sticky top-0 z-10 bg-background pb-3">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">History</h1>
            <MessageSquare className="size-5" />
          </div>
        </div>
        <Button className="mb-3 h-8 w-full justify-start gap-2 rounded-lg border border-border text-xs text-muted-foreground" onClick={resetChat} variant="ghost">
          <Edit className="size-3.5" />
          New chat
        </Button>
        <div className="relative">
          <Search className="absolute top-1/2 left-2 size-4 -translate-y-1/2 stroke-slate-500" />
          <Input className="h-10 ps-8" onChange={(event) => setSearch(event.target.value)} placeholder="Search chat..." value={search} />
        </div>
      </div>

      <ScrollArea className="-mx-3 min-h-0 flex-1 px-3">
        {isLoading ? (
          <p className="px-2 py-3 text-sm text-muted-foreground">Loading chats...</p>
        ) : filteredChats.length === 0 ? (
          <div className="px-2 py-3 text-sm text-muted-foreground">{search ? "No chats found." : "Send a message to start a chat."}</div>
        ) : (
          filteredChats.map((chat) => (
            <Link className={cn("group flex w-full border-b px-2 py-3 text-start text-sm transition-colors hover:bg-accent hover:text-accent-foreground", pathname === `/ai-agent/chat/${chat.id}` && "bg-muted")} href={`/ai-agent/chat/${chat.id}`} key={chat.id}>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-medium">{chat.title}</span>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {formatDistanceToNow(new Date(chat.updatedAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <span className="mt-1 block text-xs text-muted-foreground group-hover:text-accent-foreground/90">Open conversation</span>
              </div>
            </Link>
          ))
        )}
      </ScrollArea>
      <Button className="h-8 justify-start gap-2 rounded-lg text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={() => setShowDeleteDialog(true)} variant="ghost">
        <Trash2 className="size-3.5" />
        Delete all chats
      </Button>

      <AlertDialog onOpenChange={setShowDeleteDialog} open={showDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete all chats?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. All of your chat history will be permanently deleted.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAll}>Delete all</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  )
}
