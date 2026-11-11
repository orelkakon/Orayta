import { useEffect, useState } from 'react';
import { InstallMode, initInstall, installMode, subscribeInstall } from '@/lib/install';

/** How the app can be installed here right now (null on the server, when installed, or unsupported). */
export function useInstallMode(): InstallMode {
  const [mode, setMode] = useState<InstallMode>(null);
  useEffect(() => {
    initInstall();
    const sync = () => setMode(installMode());
    sync();
    return subscribeInstall(sync);
  }, []);
  return mode;
}
