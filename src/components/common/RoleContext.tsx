'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type Role = 'admin' | 'reader';

const RoleContext = createContext<Role>('admin');

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>('admin');

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)role=([^;]+)/);
    if (match) setRole(match[1] === 'reader' ? 'reader' : 'admin');
  }, []);

  return <RoleContext.Provider value={role}>{children}</RoleContext.Provider>;
}

export const useRole = () => useContext(RoleContext);
