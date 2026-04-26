"""
Thin Supabase Storage helper.

We use signed upload URLs so the browser uploads directly to Supabase
without ever streaming bytes through our Django dyno. This keeps our
Render free instance fast and within memory limits.

Configuration via env vars:
    SUPABASE_URL          e.g. https://abc123.supabase.co
    SUPABASE_SERVICE_KEY  service_role key (NEVER ship to frontend)
    SUPABASE_BUCKET       bucket name (default: scalex-media)
"""
from __future__ import annotations

import os
import uuid
from typing import TypedDict

import urllib.request
import urllib.error
import json


class UploadInstructions(TypedDict):
    upload_url: str
    public_url: str
    path: str
    token: str


def _env(key: str, default: str = "") -> str:
    return os.environ.get(key, default)


def get_signed_upload_url(
    user_id: int, kind: str, content_type: str = "image/jpeg"
) -> UploadInstructions:
    """
    Ask Supabase for a one-time signed URL the browser can PUT to.
    """
    base = _env("SUPABASE_URL").rstrip("/")
    service_key = _env("SUPABASE_SERVICE_KEY")
    bucket = _env("SUPABASE_BUCKET", "scalex-media")

    if not base or not service_key:
        raise RuntimeError(
            "SUPABASE_URL and SUPABASE_SERVICE_KEY must be set for uploads"
        )

    ext = _ext_for_content_type(content_type)
    path = f"users/{user_id}/{kind}-{uuid.uuid4().hex}{ext}"

    # Step 1: ask Supabase Storage for a signed upload URL
    api = f"{base}/storage/v1/object/upload/sign/{bucket}/{path}"
    req = urllib.request.Request(
        api,
        method="POST",
        headers={
            "Authorization": f"Bearer {service_key}",
            "Content-Type": "application/json",
        },
        data=b"{}",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            payload = json.loads(resp.read().decode())
    except urllib.error.HTTPError as exc:
        body = exc.read().decode(errors="ignore")
        raise RuntimeError(f"Supabase signed-url failed ({exc.code}): {body}")

    # payload: { "url": "/object/upload/sign/...?token=...", "token": "..." }
    upload_url = base + "/storage/v1" + payload["url"]
    token = payload.get("token", "")

    public_url = f"{base}/storage/v1/object/public/{bucket}/{path}"

    return UploadInstructions(
        upload_url=upload_url, public_url=public_url, path=path, token=token
    )


def _ext_for_content_type(ct: str) -> str:
    return {
        "image/jpeg": ".jpg",
        "image/jpg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "image/gif": ".gif",
    }.get(ct.lower(), ".bin")
