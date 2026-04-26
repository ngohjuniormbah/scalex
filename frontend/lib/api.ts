const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type Me = {
  id: number;
  email: string;
  full_name: string;
  is_verified: boolean;
  is_staff: boolean;
};

export type Application = {
  id: number;
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected";
  current_step: number;
  user_email?: string;
  user_full_name?: string;
  company_name: string;
  one_liner: string;
  stage: string;
  sector: string;
  website: string;
  pitch_deck_url: string;
  bio: string;
  linkedin: string;
  location: string;
  incorporated_in: string;
  incorporation_date: string | null;
  cofounders_count: number;
  fulltime_count: number;
  revenue: string;
  users: string;
  growth_rate: string;
  previous_funding: string;
  references: string;
  vision: string;
  market: string;
  team: string;
  why_now: string;
  terms_accepted: boolean;
  accuracy_attested: boolean;
  decision_notes: string;
  submitted_at: string;
  updated_at: string;
  decided_at: string | null;
};

export type FounderPublic = {
  id: number;
  full_name: string;
  is_verified: boolean;
  headline: string;
  bio: string;
  location: string;
  photo_url: string;
  banner_url: string;
  linkedin: string;
  github: string;
  twitter: string;
  website: string;
  skills: string[];
  sectors_of_interest: string[];
  looking_for: string;
};

export type FounderSelf = FounderPublic & {
  email: string;
  legal_name: string;
  date_of_birth: string | null;
  country: string;
  phone: string;
  is_searchable: boolean;
};

export type ConnectionDTO = {
  id: number;
  status: "pending" | "accepted" | "declined";
  note: string;
  created_at: string;
  decided_at: string | null;
  requester: { id: number; full_name: string; email: string; headline: string; photo_url: string };
  recipient: { id: number; full_name: string; email: string; headline: string; photo_url: string };
};

export type ThreadDTO = {
  id: number;
  other: { id: number; full_name: string; email: string; headline: string; photo_url: string };
  last_message: { body: string; created_at: string; from_me: boolean } | null;
  unread_count: number;
  last_activity: string;
};

export type MessageDTO = {
  id: number;
  sender_id: number;
  body: string;
  created_at: string;
  read_at: string | null;
};

export type PostDTO = {
  id: number;
  author_id: number;
  author_name: string;
  author_headline: string;
  author_photo: string;
  body: string;
  image_url: string;
  link_url: string;
  created_at: string;
  updated_at: string;
};

function authHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const t = localStorage.getItem("scalex_token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    let detail = `Request failed: ${res.status}`;
    try {
      const body = await res.json();
      detail = body.detail || JSON.stringify(body);
    } catch {
      try {
        detail = await res.text();
      } catch {}
    }
    throw new Error(detail);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  // Auth
  register: (data: { email: string; password: string; full_name: string }) =>
    apiFetch<{ token: string; refresh: string; user: Me }>("/api/auth/register/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  login: (data: { email: string; password: string }) =>
    apiFetch<{ token: string; refresh: string; user: Me }>("/api/auth/login/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  me: () => apiFetch<Me>("/api/auth/me/"),

  // Applications
  submitApplication: (data: Partial<Application>) =>
    apiFetch<Application>("/api/applications/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  myApplication: () => apiFetch<Application | null>("/api/applications/me/"),

  // Founder profile
  myProfile: () => apiFetch<FounderSelf>("/api/founders/me/"),
  updateProfile: (data: Partial<FounderSelf>) =>
    apiFetch<FounderSelf>("/api/founders/me/", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  directory: (q?: string, sector?: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (sector) params.set("sector", sector);
    return apiFetch<FounderPublic[]>(
      `/api/founders/${params.toString() ? "?" + params : ""}`
    );
  },
  founderDetail: (id: number) =>
    apiFetch<FounderPublic>(`/api/founders/${id}/`),
  uploadUrl: (kind: "photo" | "banner", contentType: string) =>
    apiFetch<{ upload_url: string; public_url: string; token: string }>(
      "/api/founders/upload-url/",
      {
        method: "POST",
        body: JSON.stringify({ kind, content_type: contentType }),
      }
    ),

  // Connections
  connect: (userId: number, note?: string) =>
    apiFetch<ConnectionDTO>(`/api/social/connect/${userId}/`, {
      method: "POST",
      body: JSON.stringify({ note: note || "" }),
    }),
  myConnections: () =>
    apiFetch<{
      incoming: ConnectionDTO[];
      outgoing: ConnectionDTO[];
      accepted: ConnectionDTO[];
    }>("/api/social/connections/"),
  respondConnection: (connId: number, action: "accept" | "decline") =>
    apiFetch<ConnectionDTO>(`/api/social/connections/${connId}/respond/`, {
      method: "POST",
      body: JSON.stringify({ action }),
    }),

  // Messages
  threads: () => apiFetch<ThreadDTO[]>("/api/social/threads/"),
  openThread: (userId: number) =>
    apiFetch<ThreadDTO>(`/api/social/threads/open/${userId}/`, {
      method: "POST",
    }),
  threadMessages: (threadId: number) =>
    apiFetch<MessageDTO[]>(`/api/social/threads/${threadId}/messages/`),
  sendMessage: (threadId: number, body: string) =>
    apiFetch<MessageDTO>(`/api/social/threads/${threadId}/messages/`, {
      method: "POST",
      body: JSON.stringify({ body }),
    }),

  // Posts
  feed: () => apiFetch<PostDTO[]>("/api/posts/"),
  createPost: (data: { body: string; image_url?: string; link_url?: string }) =>
    apiFetch<PostDTO>("/api/posts/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  postsByAuthor: (userId: number) =>
    apiFetch<PostDTO[]>(`/api/posts/by/${userId}/`),
  deletePost: (postId: number) =>
    apiFetch<void>(`/api/posts/${postId}/`, { method: "DELETE" }),
  postUploadUrl: (contentType: string) =>
    apiFetch<{ upload_url: string; public_url: string; token: string }>(
      "/api/posts/upload-url/",
      {
        method: "POST",
        body: JSON.stringify({ content_type: contentType }),
      }
    ),

  // Admin
  adminStats: () =>
    apiFetch<{
      total: number;
      submitted: number;
      under_review: number;
      approved: number;
      rejected: number;
    }>("/api/applications/admin/stats/"),
  adminList: (status?: string, q?: string) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (q) params.set("q", q);
    return apiFetch<Application[]>(
      `/api/applications/admin/list/${params.toString() ? "?" + params : ""}`
    );
  },
  adminDetail: (id: number) =>
    apiFetch<Application>(`/api/applications/admin/${id}/`),
  adminDecide: (id: number, decision: "approve" | "reject" | "review", notes: string) =>
    apiFetch<Application>(`/api/applications/admin/${id}/decide/`, {
      method: "POST",
      body: JSON.stringify({ decision, notes }),
    }),
};
