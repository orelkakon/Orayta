'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type Role = 'admin' | 'reader';

const RoleContext = createContext<Role>('reader');

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>('reader');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data: { role: Role }) => setRole(data.role))
      .catch(() => {});
  }, []);

  return <RoleContext.Provider value={role}>{children}</RoleContext.Provider>;
}

export const useRole = () => useContext(RoleContext);
