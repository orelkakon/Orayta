import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const auth = request.cookies.get('auth')?.value;
  const { pathname } = request.nextUrl;

  const isPublic = pathname.startsWith('/login') || pathname.startsWith('/api/auth');
  const isAuthenticated = auth === 'admin' || auth === 'reader';

  if (!isAuthenticated && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthenticated && pathname === '/login') {
    return NextResponse.redirect(new URL('/study', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
