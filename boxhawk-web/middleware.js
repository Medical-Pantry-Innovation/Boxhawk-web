import { NextResponse } from 'next/server'

// Emergency kill-switch: disable the privileged role-update endpoint by default.
// Re-enable by setting this to false (and redeploying).
const DISABLE_ADMIN_UPDATE_ROLE_API = true

export function middleware() {
  if (DISABLE_ADMIN_UPDATE_ROLE_API) {
    return new NextResponse(null, { status: 404 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/admin/update-role', '/api/admin/update-role/:path*']
}
