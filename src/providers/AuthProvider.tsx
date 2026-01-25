'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { createContext, useEffect, useMemo, useRef } from 'react';
import { createStore, StoreApi, useStore } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Actor } from '@/core';
import { createService } from '@/helpers/github/browser';

type UserProfile = {
  user: (Actor & { __access_token: string }) | null;
  signIn: (accessToken: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<StoreApi<UserProfile> | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const code = useMemo(() => searchParams.get('code'), [searchParams]);

  const storeRef = useRef<StoreApi<UserProfile> | null>(null);

  if (!storeRef.current) {
    // Migrate legacy misspelled access token key in persisted zustand store.
    // The persist middleware stores an object like { state: { user: ... }, version?: number }.
    // Be forgiving: if parsing fails or shape is unexpected, bail out silently.
    try {
      const storageKey = 'profile-storage';
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown; // safe, will validate below
        if (parsed && typeof parsed === 'object' && 'state' in (parsed as Record<string, unknown>) && parsed !== null) {
          const parsedRecord = parsed as Record<string, unknown>; // cast for index access
          const state = parsedRecord.state as Record<string, unknown> | undefined; // state shape unknown
          if (state && typeof state === 'object') {
            const user = state.user as Record<string, unknown> | undefined; // user may be null
            if (user && typeof user === 'object') {
              // If legacy misspelled key exists and correct key is missing, rename it.
              if (Object.hasOwn(user, '__acess_token') && !Object.hasOwn(user, '__access_token')) {
                // copy value and remove misspelled key in a type-safe way
                const userRecord = user as Record<string, unknown>;
                const legacyVal = userRecord.__acess_token; // eslint-disable-line @typescript-eslint/no-explicit-any -- runtime check above
                // Prefer keeping original value type; coerce to string if necessary
                userRecord.__access_token = typeof legacyVal === 'string' ? legacyVal : String(legacyVal); // eslint-disable-line @typescript-eslint/no-explicit-any -- runtime check above
                delete userRecord.__acess_token; // eslint-disable-line @typescript-eslint/no-explicit-any -- runtime check above
                // persist updated object back to localStorage
                parsedRecord.state = state;
                localStorage.setItem(storageKey, JSON.stringify(parsedRecord));
              }
            }
          }
        }
      }
    } catch {
      // ignore parse errors and any unexpected shapes — migration is optional
    }
    storeRef.current = createStore(
      persist<UserProfile>(
        (set) => ({
          user: null,
          signIn: async (accessToken: string) => {
            const user = await createService('profile', accessToken, false).viewer();
            set({ user: { ...user!, __access_token: accessToken } });
          },
          signOut: async () => {
            set({ user: null });
          }
        }),
        { name: 'profile-storage', storage: createJSONStorage(() => localStorage) }
      )
    );
  }

  const store = useStore(storeRef.current as StoreApi<UserProfile>);

  useEffect(() => {
    if (!code) return;

    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(`/api/auth/github/access_token?code=${code}`, { signal: controller.signal });
        const body = await res.json();
        if (!controller.signal.aborted && body.access_token) await store.signIn(body.access_token);
      } catch (_e) {
        // swallow aborted or network errors — auth flow should not crash the app
      } finally {
        router.push(pathname);
      }
    })();

    return () => controller.abort();
  }, [code]);

  return <AuthContext.Provider value={storeRef.current}>{children}</AuthContext.Provider>;
};
