import { createClient } from '@supabase/supabase-js'
import { apiAuth } from 'lib/apiAuth.js'

const requiredRole = "admin"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  apiAuth(requiredRole)
  try {
    const { userId, role } = await request.json()

    if (!userId || !role) {
      return Response.json({ error: 'User ID and role are required' }, { status: 400 })
    }

    // Update user's app_metadata with the new role
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      app_metadata: {
        role: role
      }
    })

    if (error) {
      console.error('Role update error:', error)
      return Response.json({ error: error.message }, { status: 400 })
    }

    return Response.json({ 
      success: true, 
      message: 'User role updated successfully',
      user: data.user 
    })

  } catch (error) {
    console.error('Error updating user role:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
