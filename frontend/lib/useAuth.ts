"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api, type Me } from "@/lib/api";

export function useAuth(redirectIfMissing: boolean = true) {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t =
      typeof window !== "undefined"
        ? localStorage.getItem("scalex_token")
        : null;
    if (!t) {
      setLoading(false);
      if (redirectIfMissing) router.push("/login");
      return;
    }
    api
      .me()
      .then(setMe)
      .catch(() => {
        localStorage.removeItem("scalex_token");
        if (redirectIfMissing) router.push("/login");
      })
      .finally(() => setLoading(false));
  }, [router, redirectIfMissing]);

  const logout = useCallback(() => {
    localStorage.removeItem("scalex_token");
    router.push("/");
  }, [router]);

  return { me, loading, logout };
}
