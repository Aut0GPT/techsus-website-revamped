import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Only redirect /en and /es paths to their respective folders
  if (pathname.startsWith('/en') && !pathname.startsWith('/en/')) {
    // /en -> /en/
    return NextResponse.redirect(new URL('/en/', request.url))
  }

  if (pathname.startsWith('/es') && !pathname.startsWith('/es/')) {
    // /es -> /es/
    return NextResponse.redirect(new URL('/es/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/en', '/es']
}