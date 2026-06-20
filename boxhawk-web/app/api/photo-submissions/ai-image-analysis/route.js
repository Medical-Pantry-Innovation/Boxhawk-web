import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

// create a supabase client for retrieving images by submission id
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// create an openrouter client for making API call to AI model
const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1'
})


// Prompt
const PROMPT = `
Act as a Medical Device Label OCR and Structured Data Extraction Specialist specializing in hospital consumables, surgical devices, sterile packaging, and regulatory labeling.

### Task
Analyze the provided product packaging images and extract visible label information into the structured schema defined in the Output Format.

### Input Data
1. Submission ID: {{submission_id}}
2. Product Packaging Images

Images may include multiple sides or panels of the same product packaging. Images may include barcodes, manufacturing data, or product identification information.

### Extraction Rules

1. General OCR Rules
- Extract only information visibly present in the images.
- Do not infer, guess, or hallucinate missing values.
- If a field is not visible, unreadable, or not present, return null.
- Preserve original wording, spelling, capitalization, and formatting where possible.
- If multiple images show different sides of the same package, combine the information into one result.
- If multiple products appear, extract the most prominent product only.

2. Product Identification
- name: The main product name exactly as printed on the packaging.
- manufacturer: The company or manufacturer name printed on the packaging.

3. Product Reference and Identification Codes
- barcode: Extract barcode numbers or GS1 codes exactly as printed.
- ref: Extract the reference number, catalogue number, or REF code if present.
- lot: Extract the lot number or batch number.

4. Packaging and Quantity
- size: Extract size, gauge, dimensions, or measurements exactly as printed.
- quantity: Extract the quantity per package if shown.

5. Manufacturing and Expiry Information
- date_of_manufacture: Extract the manufacturing date exactly as printed.
- expiration: Extract the expiration date exactly as printed.

6. Manufacturer and Distribution Information
- manufacture_address: Extract the full manufacturer address if visible.
- manufacture_site: Extract the manufacturing site or facility name.
- sponsor: Extract sponsor, distributor, or regulatory representative information if present.

7. Additional Notes
- notes: Include observations that cannot be mapped to other fields.

### OCR Quality Handling
If text is partially visible or uncertain:
- Return the best visible extraction.
- Add clarification in notes if needed.

### Output Format

Return ONLY a valid JSON object.  
Do not include explanations or text outside the JSON.

The output must follow this structure:
- The top-level key must be the submission id.
- The value must be a list containing one extracted record.

output the result into following structure:

{
  "id": {{submission_id}},
  "name": "...",
  "manufacturer": "...",
  "barcode": "...",
  "size": "...",
  "date_of_manufacture": "...",
  "expiration": "...",
  "lot": "...",
  "ref": "...",
  "quantity": "...",
  "manufacture_address": "...",
  "manufacture_site": "...",
  "sponsor": "...",
  "notes": "..."
}
`

export async function POST(req) {
  try {
    const { submission_id, model = 'google/gemini-3.1-flash-lite-preview' } = await req.json()

    if (!submission_id) {
      return NextResponse.json(
        { error: 'submission_id is required' },
        { status: 400 }
      )
    }

    // --------------------
    // 1. Get image paths using submission id
    // --------------------
    const { data: images, error } = await supabase
      .from('photo_submission_images')
      .select('storage_path')
      .eq('submission_id', submission_id)

    if (error) throw error

    const paths = images.map(img => img.storage_path)

    // --------------------
    // 2. Build prompt, replace the variable submission_id with received value 
    // --------------------
    const promptWithId = PROMPT.replaceAll(
        '{{submission_id}}',
        String(submission_id)
    )

    // --------------------
    // 3. Build the request for AI model (prompt + images)
    // --------------------
    const content = [
      {
        type: 'text',
        text: promptWithId
      }
    ]

    for (const path of paths) {
      const { data } = supabase.storage
        .from('mp-images')
        .getPublicUrl(path)

      content.push({
        type: 'image_url',
        image_url: data.publicUrl
      })
    }

    // --------------------
    // 4. Call OpenRouter
    // --------------------
    const completion = await openrouter.chat.completions.create({
      model,
      messages: [
        {
          role: 'user',
          content
        }
      ]
    })

    // Log for debugging
    // console.log('\n=== OPENROUTER API REQUEST ===')
    // console.log('Submission ID:', submission_id)
    // console.log('Model:', model)
    // console.log('content:', content);
    

    let result = completion.choices?.[0]?.message?.content || '{}'

    // remove unnecessary markdown format if any
    result = result.replace(/```json|```/g, '').trim()
    console.log('result:', result);

    // try parse JSON
    let parsed
    try {
      parsed = JSON.parse(result)
    } catch (e) {
      parsed = { raw: result }
    }

    // update the database using parsed data
    await supabase
    .from('photo_submissions')
    .update({
      name: parsed.name,
      manufacturer: parsed.manufacturer,
      barcode: parsed.barcode,
      size: parsed.size,
      lot: parsed.lot,
      ref: parsed.ref,
      quantity: parsed.quantity,
      manufacture_address: parsed.manufacture_address,
      manufacture_site: parsed.manufacture_site,
      sponsor: parsed.sponsor,
      notes: parsed.notes
    })
    .eq('id', submission_id)

    // --------------------
    // 5. Return result, this is unnecessary in current design, but if we want
    //.   to display the result right after user clicked upload, we can do so.
    // --------------------
    return NextResponse.json({
      id: submission_id,
      result: parsed
    })
  } catch (err) {
    console.error('AI extraction error:', err)

    return NextResponse.json(
      {
        error: err.message || 'Internal Server Error'
      },
      { status: 500 }
    )
  }
}
