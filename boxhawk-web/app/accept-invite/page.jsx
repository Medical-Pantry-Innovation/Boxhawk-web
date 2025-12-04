'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

function AcceptInviteContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [invitation, setInvitation] = useState(null)
  const [invitationLoading, setInvitationLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Extract email from URL parameters
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam))
      checkInvitation(decodeURIComponent(emailParam))
    } else {
      setError('Invalid invitation link. Please contact the administrator.')
      setInvitationLoading(false)
    }
  }, [searchParams])

  const checkInvitation = async (email) => {
    try {
      const response = await fetch(`/api/admin/invitations?email=${encodeURIComponent(email)}`)
      const data = await response.json()
      
      if (response.ok && data.invitation) {
        setInvitation(data.invitation)
      } else {
        setError('Invitation not found or expired. Please contact the administrator.')
      }
    } catch (error) {
      console.error('Error checking invitation:', error)
      setError('Error checking invitation. Please try again.')
    } finally {
      setInvitationLoading(false)
    }
  }

  const handleSetPassword = async (e) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Register the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      })

      if (authError) {
        throw authError
      }

      if (authData.user) {
        // Get the role from invitation
        const userRole = invitation?.role || 'photouser'
        
        // Update user role
        const roleResponse = await fetch('/api/admin/update-role', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: authData.user.id,
            role: userRole
          })
        })

        if (!roleResponse.ok) {
          console.error('Failed to set user role')
        }

        // Update invitation status
        await fetch('/api/admin/invitations', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            status: 'accepted'
          })
        })

        // Redirect to appropriate page based on role
        if (userRole === 'admin' || userRole === 'superadmin') {
          router.push('/admin')
        } else {
          router.push('/')
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError(error.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (invitationLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading invitation...
      </div>
    )
  }

  if (error && !invitation) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '16px',
        padding: '20px'
      }}>
        <div style={{ fontSize: '48px' }}>❌</div>
        <h1 style={{ fontSize: '24px', color: '#e74c3c' }}>Invalid Invitation</h1>
        <p style={{ color: '#666', textAlign: 'center', maxWidth: '400px' }}>{error}</p>
        <button
          onClick={() => router.push('/landing')}
          style={{
            padding: '12px 24px',
            backgroundColor: '#6c5ce7',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Go to Home
        </button>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#2c3e50',
            marginBottom: '8px'
          }}>
            Welcome to Boxhawk!
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#7f8c8d',
            margin: 0
          }}>
            You've been invited to join as a <strong>{invitation?.role || 'user'}</strong>
          </p>
        </div>

        <form onSubmit={handleSetPassword}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#2c3e50',
              marginBottom: '8px'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              disabled
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: '#f8f9fa',
                color: '#666'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#2c3e50',
              marginBottom: '8px'
            }}>
              Set Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#2c3e50',
              marginBottom: '8px'
            }}>
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fee',
              color: '#c33',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '14px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? '#ccc' : '#6c5ce7',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s ease'
            }}
          >
            {loading ? 'Creating Account...' : 'Set Password & Complete Registration'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={null}>
      <AcceptInviteContent />
    </Suspense>
  )
}
