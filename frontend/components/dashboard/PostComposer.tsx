"use client";

import { useRef, useState } from "react";
import { Image as ImageIcon, X, Loader2, Link as LinkIcon } from "lucide-react";
import { api, type Me, type PostDTO } from "@/lib/api";

export function PostComposer({
  me,
  onPosted,
}: {
  me: Me;
  onPosted: (p: PostDTO) => void;
}) {
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [posting, setPosting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function uploadImage(file: File) {
    setError(null);
    setUploading(true);
    try {
      const sig = await api.postUploadUrl(file.type || "image/jpeg");
      const put = await fetch(sig.upload_url, {
        method: "PUT",
        headers: { "Content-Type": file.type || "image/jpeg" },
        body: file,
      });
      if (!put.ok) throw new Error(`Upload failed (${put.status})`);
      setImageUrl(sig.public_url);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Image upload failed. Storage may not be configured."
      );
    } finally {
      setUploading(false);
    }
  }

  async function submit() {
    if (!body.trim()) return;
    setPosting(true);
    setError(null);
    try {
      const post = await api.createPost({
        body: body.trim(),
        image_url: imageUrl || undefined,
        link_url: linkUrl || undefined,
      });
      onPosted(post);
      setBody("");
      setImageUrl("");
      setLinkUrl("");
      setShowLinkInput(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Post failed");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="rounded-xl border border-mute-200 bg-white p-4">
      <div className="flex gap-3 items-start">
        <div className="w-10 h-10 rounded-full bg-mute-100 flex items-center justify-center text-sm font-semibold text-mute-700 shrink-0">
          {me.full_name?.[0] || "?"}
        </div>
        <div className="flex-1">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share an update, a milestone, a launch…"
            className="w-full resize-none border-0 outline-none placeholder:text-mute-400 text-sm min-h-[60px] focus:ring-0 p-0"
            maxLength={4000}
          />

          {imageUrl && (
            <div className="relative mt-3 rounded-lg overflow-hidden border border-mute-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="" className="w-full max-h-80 object-cover" />
              <button
                onClick={() => setImageUrl("")}
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {showLinkInput && (
            <input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://… (optional link)"
              className="mt-3 w-full text-sm rounded-lg border border-mute-200 px-3 py-2 focus:outline-none focus:border-brand"
            />
          )}

          {error && (
            <div className="mt-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded px-2.5 py-1.5">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-mute-100">
            <div className="flex items-center gap-1 text-mute-500">
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm rounded-lg hover:bg-mute-100 disabled:opacity-60"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ImageIcon className="w-4 h-4" />
                )}
                Photo
              </button>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadImage(f);
                }}
              />
              <button
                type="button"
                onClick={() => setShowLinkInput((s) => !s)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm rounded-lg hover:bg-mute-100 ${
                  showLinkInput ? "text-brand" : ""
                }`}
              >
                <LinkIcon className="w-4 h-4" />
                Link
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-mute-400">{body.length}/4000</span>
              <button
                onClick={submit}
                disabled={posting || !body.trim()}
                className="rounded-lg bg-brand hover:bg-brand-deep text-white text-sm font-medium px-4 py-1.5 disabled:opacity-50"
              >
                {posting ? "Posting…" : "Post"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
