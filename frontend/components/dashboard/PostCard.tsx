"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MoreHorizontal,
  Trash2,
  ExternalLink,
  Heart,
  MessageCircle,
} from "lucide-react";
import { api, type PostDTO, type CommentDTO } from "@/lib/api";

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(iso).toLocaleDateString();
}

export function PostCard({
  post: initialPost,
  currentUserId,
  onDeleted,
}: {
  post: PostDTO;
  currentUserId: number;
  onDeleted?: (id: number) => void;
}) {
  const [post, setPost] = useState<PostDTO>(initialPost);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<CommentDTO[] | null>(null);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [liking, setLiking] = useState(false);

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

  async function toggleLike() {
    if (liking) return;
    setLiking(true);
    // Optimistic update
    const wasLiked = post.liked_by_me;
    setPost((p) => ({
      ...p,
      liked_by_me: !wasLiked,
      like_count: p.like_count + (wasLiked ? -1 : 1),
    }));
    try {
      const res = wasLiked
        ? await api.unlikePost(post.id)
        : await api.likePost(post.id);
      setPost((p) => ({
        ...p,
        liked_by_me: res.liked_by_me,
        like_count: res.like_count,
      }));
    } catch (e) {
      // Roll back
      setPost((p) => ({
        ...p,
        liked_by_me: wasLiked,
        like_count: p.like_count + (wasLiked ? 1 : -1),
      }));
    } finally {
      setLiking(false);
    }
  }

  async function loadComments() {
    if (comments !== null) return;
    setCommentsLoading(true);
    try {
      const cs = await api.postComments(post.id);
      setComments(cs);
    } catch (e) {
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  }

  async function toggleCommentsOpen() {
    const willOpen = !commentsOpen;
    setCommentsOpen(willOpen);
    if (willOpen) await loadComments();
  }

  async function submitComment() {
    if (!newComment.trim() || posting) return;
    setPosting(true);
    try {
      const c = await api.addComment(post.id, newComment.trim());
      setComments((cur) => [...(cur || []), c]);
      setPost((p) => ({ ...p, comment_count: p.comment_count + 1 }));
      setNewComment("");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Comment failed");
    } finally {
      setPosting(false);
    }
  }

  async function deleteComment(commentId: number) {
    if (!confirm("Delete this comment?")) return;
    try {
      await api.deleteComment(commentId);
      setComments((cur) => (cur || []).filter((c) => c.id !== commentId));
      setPost((p) => ({
        ...p,
        comment_count: Math.max(0, p.comment_count - 1),
      }));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
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

      {/* Stats summary (only show when there's activity) */}
      {(post.like_count > 0 || post.comment_count > 0) && (
        <div className="px-4 pt-3 pb-2 text-xs text-mute-500 flex items-center gap-3 border-t border-mute-100">
          {post.like_count > 0 && (
            <span className="inline-flex items-center gap-1">
              <Heart className="w-3 h-3 fill-brand text-brand" />
              {post.like_count}
            </span>
          )}
          {post.comment_count > 0 && (
            <button
              onClick={toggleCommentsOpen}
              className="hover:text-brand"
            >
              {post.comment_count}{" "}
              {post.comment_count === 1 ? "comment" : "comments"}
            </button>
          )}
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center border-t border-mute-100">
        <button
          onClick={toggleLike}
          disabled={liking}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors hover:bg-mute-50 ${
            post.liked_by_me ? "text-brand" : "text-mute-700"
          }`}
        >
          <Heart
            className={`w-4 h-4 ${
              post.liked_by_me ? "fill-brand text-brand" : ""
            }`}
          />
          Like
        </button>
        <div className="w-px h-6 bg-mute-100" />
        <button
          onClick={toggleCommentsOpen}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-mute-700 hover:bg-mute-50"
        >
          <MessageCircle className="w-4 h-4" />
          Comment
        </button>
      </div>

      {/* Comments section */}
      {commentsOpen && (
        <div className="border-t border-mute-100 bg-mute-50/30 px-4 py-3 space-y-3">
          {commentsLoading && (
            <p className="text-xs text-mute-500">Loading comments…</p>
          )}

          {!commentsLoading && comments && comments.length === 0 && (
            <p className="text-xs text-mute-500">
              No comments yet. Be the first to share your thoughts.
            </p>
          )}

          {comments?.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              currentUserId={currentUserId}
              onDelete={() => deleteComment(c.id)}
            />
          ))}

          <div className="flex items-start gap-2 pt-2">
            <div className="w-8 h-8 rounded-full bg-mute-100 flex items-center justify-center text-xs font-semibold text-mute-700 shrink-0">
              {/* current user initial — keep neutral for layout */}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment…"
                className="w-full text-sm rounded-lg border border-mute-200 bg-white px-3 py-2 resize-none min-h-[36px] focus:outline-none focus:border-brand"
                rows={1}
                maxLength={2000}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submitComment();
                  }
                }}
              />
              <div className="flex justify-end mt-1.5">
                <button
                  onClick={submitComment}
                  disabled={!newComment.trim() || posting}
                  className="text-xs bg-brand hover:bg-brand-deep text-white rounded px-3 py-1 disabled:opacity-50"
                >
                  {posting ? "Posting…" : "Comment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

function CommentItem({
  comment,
  currentUserId,
  onDelete,
}: {
  comment: CommentDTO;
  currentUserId: number;
  onDelete: () => void;
}) {
  const isMine = comment.author_id === currentUserId;
  return (
    <div className="flex items-start gap-2">
      <Link
        href={`/founders/${comment.author_id}`}
        className="w-8 h-8 rounded-full bg-mute-100 flex items-center justify-center text-xs font-semibold text-mute-700 shrink-0 overflow-hidden"
      >
        {comment.author_photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={comment.author_photo}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          comment.author_name?.[0] || "?"
        )}
      </Link>
      <div className="flex-1 min-w-0">
        <div className="rounded-lg bg-white border border-mute-200 px-3 py-2">
          <div className="flex items-baseline justify-between gap-2">
            <Link
              href={`/founders/${comment.author_id}`}
              className="text-xs font-semibold text-ink hover:text-brand truncate"
            >
              {comment.author_name}
            </Link>
            {isMine && (
              <button
                onClick={onDelete}
                className="text-[10px] text-mute-400 hover:text-red-600"
              >
                Delete
              </button>
            )}
          </div>
          <div className="text-sm text-ink whitespace-pre-wrap mt-0.5">
            {comment.body}
        </div>
      </div>
        <div className="text-[10px] text-mute-400 mt-1 ml-3">
          {new Date(comment.created_at).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
