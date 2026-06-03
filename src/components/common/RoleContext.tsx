'use client';

import { createContext, useContext, useState } from 'react';

export type Role = 'admin' | 'reader';

function readRoleCookie(): Role {
  if (typeof document === 'undefined') return 'reader';
  const match = document.cookie.match(/(?:^|;\s*)role=([^;]+)/);
  return match?.[1] === 'admin' ? 'admin' : 'reader';
}

const RoleContext = createContext<Role>('reader');

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role] = useState<Role>(readRoleCookie);
  return <RoleContext.Provider value={role}>{children}</RoleContext.Provider>;
}

export const useRole = () => useContext(RoleContext);
