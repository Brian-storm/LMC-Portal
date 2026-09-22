"use client";

import { createContext, useContext, useCallback, useState, useEffect, useRef } from "react";

export interface FeatureFlagEntry {
  key: string;
  enabled: boolean;
  description: string;
  updatedAt: string;
}

interface FeatureFlagsContextValue {
  flags: FeatureFlagEntry[];
  loading: boolean;
  error: string | null;
  toggle: (key: string, enabled: boolean) => Promise<void>;
  refresh: () => Promise<void>;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextValue | null>(null);

export function FeatureFlagsProvider({ children }: { children: React.ReactNode }) {
  const [flags, setFlags] = useState<FeatureFlagEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  // Fetch flags on mount — use a ref guard to avoid the set-state-in-effect lint
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchFlags = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/feature-flags");
        if (!res.ok) throw new Error("Failed to fetch feature flags");
        const data = await res.json();
        setFlags(data);
      } catch (err) {
        console.error("Failed to load feature flags:", err);
        setError("Failed to load feature flags");
      } finally {
        setLoading(false);
      }
    };
    fetchFlags();
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/feature-flags");
      if (!res.ok) throw new Error("Failed to fetch feature flags");
      const data = await res.json();
      setFlags(data);
    } catch (err) {
      console.error("Failed to load feature flags:", err);
      setError("Failed to load feature flags");
    } finally {
      setLoading(false);
    }
  }, []);

  const toggle = useCallback(async (key: string, enabled: boolean) => {
    try {
      const res = await fetch(`/api/admin/feature-flags/${key}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      if (!res.ok) throw new Error("Failed to update feature flag");
      const updated = await res.json();
      setFlags((prev) => prev.map((f) => (f.key === key ? updated : f)));
    } catch (err) {
      console.error("Failed to toggle feature flag:", err);
      throw err;
    }
  }, []);

  return (
    <FeatureFlagsContext.Provider value={{ flags, loading, error, toggle, refresh }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags(): FeatureFlagsContextValue {
  const ctx = useContext(FeatureFlagsContext);
  if (!ctx) {
    throw new Error("useFeatureFlags must be used within a FeatureFlagsProvider");
  }
  return ctx;
}