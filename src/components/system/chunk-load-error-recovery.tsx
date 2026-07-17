'use client';

import { useEffect } from 'react';

const RELOAD_KEY = 'ayari-chunk-reload';

/**
 * Hostinger / CDN deploys can briefly serve HTML from a new build while old
 * hashed chunks 404 (or return text/plain). One hard reload usually recovers.
 */
export function ChunkLoadErrorRecovery() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      const message = event.message || '';
      const isChunkError =
        message.includes('ChunkLoadError') ||
        message.includes('Loading chunk') ||
        message.includes('Failed to fetch dynamically imported module');

      if (!isChunkError) return;

      try {
        const last = sessionStorage.getItem(RELOAD_KEY);
        const now = String(Date.now());
        // Avoid reload loops — only once per 30s
        if (last && Date.now() - Number(last) < 30_000) return;
        sessionStorage.setItem(RELOAD_KEY, now);
      } catch {
        // sessionStorage unavailable — still attempt one reload via flag on window
        const w = window as Window & { __ayariChunkReloaded?: boolean };
        if (w.__ayariChunkReloaded) return;
        w.__ayariChunkReloaded = true;
      }

      window.location.reload();
    };

    window.addEventListener('error', onError);
    return () => window.removeEventListener('error', onError);
  }, []);

  return null;
}
