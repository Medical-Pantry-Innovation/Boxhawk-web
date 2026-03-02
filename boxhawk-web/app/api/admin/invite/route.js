// Redirect to the new invitations API
import { apiAuth } from 'lib/apiAuth.js'

const requiredRole = "admin"

export async function POST(request) {
  apiAuth(requiredRole)
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/admin/invitations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(await request.json())
  })
  
  return response
}
