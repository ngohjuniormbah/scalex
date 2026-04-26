"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import { api, type ConnectionDTO } from "@/lib/api";
import { DashboardNav } from "@/components/dashboard/Nav";

export default function ConnectionsPage() {
  const { me, loading, logout } = useAuth();
  const [incoming, setIncoming] = useState<ConnectionDTO[]>([]);
  const [outgoing, setOutgoing] = useState<ConnectionDTO[]>([]);
  const [accepted, setAccepted] = useState<ConnectionDTO[]>([]);
  const [tab, setTab] = useState<"incoming" | "outgoing" | "accepted">(
    "incoming"
  );

  async function load() {
    const r = await api.myConnections();
    setIncoming(r.incoming);
    setOutgoing(r.outgoing);
    setAccepted(r.accepted);
  }

  useEffect(() => {
    if (!me) return;
    load();
  }, [me]);

  if (loading || !me) {
    return (
      <main className="min-h-screen bg-mute-50 flex items-center justify-center">
        <div className="text-mute-500 text-sm">Loading…</div>
      </main>
    );
  }

  const lists = {
    incoming: { items: incoming, otherKey: "requester" as const },
    outgoing: { items: outgoing, otherKey: "recipient" as const },
    accepted: { items: accepted, otherKey: "" as "" },
  };

  const tabs: Array<{ key: "incoming" | "outgoing" | "accepted"; label: string; count: number }> = [
    { key: "incoming", label: "Requests", count: incoming.length },
    { key: "outgoing", label: "Sent", count: outgoing.length },
    { key: "accepted", label: "Connected", count: accepted.length },
  ];

  return (
    <main className="min-h-screen bg-mute-50">
      <DashboardNav me={me} onLogout={logout} />

      <div className="mx-auto max-w-3xl px-4 md:px-6 py-8">
        <h1 className="display text-3xl mb-2">Network</h1>
        <p className="text-mute-500 mb-6">
          Manage your connections and pending requests.
        </p>

        <div className="rounded-xl border border-mute-200 bg-white">
          <div className="flex border-b border-mute-200">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  tab === t.key
                    ? "text-brand border-brand"
                    : "text-mute-500 border-transparent hover:text-ink"
                }`}
              >
                {t.label}
                {t.count > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-mute-100 text-xs">
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="divide-y divide-mute-100">
            {lists[tab].items.length === 0 && (
              <div className="px-6 py-12 text-center text-sm text-mute-500">
                Nothing here yet.
              </div>
            )}

            {tab === "incoming" &&
              incoming.map((c) => (
                <Row
                  key={c.id}
                  conn={c}
                  other={c.requester}
                  actions={
                    <IncomingActions
                      connId={c.id}
                      onUpdate={async () => load()}
                    />
                  }
                />
              ))}

            {tab === "outgoing" &&
              outgoing.map((c) => (
                <Row
                  key={c.id}
                  conn={c}
                  other={c.recipient}
                  actions={
                    <span className="text-sm text-mute-500">Pending</span>
                  }
                />
              ))}

            {tab === "accepted" &&
              accepted.map((c) => {
                const other =
                  c.requester.id === me.id ? c.recipient : c.requester;
                return (
                  <Row
                    key={c.id}
                    conn={c}
                    other={other}
                    actions={
                      <Link
                        href={`/messages?user=${other.id}`}
                        className="text-sm text-brand hover:text-brand-deep"
                      >
                        Message →
                      </Link>
                    }
                  />
                );
              })}
          </div>
        </div>
      </div>
    </main>
  );
}

function Row({
  conn,
  other,
  actions,
}: {
  conn: ConnectionDTO;
  other: ConnectionDTO["requester"];
  actions: React.ReactNode;
}) {
  return (
    <div className="px-6 py-4 flex items-center gap-4">
      <Link href={`/founders/${other.id}`} className="shrink-0">
        <div className="w-12 h-12 rounded-full bg-mute-100 flex items-center justify-center text-base font-semibold text-mute-700 overflow-hidden">
          {other.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={other.photo_url}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            other.full_name?.[0] || "?"
          )}
        </div>
      </Link>
      <div className="flex-1 min-w-0">
        <Link
          href={`/founders/${other.id}`}
          className="font-medium text-ink hover:text-brand"
        >
          {other.full_name}
        </Link>
        <div className="text-sm text-mute-500 truncate">
          {other.headline || other.email}
        </div>
        {conn.note && (
          <div className="text-xs text-mute-500 mt-1 italic">
            &ldquo;{conn.note}&rdquo;
          </div>
        )}
      </div>
      <div className="shrink-0">{actions}</div>
    </div>
  );
}

function IncomingActions({
  connId,
  onUpdate,
}: {
  connId: number;
  onUpdate: () => void;
}) {
  const [busy, setBusy] = useState(false);
  async function decide(action: "accept" | "decline") {
    setBusy(true);
    try {
      await api.respondConnection(connId, action);
      onUpdate();
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
