'use client';

import { createContext, useContext, useState } from 'react';

export type Role = 'admin' | 'reader';

const RoleContext = createContext<Role>('reader');

export function RoleProvider({ children }: { children: React.ReactNode }) {
  // Read cookie synchronously so the role is correct on the very first render —
  // eliminates the layout shift caused by a useEffect firing after paint.
  const [role] = useState<Role>(() => {
    if (typeof document === 'undefined') return 'reader';
    const match = document.cookie.match(/(?:^|;\s*)role=([^;]+)/);
    return match?.[1] === 'admin' ? 'admin' : 'reader';
  });

  return <RoleContext.Provider value={role}>{children}</RoleContext.Provider>;
}

export const useRole = () => useContext(RoleContext);
