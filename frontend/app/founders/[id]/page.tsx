"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { UserPlus, MessageSquare, Check, Clock } from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import {
  api,
  type FounderPublic,
  type ConnectionDTO,
  type PostDTO,
} from "@/lib/api";
import { DashboardNav } from "@/components/dashboard/Nav";
import { ProfileCard } from "@/components/dashboard/ProfileCard";
import { PostCard } from "@/components/dashboard/PostCard";

export default function FounderDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const userId = parseInt(params.id, 10);
  const { me, loading, logout } = useAuth();
  const [founder, setFounder] = useState<FounderPublic | null>(null);
  const [conn, setConn] = useState<ConnectionDTO | null>(null);
  const [posts, setPosts] = useState<PostDTO[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (!me || !userId) return;
    api.founderDetail(userId).then(setFounder).catch(() => setFounder(null));
    api.myConnections().then((r) => {
      const all = [...r.incoming, ...r.outgoing, ...r.accepted];
      const found = all.find(
        (c) => c.requester.id === userId || c.recipient.id === userId
      );
      setConn(found || null);
    });
    api.postsByAuthor(userId).then(setPosts).catch(() => {});
  }, [me, userId]);

  async function connect() {
    setWorking(true);
    setError(null);
    try {
      const c = await api.connect(userId);
      setConn(c);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setWorking(false);
    }
  }

  async function message() {
    setWorking(true);
    setError(null);
    try {
      const t = await api.openThread(userId);
      router.push(`/messages?thread=${t.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setWorking(false);
    }
  }

  if (loading || !me) {
    return (
      <main className="min-h-screen bg-mute-50 flex items-center justify-center">
        <div className="text-mute-500 text-sm">Loading…</div>
      </main>
    );
  }

  if (!founder) {
    return (
      <main className="min-h-screen bg-mute-50">
        <DashboardNav me={me} onLogout={logout} />
        <div className="mx-auto max-w-3xl px-6 py-16 text-center text-mute-500">
          Founder not found or no longer searchable.
        </div>
      </main>
    );
  }

  const isAccepted = conn?.status === "accepted";
  const isPending = conn?.status === "pending";
  const ImIncomingRecipient =
    conn?.status === "pending" && conn.recipient.id === me.id;

  return (
    <main className="min-h-screen bg-mute-50">
      <DashboardNav me={me} onLogout={logout} />

      <div className="mx-auto max-w-3xl px-4 md:px-6 py-8 space-y-6">
        <ProfileCard
          founder={founder}
          rightSlot={
            <div className="flex flex-wrap gap-2 justify-end">
              {!conn && (
                <button
                  onClick={connect}
                  disabled={working}
                  className="inline-flex items-center gap-1.5 text-sm bg-brand hover:bg-brand-deep text-white rounded-lg px-3 py-1.5 disabled:opacity-60"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Connect
                </button>
              )}
              {isPending && !ImIncomingRecipient && (
                <span className="inline-flex items-center gap-1.5 text-sm text-mute-500 bg-mute-100 rounded-lg px-3 py-1.5">
                  <Clock className="w-3.5 h-3.5" /> Pending
                </span>
              )}
              {isPending && ImIncomingRecipient && (
                <ResponseButtons
                  connId={conn!.id}
                  onUpdate={(c) => setConn(c)}
                />
              )}
              {isAccepted && (
                <>
                  <span className="inline-flex items-center gap-1.5 text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-1.5">
                    <Check className="w-3.5 h-3.5" /> Connected
                  </span>
                  <button
                    onClick={message}
                    disabled={working}
                    className="inline-flex items-center gap-1.5 text-sm border border-mute-200 hover:border-brand text-ink rounded-lg px-3 py-1.5 bg-white"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Message
                  </button>
                </>
              )}
            </div>
          }
        />

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">
            {error}
          </div>
        )}

        {posts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-mute-700 uppercase tracking-wider px-1">
              Posts
            </h2>
            {posts.map((p) => (
              <PostCard key={p.id} post={p} currentUserId={me.id} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function ResponseButtons({
  connId,
  onUpdate,
}: {
  connId: number;
  onUpdate: (c: ConnectionDTO) => void;
}) {
  const [busy, setBusy] = useState(false);
  async function decide(action: "accept" | "decline") {
    setBusy(true);
    try {
      const c = await api.respondConnection(connId, action);
      onUpdate(c);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="flex gap-2">
      <button
        onClick={() => decide("accept")}
        disabled={busy}
        className="text-sm bg-brand hover:bg-brand-deep text-white rounded-lg px-3 py-1.5 disabled:opacity-60"
      >
        Accept
      </button>
      <button
        onClick={() => decide("decline")}
        disabled={busy}
        className="text-sm border border-mute-200 hover:border-mute-400 rounded-lg px-3 py-1.5 disabled:opacity-60"
      >
        Decline
      </button>
    </div>
  );
}
