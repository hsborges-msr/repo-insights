import { useCallback, useRef } from 'react';

export function useDebouncedCallback<T extends (...args: unknown[]) => void>(fn: T, delay = 100) {
  const timer = useRef<number | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timer.current) {
        window.clearTimeout(timer.current);
      }
      timer.current = window.setTimeout(() => fn(...(args as unknown as Parameters<T>)), delay);
    },
    [fn, delay]
  );
}