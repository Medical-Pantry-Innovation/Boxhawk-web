import { NextResponse } from 'next/server'

// Emergency kill-switch: disable all /api/admin/* endpoints by default.
// Re-enable by setting this to false (and redeploying).
const DISABLE_ADMIN_API = true

export function middleware() {
  if (DISABLE_ADMIN_API) {
    return new NextResponse(null, { status: 404 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/admin/:path*']
}

