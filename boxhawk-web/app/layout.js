'use client'

import { useEffect, useState } from 'react'
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logo from '@/components/Logo'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export default function RootLayout({ children }) {
  const [session, setSession] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    // 1) Get current session on mount
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUserRole(data.session?.user?.app_metadata?.role || null)
      setLoading(false)
    })

    // 2) Subscribe to auth state changes (login / logout / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setUserRole(newSession?.user?.app_metadata?.role || null)
      setLoading(false)
    })

    // 3) Cleanup on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    // Redirect to landing page after sign out
    window.location.href = '/landing'
  }

  // Don't show header on landing page
  const isLandingPage = pathname === '/landing'
  const isHomePage = pathname === '/home'
  const isDashboard = pathname === '/' || pathname === '/dashboard'
  const isReviewQueue = pathname === '/items' || pathname.startsWith('/items/')

  return (
    <html lang="en">
      <body suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`} style={{
        margin: 0,
        padding: 0,
        minHeight: '100vh',
        backgroundColor: '#ffffff'
      }}>
        {!isLandingPage && !isHomePage && (
          <header style={{
            backgroundColor: '#ffffff',
            color: '#1a1a1a',
            padding: '12px 24px',
            borderBottom: '1px solid #e5e7eb',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
            minHeight: '72px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <div style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '32px',
                flexShrink: 0
              }}>
                {/* Logo */}
                <Logo size="nav" href="/" showText={false} />

                {/* Navigation */}
                {session && userRole === 'expert' && (
                  <nav style={{
                    display: 'flex',
                    gap: '24px',
                    alignItems: 'center',
                    marginLeft: '32px'
                  }}>
                    <Link
                      href="/"
                      style={{
                        textDecoration: 'none',
                        color: isDashboard ? '#111827' : '#6b7280',
                        fontSize: '16px',
                        fontWeight: isDashboard ? '600' : '400',
                        borderBottom: isDashboard ? '2px solid #111827' : '2px solid transparent',
                        paddingBottom: '4px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/items"
                      style={{
                        textDecoration: 'none',
                        color: isReviewQueue ? '#111827' : '#6b7280',
                        fontSize: '16px',
                        fontWeight: isReviewQueue ? '600' : '400',
                        borderBottom: isReviewQueue ? '2px solid #111827' : '2px solid transparent',
                        paddingBottom: '4px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Review Queue
                    </Link>
                  </nav>
                )}
              </div>

              {/* Auth Status */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginLeft: 'auto'
              }}>
                {loading ? (
                  <span style={{ color: '#9ca3af', fontSize: '14px' }}>Loading...</span>
                ) : session && session.user ? (
                  <>
                    <span style={{ fontSize: '14px', color: '#111827' }}>
                      Hello {session.user.email?.split('@')[0] || 'User'}
                    </span>
                    <span style={{ color: '#d1d5db', fontSize: '14px' }}>|</span>
                    <button
                      onClick={handleSignOut}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#111827',
                        cursor: 'pointer',
                        fontSize: '14px',
                        padding: '4px 8px',
                        transition: 'color 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#4b5563'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#111827'
                      }}
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#111827',
                      color: '#ffffff',
                      textDecoration: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#1f2937'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#111827'
                    }}
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </header>
        )}
        <main style={{
          padding: '32px 24px',
          backgroundColor: '#f9fafb',
          minHeight: 'calc(100vh - 80px)'
        }}>{children}</main>
      </body>
    </html>
  )
}
