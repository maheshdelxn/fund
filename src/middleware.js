import { NextResponse } from 'next/server'

export function middleware(request) {
  // Get the pathname of the request (e.g. /, /dashboard, /members)
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === '/login' || path === '/' || path === '/register' || path === "/dashboard"

  // Get the token from the cookies or localStorage (we'll check client-side)
  const token = request.cookies.get('token')?.value || ''

  // Redirect logic
  if (isPublicPath && token) {
    // If user is logged in and tries to access login page, redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.nextUrl))
  }

  // If user is not logged in and tries to access protected route, redirect to login
  // Note: For client-side token in localStorage, we handle this in components
  // This middleware mainly handles cookie-based tokens

  return NextResponse.next()
}

// Configure which routes should be handled by this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
}