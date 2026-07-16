import { NextRequest, NextResponse } from 'next/server';

// The site is public (read-only for everyone). Login exists only for the admin;
// API routes still verify the httpOnly `auth` cookie for any mutation.
export function middleware(request: NextRequest) {
  const auth = request.cookies.get('auth')?.value;
  const { pathname } = request.nextUrl;

  if (auth === 'admin' && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
