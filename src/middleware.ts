// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if user is authenticated
  const isAuthenticated = request.cookies.get('admin_auth')

  // If trying to access login page while authenticated, redirect to admin
  if (request.nextUrl.pathname === '/admin/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // If trying to access admin pages while not authenticated, redirect to login
  if (
    request.nextUrl.pathname != '/admin/login' &&
    request.nextUrl.pathname.startsWith('/admin') &&
    !isAuthenticated
  ) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/login']
}
