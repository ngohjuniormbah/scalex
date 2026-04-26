"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Send } from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import { api, type ThreadDTO, type MessageDTO } from "@/lib/api";
import { DashboardNav } from "@/components/dashboard/Nav";

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-mute-50 flex items-center justify-center">
          <div className="text-mute-500 text-sm">Loading…</div>
        </main>
      }
    >
      <MessagesInner />
    </Suspense>
  );
}

function MessagesInner() {
  const { me, loading, logout } = useAuth();
  const sp = useSearchParams();
  const [threads, setThreads] = useState<ThreadDTO[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initial load + open requested thread
  useEffect(() => {
    if (!me) return;
    (async () => {
      const list = await api.threads();
      setThreads(list);

      const userParam = sp.get("user");
      const threadParam = sp.get("thread");

      if (threadParam) {
        setActiveId(parseInt(threadParam, 10));
      } else if (userParam) {
        try {
          const t = await api.openThread(parseInt(userParam, 10));
          setActiveId(t.id);
          if (!list.find((x) => x.id === t.id)) setThreads([t, ...list]);
        } catch {}
      } else if (list.length > 0) {
        setActiveId(list[0].id);
      }
    })();
  }, [me, sp]);

  // Load messages when active thread changes + start polling
  useEffect(() => {
    if (!activeId) return;
    let cancelled = false;
    async function poll() {
      try {
        const msgs = await api.threadMessages(activeId!);
        if (!cancelled) setMessages(msgs);
      } catch {}
    }
    poll();
    const t = setInterval(poll, 4000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [activeId]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 1e9, behavior: "smooth" });
  }, [messages.length, activeId]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!activeId || !draft.trim()) return;
    setSending(true);
    try {
      const m = await api.sendMessage(activeId, draft.trim());
      setMessages((cur) => [...cur, m]);
      setDraft("");
      // refresh thread list to bump order
      api.threads().then(setThreads).catch(() => {});
    } finally {
      setSending(false);
    }
  }

  if (loading || !me) {
    return (
      <main className="min-h-screen bg-mute-50 flex items-center justify-center">
        <div className="text-mute-500 text-sm">Loading…</div>
      </main>
    );
  }

  const active = threads.find((t) => t.id === activeId);

  return (
    <main className="min-h-screen bg-mute-50">
      <DashboardNav me={me} onLogout={logout} />

      <div className="mx-auto max-w-6xl px-4 md:px-6 py-6">
        <div className="rounded-xl border border-mute-200 bg-white overflow-hidden grid grid-cols-1 md:grid-cols-3 h-[calc(100vh-140px)]">
          {/* Thread list */}
          <aside className="md:col-span-1 border-r border-mute-200 overflow-y-auto">
            <div className="px-4 py-3 border-b border-mute-200">
              <h2 className="font-semibold">Messages</h2>
            </div>
            {threads.length === 0 && (
              <div className="px-4 py-12 text-center text-sm text-mute-500">
                No conversations yet. Connect with founders to start.
              </div>
            )}
            {threads.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveId(t.id)}
                className={`w-full text-left px-4 py-3 flex items-start gap-3 border-b border-mute-100 hover:bg-mute-50 transition-colors ${
                  activeId === t.id ? "bg-brand-soft" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-mute-100 flex items-center justify-center text-sm font-semibold text-mute-700 overflow-hidden shrink-0">
                  {t.other.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={t.other.photo_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    t.other.full_name?.[0] || "?"
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm truncate">
                      {t.other.full_name}
                    </div>
                    {t.unread_count > 0 && (
                      <span className="text-[10px] bg-brand text-white px-1.5 py-0.5 rounded-full ml-2">
                        {t.unread_count}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-mute-500 truncate mt-0.5">
                    {t.last_message
                      ? `${t.last_message.from_me ? "You: " : ""}${t.last_message.body}`
                      : "No messages yet"}
                  </div>
                </div>
              </button>
            ))}
          </aside>

          {/* Active thread */}
          <section className="md:col-span-2 flex flex-col">
            {active ? (
              <>
                <header className="px-4 py-3 border-b border-mute-200 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-mute-100 flex items-center justify-center text-sm font-semibold text-mute-700 overflow-hidden">
                    {active.other.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={active.other.photo_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      active.other.full_name?.[0] || "?"
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-sm">
                      {active.other.full_name}
                    </div>
                    <div className="text-xs text-mute-500">
                      {active.other.headline || active.other.email}
                    </div>
                  </div>
                </header>

                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 && (
                    <div className="text-center text-sm text-mute-500 py-8">
                      Start the conversation.
                    </div>
                  )}
                  {messages.map((m) => {
                    const fromMe = m.sender_id === me.id;
                    return (
                      <div
                        key={m.id}
                        className={`flex ${fromMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                            fromMe
                              ? "bg-brand text-white rounded-br-sm"
                              : "bg-mute-100 text-ink rounded-bl-sm"
                          }`}
                        >
                          <div className="whitespace-pre-wrap">{m.body}</div>
                          <div
                            className={`text-[10px] mt-1 ${
                              fromMe ? "text-white/70" : "text-mute-500"
                            }`}
                          >
                            {new Date(m.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <form
                  onSubmit={send}
                  className="border-t border-mute-200 p-3 flex gap-2"
                >
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Write a message…"
                    className="flex-1 rounded-lg border border-mute-200 bg-white px-4 py-2 text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    maxLength={4000}
                  />
                  <button
                    type="submit"
                    disabled={sending || !draft.trim()}
                    className="rounded-lg bg-brand hover:bg-brand-deep text-white px-4 disabled:opacity-60"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-mute-500 text-sm">
                Select a conversation
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
