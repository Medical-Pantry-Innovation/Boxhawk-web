import { NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabaseAdmin'
import { apiAuth } from 'lib/apiAuth.js'

const requiredRole = "admin"

export async function POST(req) {
  const { email, password, role = 'photouser', invite = false } = await req.json()
  apiAuth(requiredRole)
  try {
    let userId

    if (invite) {
      const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email)
      if (error) throw error
      userId = data.user.id
    } else {
      const { data, error } = await adminClient.auth.admin.createUser({
        email, 
        password, 
        email_confirm: true
      })
      if (error) throw error
      userId = data.user.id
    }

    // Set role in app_metadata
    const { error: updErr } = await adminClient.auth.admin.updateUserById(userId, {
      app_metadata: { role }
    })
    if (updErr) throw updErr

    return NextResponse.json({ ok: true, userId })
  } catch (e) {
    return NextResponse.json({ ok: false, message: e.message }, { status: 400 })
  }
}


