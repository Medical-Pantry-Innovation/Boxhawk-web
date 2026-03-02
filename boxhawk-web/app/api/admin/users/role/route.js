import { NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabaseAdmin'
import { apiAuth } from 'lib/apiAuth.js'

const requiredRole = "admin"

export async function POST(req) {
  apiAuth(requiredRole)
  const { userId, role } = await req.json()
  
  try {
    const { error } = await adminClient.auth.admin.updateUserById(userId, {
      app_metadata: { role }
    })
    if (error) throw error
    
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false, message: e.message }, { status: 400 })
  }
}


