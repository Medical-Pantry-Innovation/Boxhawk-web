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
    const { imageIds = [], hardDelete = false } = await request.json()
    if (!Array.isArray(imageIds) || imageIds.length === 0) {
      return Response.json({ error: 'imageIds is required' }, { status: 400 })
    }

    // fetch paths
    const { data: images, error: fetchErr } = await supabaseAdmin
      .from('photo_submission_images')
      .select('id, storage_path, status')
      .in('id', imageIds)

    if (fetchErr) return Response.json({ error: fetchErr.message }, { status: 400 })

    if (!hardDelete) {
      const { error } = await supabaseAdmin
        .from('photo_submission_images')
        .update({ status: 'deleted' })
        .in('id', imageIds)
        .select('id')

      if (error) return Response.json({ error: error.message }, { status: 400 })

      await supabaseAdmin.from('photo_submission_image_logs').insert(
        images.map(i => ({ image_id: i.id, action: 'delete_soft' }))
      )
      return Response.json({ softDeleted: images.length })
    }

    // hard delete: remove from storage then delete rows
    const paths = images.map(i => i.storage_path)
    const { error: storageErr } = await supabaseAdmin.storage
      .from('mp-images')
      .remove(paths)

    if (storageErr) return Response.json({ error: storageErr.message }, { status: 400 })

    const { error: delErr } = await supabaseAdmin
      .from('photo_submission_images')
      .delete()
      .in('id', imageIds)

    if (delErr) return Response.json({ error: delErr.message }, { status: 400 })

    await supabaseAdmin.from('photo_submission_image_logs').insert(
      images.map(i => ({ image_id: i.id, action: 'delete_hard' }))
    )

    return Response.json({ hardDeleted: images.length })
  } catch (e) {
    console.error('delete images failed', e)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}


