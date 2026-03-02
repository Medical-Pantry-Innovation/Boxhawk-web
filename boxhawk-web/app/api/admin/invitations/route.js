import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'
import { apiAuth } from 'lib/apiAuth.js'

const requiredRole = "admin"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Email sending function using nodemailer
async function sendInvitationEmail(email, inviteLink, role) {
  // Create transporter (you'll need to configure this with your email service)
  const transporter = nodemailer.createTransporter({
    // For development, you can use Gmail or other SMTP services
    // You'll need to set up environment variables for email credentials
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })
  
  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #6c5ce7;">You've been invited to join Boxhawk!</h2>
      <p>You have been invited to join Boxhawk as a <strong>${role}</strong>.</p>
      <p>Click the button below to complete your registration:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${inviteLink}" style="background-color: #6c5ce7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Complete Registration
        </a>
      </div>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="word-break: break-all;"><a href="${inviteLink}">${inviteLink}</a></p>
      <p style="color: #666; font-size: 14px;">This invitation will expire in 7 days.</p>
    </div>
  `
  
  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@boxhawk.com',
    to: email,
    subject: 'You\'ve been invited to join Boxhawk',
    html: emailContent
  }
  
  try {
    // For development, we'll log the email details
    console.log('📧 EMAIL INVITATION:')
    console.log('To:', email)
    console.log('Role:', role)
    console.log('Link:', inviteLink)
    
    // Uncomment the line below to actually send emails (after configuring SMTP)
    // await transporter.sendMail(mailOptions)
    console.log('Email would be sent to:', email)
    
  } catch (error) {
    console.error('Failed to send email:', error)
    throw error
  }
}

// GET - List all invitations or check specific invitation
export async function GET(request) {
  apiAuth(requiredRole)
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (email) {
      // Check specific invitation by email
      const { data, error } = await supabaseAdmin
        .from('invitations')
        .select('*')
        .eq('email', email)
        .eq('status', 'pending')
        .single()

      if (error) {
        console.error('Error checking invitation:', error)
        return Response.json({ error: 'Invitation not found or expired' }, { status: 404 })
      }

      return Response.json({
        success: true,
        invitation: data
      })
    } else {
      // List all invitations
      const { data, error } = await supabaseAdmin
        .from('invitations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching invitations:', error)
        return Response.json({ error: error.message }, { status: 400 })
      }

      return Response.json({ invitations: data || [] })
    }

  } catch (error) {
    console.error('Error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new invitation
export async function POST(request) {
  apiAuth(requiredRole)
  try {
    const { email, role = 'photouser' } = await request.json()

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check if invitation already exists and is still pending
    const { data: existingInvitation } = await supabaseAdmin
      .from('invitations')
      .select('*')
      .eq('email', email)
      .eq('status', 'pending')
      .single()

    if (existingInvitation) {
      // Check if the invitation is older than 24 hours
      const invitationAge = Date.now() - new Date(existingInvitation.invited_at).getTime()
      const hoursOld = invitationAge / (1000 * 60 * 60)
      
      if (hoursOld < 24) {
        return Response.json({ 
          error: 'Invitation already sent to this email. Please wait 24 hours before sending another invitation.',
          existingInvitation 
        }, { status: 400 })
      } else {
        // If invitation is older than 24 hours, mark it as expired and allow new invitation
        await supabaseAdmin
          .from('invitations')
          .update({ status: 'expired' })
          .eq('id', existingInvitation.id)
      }
    }

    // Create invitation record
    const { data: invitation, error: inviteError } = await supabaseAdmin
      .from('invitations')
      .insert({
        email,
        role,
        status: 'pending',
        invited_at: new Date().toISOString()
      })
      .select()
      .single()

    if (inviteError) {
      console.error('Error creating invitation:', inviteError)
      return Response.json({ error: inviteError.message }, { status: 400 })
    }

    // Send invitation email using a custom email service
    // For now, we'll use a simple approach with a custom email template
    const inviteLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/accept-invite?email=${encodeURIComponent(email)}`
    
    // TODO: Implement actual email sending service (SendGrid, Resend, etc.)
    // For now, we'll just log the invitation link
    console.log('Invitation created and email should be sent:', {
      id: invitation.id,
      email: email,
      role: role,
      status: 'pending',
      inviteLink: inviteLink
    })
    
    // For now, we'll just generate the invitation link
    // Email sending can be implemented later
    console.log('Invitation created:', {
      id: invitation.id,
      email: email,
      role: role,
      status: 'pending',
      inviteLink: inviteLink
    })

    return Response.json({ 
      success: true, 
      message: 'Invitation created successfully. Share the link below with the user.',
      invitation,
      inviteLink: inviteLink
    })

  } catch (error) {
    console.error('Error sending invitation:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update invitation status
export async function PUT(request) {
  apiAuth(requiredRole)
  try {
    const { email, status } = await request.json()

    if (!email || !status) {
      return Response.json({ error: 'Email and status are required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('invitations')
      .update({ 
        status: status,
        accepted_at: status === 'accepted' ? new Date().toISOString() : null
      })
      .eq('email', email)
      .select()

    if (error) {
      console.error('Error updating invitation:', error)
      return Response.json({ error: error.message }, { status: 400 })
    }

    return Response.json({ 
      success: true, 
      message: 'Invitation status updated successfully',
      invitation: data[0] 
    })

  } catch (error) {
    console.error('Error updating invitation:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
