import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const auth = request.cookies.get('auth')?.value;
  const { pathname } = request.nextUrl;

  const isPublic = pathname.startsWith('/login') || pathname.startsWith('/api/auth');

  if (!auth && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (auth && pathname === '/login') {
    return NextResponse.redirect(new URL('/study', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
