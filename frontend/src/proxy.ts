import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get('token')?.value;

  // 1. Exclude static files, images, and API routes from redirection
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/maintenance' ||
    pathname === '/login' ||
    pathname === '/register'
  ) {
    return NextResponse.next();
  }

  // 2. Protect admin routes - Enforce token check
  if (pathname.startsWith('/admin')) {
    if (!token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  try {
    // 3. Check maintenance status from backend
    // Note: Use the internal or external URL. localhost:5000 is common for this setup.
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/system/maintenance-status`, {
      next: { revalidate: 60 } // Cache for 60 seconds to avoid slamming the DB
    });
    
    const data = await res.json();

    if (data.maintenanceMode === true) {
      return NextResponse.redirect(new URL('/maintenance', request.url));
    }
  } catch (error) {
    // If backend is down or unreachable, don't block unless we want a fail-safe lockout
    console.error('Maintenance check failed:', error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
