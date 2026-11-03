/**
 * Full-screen routes that render without the app chrome (header, tab bar,
 * footer): the immersive feed, the group-quiz stages, login, and /books
 * (a redirect).
 */
export function isBareRoute(pathname: string): boolean {
  return pathname === '/feed'
    || pathname.startsWith('/play')
    || pathname === '/login'
    || pathname.startsWith('/books');
}

/** Pages laid out on the wider desktop canvas (multi-column). */
export function isWideRoute(pathname: string): boolean {
  return pathname === '/';
}
