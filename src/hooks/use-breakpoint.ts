// ── SSR-safe matchMedia hook ──
// Defaults to false (mobile-first assumption) on server / before hydration.
// Uses a single MediaQueryList per breakpoint, shared across all hook instances.

import { useCallback, useSyncExternalStore } from "react";

// ── Breakpoint definitions (Tailwind v4 defaults) ──
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

type Breakpoint = keyof typeof BREAKPOINTS;
type BreakpointState = Record<`is${Capitalize<Breakpoint>}`, boolean>;

// Global store: one MediaQueryList per breakpoint, shared across all hook instances
const queryLists = new Map<string, MediaQueryList>();
function getQueryList(breakpoint: Breakpoint): MediaQueryList {
  const key = `(min-width: ${BREAKPOINTS[breakpoint]}px)`;
  if (!queryLists.has(key)) {
    queryLists.set(key, window.matchMedia(key));
  }
  return queryLists.get(key)!;
}

function subscribe(breakpoint: Breakpoint, callback: () => void) {
  const mql = getQueryList(breakpoint);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot(breakpoint: Breakpoint): boolean {
  return getQueryList(breakpoint).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

export function useBreakpoint(): BreakpointState {
  const isSm = useSyncExternalStore(
    useCallback((cb) => subscribe("sm", cb), []),
    useCallback(() => getSnapshot("sm"), []),
    getServerSnapshot,
  );
  const isMd = useSyncExternalStore(
    useCallback((cb) => subscribe("md", cb), []),
    useCallback(() => getSnapshot("md"), []),
    getServerSnapshot,
  );
  const isLg = useSyncExternalStore(
    useCallback((cb) => subscribe("lg", cb), []),
    useCallback(() => getSnapshot("lg"), []),
    getServerSnapshot,
  );
  const isXl = useSyncExternalStore(
    useCallback((cb) => subscribe("xl", cb), []),
    useCallback(() => getSnapshot("xl"), []),
    getServerSnapshot,
  );

  return { isSm, isMd, isLg, isXl };
}