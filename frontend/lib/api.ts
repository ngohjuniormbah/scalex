const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("scalex_token") : null;

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  register: (data: { email: string; password: string; full_name: string }) =>
    apiFetch<{ token: string; user: { id: number; email: string } }>(
      "/api/auth/register/",
      { method: "POST", body: JSON.stringify(data) },
    ),
  login: (data: { email: string; password: string }) =>
    apiFetch<{ token: string; user: { id: number; email: string } }>(
      "/api/auth/login/",
      { method: "POST", body: JSON.stringify(data) },
    ),
  me: () => apiFetch<{ id: number; email: string; full_name: string }>("/api/auth/me/"),
  submitApplication: (data: Record<string, unknown>) =>
    apiFetch<{ id: number; status: string }>("/api/applications/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  myApplication: () =>
    apiFetch<{ id: number; status: string; current_step: number } | null>(
      "/api/applications/me/",
    ),
};
