import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getRedirectUrl } from './utils/getPath';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  if (['/_next', '/favicon.ico'].some((prefix) => request.nextUrl.pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname === '/') {
    return NextResponse.next();
  }

  if (!request.cookies.get('ep_token')) {
    return NextResponse.redirect(getRedirectUrl());
  }
}
