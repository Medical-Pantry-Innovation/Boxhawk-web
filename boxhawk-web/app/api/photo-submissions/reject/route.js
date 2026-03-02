import { createClient } from '@supabase/supabase-js'
import { apiAuth } from 'lib/apiAuth.js'

const requiredRole = "expert"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  apiAuth(requiredRole)
  try {
    const { submissionId } = await request.json()

    if (!submissionId) {
      return Response.json({ error: 'submissionId is required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('photo_submissions')
      .update({
        status: 'rejected',
        reviewed: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', submissionId)
      .select('id')

    if (error) {
      console.error('reject submission error:', error)
      return Response.json({ error: error.message }, { status: 400 })
    }

    if (!data || data.length === 0) {
      return Response.json({ error: 'Submission not found' }, { status: 404 })
    }

    return Response.json({ success: true })
  } catch (e) {
    console.error('reject submission failed:', e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}


