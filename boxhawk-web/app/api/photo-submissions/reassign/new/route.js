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
    const { sourceSubmissionId, imageIds = [], newSubmission } = await request.json()
    if (!sourceSubmissionId || !Array.isArray(imageIds) || imageIds.length === 0) {
      return Response.json({ error: 'sourceSubmissionId and imageIds are required' }, { status: 400 })
    }

    // 0) Load source submission to inherit required columns (e.g., created_by)
    const { data: sourceRow, error: srcErr } = await supabaseAdmin
      .from('photo_submissions')
      .select('id, created_by, manufacturer, name')
      .eq('id', sourceSubmissionId)
      .single()

    if (srcErr) return Response.json({ error: srcErr.message }, { status: 400 })

    // 1) Create new submission (inherit created_by to satisfy NOT NULL)
    if (!newSubmission?.name || !newSubmission?.manufacturer) {
      return Response.json({ error: 'newSubmission.name and newSubmission.manufacturer are required' }, { status: 400 })
    }

    const { data: created, error: createErr } = await supabaseAdmin
      .from('photo_submissions')
      .insert({
        name: newSubmission.name,
        manufacturer: newSubmission.manufacturer,
        labels: newSubmission?.labels || null,
        status: 'in_review',
        created_by: sourceRow?.created_by
      })
      .select('id')
      .single()

    if (createErr) return Response.json({ error: createErr.message }, { status: 400 })
    const newSubmissionId = created.id

    // 2) Fetch images to validate ownership
    const { data: images, error: fetchErr } = await supabaseAdmin
      .from('photo_submission_images')
      .select('id, submission_id, status')
      .in('id', imageIds)

    if (fetchErr) return Response.json({ error: fetchErr.message }, { status: 400 })

    const invalid = images.filter(i => i.submission_id !== sourceSubmissionId || i.status !== 'active')
    if (invalid.length > 0) {
      return Response.json({ error: 'Some images do not belong to the source submission or not active' }, { status: 400 })
    }

    // 3) Reassign
    const { error: updErr } = await supabaseAdmin
      .from('photo_submission_images')
      .update({ submission_id: newSubmissionId })
      .in('id', imageIds)

    if (updErr) return Response.json({ error: updErr.message }, { status: 400 })

    await supabaseAdmin.from('photo_submission_image_logs').insert(
      imageIds.map(id => ({ image_id: id, action: 'reassign', from_submission_id: sourceSubmissionId, to_submission_id: newSubmissionId }))
    )

    return Response.json({ newSubmissionId, movedCount: imageIds.length })
  } catch (e) {
    console.error('reassign to new submission failed', e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}


