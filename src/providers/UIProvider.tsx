'use client';

import { HeroUIProvider } from '@heroui/react';
import { ReactNode } from 'react';

export function UIProvider({ children, className }: { children: ReactNode; className?: string }) {
  return <HeroUIProvider className={className}>{children}</HeroUIProvider>;
}