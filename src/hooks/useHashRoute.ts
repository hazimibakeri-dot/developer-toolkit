import { useSyncExternalStore } from 'react';

function subscribe(onChange: () => void): () => void {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

const getHash = () => window.location.hash;
const getServerHash = () => '';

/**
 * Reads the current route from the URL fragment (`#/json`). Fragment routing works on any
 * static host without server rewrites, and the fragment is never sent to the server.
 */
export function useHashRoute<T extends string>(routes: readonly T[], fallback: T): T {
  const hash = useSyncExternalStore(subscribe, getHash, getServerHash);
  const id = decodeURIComponent(hash.replace(/^#\/?/, ''));
  return (routes as readonly string[]).includes(id) ? (id as T) : fallback;
}
