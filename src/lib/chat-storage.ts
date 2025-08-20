// lib/chat-storage.ts
export type ChatMessage = {
  id: string;
  content: string;
  isUser: boolean;
  isStreaming?: boolean;
  file?: { name: string; type: string } | null;
};

export type ThreadMeta = {
  id: string;
  title: string;
  updatedAt: number; // epoch ms
};

const hasWindow = () => typeof window !== "undefined";
const listKey = (uid: string) => `ai_threads:${uid}`;
const msgKey = (uid: string, tid: string) => `ai_thread:${uid}:${tid}`;

const emitThreadsUpdated = () => {
  if (!hasWindow()) return;
  window.dispatchEvent(new Event("ai-threads-updated"));
};

export function loadThreads(uid: string): ThreadMeta[] {
  if (!hasWindow()) return [];
  try {
    const raw = localStorage.getItem(listKey(uid));
    return raw ? (JSON.parse(raw) as ThreadMeta[]) : [];
  } catch {
    return [];
  }
}

export function saveThreads(uid: string, threads: ThreadMeta[]) {
  if (!hasWindow()) return;
  localStorage.setItem(listKey(uid), JSON.stringify(threads));
  emitThreadsUpdated();
}

export function createThread(uid: string, title = "New Chat"): string {
  const id =
    (typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Date.now().toString(36)) as string;

  const meta: ThreadMeta = { id, title, updatedAt: Date.now() };
  const threads = [meta, ...loadThreads(uid)].sort((a, b) => b.updatedAt - a.updatedAt);
  saveThreads(uid, threads);

  // init messages
  saveMessages(uid, id, []);
  return id;
}

export function touchThread(uid: string, tid: string, title?: string) {
  const threads = loadThreads(uid);
  const idx = threads.findIndex((t) => t.id === tid);
  if (idx === -1) return;
  const next = [...threads];
  next[idx] = { ...threads[idx], title: title ?? threads[idx].title, updatedAt: Date.now() };
  next.sort((a, b) => b.updatedAt - a.updatedAt);
  saveThreads(uid, next);
}

export function deleteThread(uid: string, tid: string) {
  const threads = loadThreads(uid).filter((t) => t.id !== tid);
  saveThreads(uid, threads);
  if (hasWindow()) localStorage.removeItem(msgKey(uid, tid));
}

export function loadMessages(uid: string, tid: string): ChatMessage[] {
  if (!hasWindow()) return [];
  try {
    const raw = localStorage.getItem(msgKey(uid, tid));
    return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

export function saveMessages(uid: string, tid: string, msgs: ChatMessage[]) {
  if (!hasWindow()) return;
  localStorage.setItem(msgKey(uid, tid), JSON.stringify(msgs));
}

export function makeTitleFromText(text: string, max = 40) {
  const t = text.trim().replace(/\s+/g, " ");
  return t.length > max ? t.slice(0, max) + "…" : t || "New Chat";
}

export function formatShort(ts: number) {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
