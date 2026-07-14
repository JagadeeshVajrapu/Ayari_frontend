import { useSyncExternalStore } from 'react';

function subscribe() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

/** True only after hydration — use to gate localStorage / persisted store UI. */
export function useClientReady(): boolean {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
