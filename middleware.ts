import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Prevent nested language paths like /en/es or /es/en
  if ((pathname.startsWith('/en/') && (pathname.includes('/es') || pathname.includes('/pt'))) ||
      (pathname.startsWith('/es/') && (pathname.includes('/en') || pathname.includes('/pt')))) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Only redirect /en and /es paths to their respective folders
  if (pathname === '/en') {
    return NextResponse.redirect(new URL('/en/', request.url))
  }

  if (pathname === '/es') {
    return NextResponse.redirect(new URL('/es/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/en',
    '/es',
    '/en/es/:path*',
    '/en/pt/:path*',
    '/es/en/:path*',
    '/es/pt/:path*'
  ]
}