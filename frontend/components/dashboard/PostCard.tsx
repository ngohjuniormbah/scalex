"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreHorizontal, Trash2, ExternalLink } from "lucide-react";
import { api, type PostDTO } from "@/lib/api";

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(iso).toLocaleDateString();
}

export function PostCard({
  post,
  currentUserId,
  onDeleted,
}: {
  post: PostDTO;
  currentUserId: number;
  onDeleted?: (id: number) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isMine = post.author_id === currentUserId;

  async function del() {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await api.deletePost(post.id);
      onDeleted?.(post.id);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(false);
      setMenuOpen(false);
    }
  }

  return (
    <article className="rounded-xl border border-mute-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-3">
        <Link
          href={`/founders/${post.author_id}`}
          className="flex items-start gap-3 min-w-0 flex-1"
        >
          <div className="w-10 h-10 rounded-full bg-mute-100 flex items-center justify-center text-sm font-semibold text-mute-700 shrink-0 overflow-hidden">
            {post.author_photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.author_photo}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              post.author_name?.[0] || "?"
            )}
          </div>
          <div className="min-w-0">
            <div className="font-medium text-sm text-ink truncate hover:text-brand">
              {post.author_name}
            </div>
            <div className="text-xs text-mute-500 truncate">
              {post.author_headline}
            </div>
            <div className="text-xs text-mute-400 mt-0.5">
              {timeAgo(post.created_at)}
            </div>
          </div>
        </Link>

        {isMine && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((s) => !s)}
              className="p-1.5 rounded hover:bg-mute-100 text-mute-500"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 z-10 bg-white border border-mute-200 rounded-lg shadow-lift py-1 min-w-[140px]">
                <button
                  onClick={del}
                  disabled={deleting}
                  className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-60"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {deleting ? "Deleting…" : "Delete post"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-4 pb-3 text-sm text-ink whitespace-pre-wrap">
        {post.body}
      </div>

      {/* Image */}
      {post.image_url && (
        <div className="border-t border-mute-100 bg-mute-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.image_url}
            alt=""
            className="w-full max-h-[500px] object-cover"
          />
        </div>
      )}

      {/* Link */}
      {post.link_url && (
        <a
          href={post.link_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block px-4 py-3 border-t border-mute-100 text-sm text-brand hover:bg-mute-50 flex items-center gap-2"
        >
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{post.link_url}</span>
        </a>
      )}
    </article>
  );
}
