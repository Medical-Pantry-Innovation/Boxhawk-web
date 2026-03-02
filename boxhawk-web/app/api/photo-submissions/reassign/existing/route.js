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
    const { targetSubmissionId, imageIds = [] } = await request.json()
    if (!targetSubmissionId || !Array.isArray(imageIds) || imageIds.length === 0) {
      return Response.json({ error: 'targetSubmissionId and imageIds are required' }, { status: 400 })
    }

    // ensure target exists
    const { error: tgtErr } = await supabaseAdmin
      .from('photo_submissions')
      .select('id')
      .eq('id', targetSubmissionId)
      .single()
    if (tgtErr) return Response.json({ error: 'target submission not found' }, { status: 400 })

    const { error: updErr } = await supabaseAdmin
      .from('photo_submission_images')
      .update({ submission_id: targetSubmissionId })
      .in('id', imageIds)

    if (updErr) return Response.json({ error: updErr.message }, { status: 400 })

    await supabaseAdmin.from('photo_submission_image_logs').insert(
      imageIds.map(id => ({ image_id: id, action: 'reassign', to_submission_id: targetSubmissionId }))
    )

    return Response.json({ movedCount: imageIds.length })
  } catch (e) {
    console.error('reassign to existing failed', e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}


