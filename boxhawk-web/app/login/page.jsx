'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

export default function LoginPage() {
  const [loading, setLoading] = useState(true)
  const [isInvited, setIsInvited] = useState(false)
  const [inviteToken, setInviteToken] = useState(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [settingPassword, setSettingPassword] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if this is an invitation link
    const originalBodyOverflow = document.body.style.overflow
    const originalHtmlOverflow = document.documentElement.style.overflow

    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    const urlParams = new URLSearchParams(window.location.search)
    const invited = urlParams.get('invited')
    const token = urlParams.get('token')
    
    if (invited === 'true') {
      setIsInvited(true)
    }
    
    if (token) {
      setInviteToken(token)
    }

    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        // User is already logged in, redirect based on role
        const role = session.user.app_metadata?.role || 'photouser'
        if (role === 'admin' || role === 'superadmin') {
          router.push('/admin')
        } else {
          router.push('/')
        }
        return
      }
      setLoading(false)
    }

    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // User logged in, redirect based on role
        const role = session.user.app_metadata?.role || 'photouser'
        if (role === 'admin' || role === 'superadmin') {
          router.push('/admin')
        } else {
          router.push('/')
        }
      }
    })

    return () => {
      document.body.style.overflow = originalBodyOverflow
      document.documentElement.style.overflow = originalHtmlOverflow
      subscription.unsubscribe()
    }
  }, [router])

  const handleSetPassword = async (e) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      alert('Passwords do not match')
      return
    }
    
    if (password.length < 6) {
      alert('Password must be at least 6 characters')
      return
    }

    try {
      setSettingPassword(true)
      
      // Use the invitation token to accept the invitation and set password
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: inviteToken,
        type: 'invite'
      })

      if (error) {
        throw error
      }

      // Update the user's password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) {
        throw updateError
      }

      alert('Password set successfully! You can now log in.')
      router.push('/login')
      
    } catch (error) {
      console.error('Error setting password:', error)
      alert(error.message || 'Failed to set password. Please try again.')
    } finally {
      setSettingPassword(false)
    }
  }

  if (loading) {
    return (
      <div style={{ 
        position: 'fixed',
        inset: 0,
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        width: '100%'
      }}>
        Loading...
      </div>
    )
  }

  return (
  <div
      style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      overflow: 'hidden',
      width: '100%'
    }}
  >
    <div
      style={{
        width: '100%',
        flex: 1, 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '0 24px'
      }}
    > 
      <div style={{ width: '100%', maxWidth: '360px' }}>
        <h1
          style={{
            marginTop: 'clamp(72px, 14vh, 130px)',
            marginBottom: 'clamp(26px, 5vh, 46px)',
            fontSize: '24px',
            fontWeight: 500,
            color: '#363636',
            fontStyle: 'normal',
            lineHeight: 'normal',
            letterSpacing: '-0.2px',
            textAlign: 'center'
          }}
        >
          Let&apos;s sign you in
        </h1>
          {/* Invitation Password Setup */}
          {isInvited && inviteToken ? (
            <>
              <div style={{
                marginBottom: '20px',
                padding: '12px 16px',
                backgroundColor: '#e8f5e8',
                border: '1px solid #28a745',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#155724'
              }}>
                <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                  🎉 You've been invited!
                </div>
                <div style={{ fontSize: '13px' }}>
                  Please set your password to complete your account setup.
                </div>
              </div>

              <form onSubmit={handleSetPassword}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '4px',
                    color: '#333'
                  }}>
                    New Password *
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
                      border: '1px solid #ffffff',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '4px',
                    color: '#333'
                  }}>
                    Confirm Password *
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
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={settingPassword}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: settingPassword ? '#ccc' : '#6c5ce7',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: settingPassword ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  {settingPassword ? 'Setting Password...' : 'Set Password & Complete Registration'}
                </button>
              </form>
            </>
          ) : (
            <>
              {/* <Auth
                supabaseClient={supabase}
                appearance={{ theme: ThemeSupa }}
                providers={[]}
                onlyEmailMagicLink={false}
              /> */}
              <div style={{ width: '100%', maxWidth: '360px' }}>
                <Auth
                  supabaseClient={supabase}
                  providers={[]}
                  onlyEmailMagicLink={false}
                  appearance={{
                    theme: ThemeSupa,
                    variables: {
                      default: {
                        colors: {
                          brand: '#121a4a',
                          brandAccent: '#121a4a',
                          inputBackground: '#f4f5f9',
                          inputBorder: '#f4f5f9',
                          inputText: '#111111',
                          defaultButtonBackground: '#121a4a',
                          defaultButtonBackgroundHover: '#0f163f',
                          defaultButtonText: '#ffffff',
                          anchorTextColor: '#121a4a'
                        },
                        radii: {
                          borderRadiusButton: '20px',
                          borderRadiusInput: '16px'
                        },
                        space: {
                          inputPadding: '14px 16px',
                          buttonPadding: '18px 16px'
                        },
                        fontSizes: {
                          baseBodySize: '14px',
                          baseInputSize: '14px',
                          baseButtonSize: '16px'
                        }
                      }
                    },

                    style: {
                      container: {
                        width: '100'
                      },
                      label: {
                        fontSize: '16px',
                        fontWeight: 500,
                        color: '#3f3f3f',
                        marginBottom: '10px'
                      },
                      input: {
                        height: '48px',
                        borderRadius: '16px',
                        backgroundColor: '#f4f5f9',
                        border: 'none',
                        boxShadow: 'none'
                      },
                      
                      button: {
                        height: '52px',
                        borderRadius: '20px',
                        fontWeight: 500,
                        marginTop: '18px'
                      },
                      anchor: {
                        color: '#121a4a',
                        fontWeight: 700
                      },
                      message: {
                        color: '#3f3f3f'
                      }
                    }
                  }}
                />
              </div> 
              {/* <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '14px',
                  marginBottom: '22px'
                }}
              >
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    style={{
                      width: '16px',
                      height: '16px',
                      accentColor: '#121a4a'
                    }}
                  />
                  <span style={{ fontSize: '14px', color: '#3f3f3f' }}>
                    Remember me
                  </span>
                </label>
              </div>  */}
            </>
          )}
        </div>
        <div
          style={{
            marginTop: 'auto',  
            paddingBottom: '26px',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '15px', color: '#3f3f3f', lineHeight: '1.25' }}>
            By signing up you agree to <br />
            Medical Pantry&apos;s{' '}
            <Link href="/terms" style={{ color: '#121a4a', fontWeight: 700, textDecoration: 'none' }}>
              Terms
            </Link>{' '}
            and <br />
            <Link
              href="/conditions"
              style={{ color: '#121a4a', fontWeight: 700, textDecoration: 'none' }}
            >
              Conditions for Use
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

