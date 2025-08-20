"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { House, SparklesIcon, Upload, Plus, Trash2 } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useUser } from "@/hooks/use-users";
import {
  loadThreads,
  deleteThread,
  formatShort,
  type ThreadMeta,
} from "@/lib/chat-storage";

const data = {
  navMain: [
    { icon: <House />, title: "Home", path: "/home" },
    { icon: <SparklesIcon />, title: "Ask AI", path: "/ask-ai" },
    { icon: <Upload />, title: "Upload CV", path: "/resume" },
  ],
};

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();
  const uid = user?.record?.id ?? "anon";
  const router = useRouter();
  const params = useSearchParams();
  const currentThread = params.get("thread");

  const [threads, setThreads] = React.useState<ThreadMeta[]>([]);

  const refresh = React.useCallback(() => setThreads(loadThreads(uid)), [uid]);

  React.useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener("ai-threads-updated", handler);
    return () => window.removeEventListener("ai-threads-updated", handler);
  }, [refresh]);

  const handleNewChat = () => {
    // ChatMessage yang akan bikin thread saat user kirim pesan pertama
    router.push("/ask-ai");
  };

  const handleDelete = (tid: string) => {
    deleteThread(uid, tid);
    if (currentThread === tid) router.push("/ask-ai"); // keluar dari thread yang dihapus
    refresh();
  };

  return (
    <Sidebar className="h-screen" {...props}>
      <SidebarHeader />
      <SidebarContent className="flex justify-between">
        {/* Nav kiri */}
        <div className="flex flex-col gap-3">
          {data.navMain.map((item) => (
            <Link key={item.title} href={item.path}>
              <Button
                title={item.title}
                className="cursor-pointer mx-auto w-[250px] bg-transparent shadow-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <SidebarGroup>
                  <SidebarGroupLabel
                    asChild
                    className="group/label text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    <span className="gap-2 flex items-center">
                      {item.icon}
                      {item.title}
                    </span>
                  </SidebarGroupLabel>
                </SidebarGroup>
              </Button>
            </Link>
          ))}
        </div>

        {/* History kanan */}
        <div className="h-full w-full border-l px-3 py-3 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">History</h2>
            <Button size="sm" className="h-7 px-2" onClick={handleNewChat}>
              <Plus className="cursor-pointer h-4 w-4 mr-1" />
              New Chat
            </Button>
          </div>

          {/* Scrollable list */}
          <div className="mt-2 flex-1 min-h-0 overflow-y-auto space-y-1">
            {threads.length === 0 ? (
              <p className="text-xs text-muted-foreground">No chats yet.</p>
            ) : (
              threads.map((t) => (
                <div
                  key={t.id}
                  className="group flex items-center gap-1 rounded-md px-1 hover:bg-sidebar-accent"
                >
                  {/* Link area - pakai min-w-0 agar truncate bekerja */}
                  <Link
                    href={`/ask-ai?thread=${t.id}`}
                    className="flex-1 min-w-0 py-1.5"
                  >
                    <div className="truncate text-sm">{t.title || "New Chat"}</div>
                    <div className="text-[10px] opacity-60">{formatShort(t.updatedAt)}</div>
                  </Link>

                  {/* Delete button kecil - muncul saat hover */}
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Delete"
                    className="cursor-pointer h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDelete(t.id);
                    }}
                  >
                    <Trash2 className="cursor-pointer h-3 w-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
