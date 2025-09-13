import { NextRequest, NextResponse } from 'next/server'

// Supported locales
const locales = ['pt', 'en', 'es']
const defaultLocale = 'pt'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if pathname starts with a locale
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  // Handle root path - Portuguese is at root
  if (pathname === '/') {
    const response = NextResponse.next()
    response.headers.set('x-pathname', pathname)
    return response
  }

  // Prevent nested language paths like /en/es, /es/en, etc.
  const pathSegments = pathname.split('/').filter(Boolean)
  if (pathSegments.length >= 2) {
    const firstSegment = pathSegments[0]
    const secondSegment = pathSegments[1]

    // If first segment is a locale and second segment is also a locale, redirect to root
    if (locales.includes(firstSegment) && locales.includes(secondSegment)) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Handle /en and /es without trailing slash
  if (pathname === '/en' || pathname === '/es') {
    return NextResponse.redirect(new URL(`${pathname}/`, request.url))
  }

  // Handle paths that don't start with a locale (excluding Portuguese which is at root)
  if (!pathnameHasLocale && !pathname.startsWith('/_next') && !pathname.startsWith('/api') && !pathname.startsWith('/images') && !pathname.includes('.')) {
    // For Portuguese pages at root, just continue
    const response = NextResponse.next()
    response.headers.set('x-pathname', pathname)
    return response
  }

  // Validate locale paths - if someone tries to access /en/invalid-page, check if the page exists
  if (pathname.startsWith('/en/') || pathname.startsWith('/es/')) {
    const validPaths = [
      '',  // Allow the root of each locale
      'contato',
      'estrategia',
      'investidores',
      'live-cameras',
      'mercado',
      'parcerias',
      'processo',
      'produtos',
      'quem-somos',
      'sistema'
    ]

    const pathWithoutLocale = pathname.replace(/^\/(en|es)\//, '')

    // If it's not a valid path and not the root of the locale, let Next.js handle 404
    if (pathWithoutLocale && !validPaths.includes(pathWithoutLocale)) {
      // Let Next.js handle the 404
      const response = NextResponse.next()
      response.headers.set('x-pathname', pathname)
      return response
    }
  }

  // Set locale cookie for persistence
  const response = NextResponse.next()

  // Pass the pathname to the layout
  response.headers.set('x-pathname', pathname)

  // Determine current locale from path
  let currentLocale = defaultLocale
  if (pathname.startsWith('/en')) {
    currentLocale = 'en'
  } else if (pathname.startsWith('/es')) {
    currentLocale = 'es'
  }

  // Set cookie to remember user's language preference
  response.cookies.set('locale', currentLocale, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax',
    path: '/'
  })

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions (except for root paths)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ]
}