'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/Logo'
import Image from 'next/image'


export default function LandingPage() {
  const login = useRouter()

  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow
    const originalHtmlOverflow = document.documentElement.style.overflow

    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    const time = setTimeout(() => {
      login.push('/login')}
    , 5000)

    return () => {
      document.body.style.overflow = originalBodyOverflow
      document.documentElement.style.overflow = originalHtmlOverflow
      clearTimeout(time)}
  }, [login]) 

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        color: '#333',
        // overflow: 'hidden',
        // overflowX: 'hidden',
        width: '100%'
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          marginTop: '-2cm'
        }}
      >
        <Logo size="xlarge" href={null} showText={false} />

        <p
          style={{
            fontSize: '24px',
            fontWeight: '700',
            textAlign: 'center',
            margin: '0 0 24px 0',
            background: 'linear-gradient(90deg, #151946 0%, #801A18 50%, #F0BBBC 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lletterSpacing: '0.66px',
          }}
        >
          Help us learn what’s <br/> 
          on our shelf
        </p>
      </div>

      {/* <div
        style={{
          width: '100%',
          maxWidth: '360px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Link
          href="/login"
          style={{
            width: '100%',
            backgroundColor: '#111111',
            color: '#ffffff',
            textDecoration: 'none',
            borderRadius: '999px',
            padding: '14px 24px',
            fontSize: '16px',
            fontWeight: '600',
            textAlign: 'center',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#2b2b2b'
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#111111'
          }}
        >
          Sign In
        </Link>
      </div> */}

      <div
        style={{
          position: 'absolute',
          bottom: '40px',
          flexDirection: 'column',
          alignItems: 'center',
          display: 'flex',
          gap: '10px'
        }}
        aria-label="Loading"
      >
        <div style={{ position: 'relative', width: '26px', height: '26px' }}>
            <Image
              src="/images/medicalpantry.png"
              alt="Loading icon"
              fill
              priority
              style={{ objectFit: 'contain' }}
            />
          </div>
        <div style={{display: 'flex',gap: '10px'}}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#878787',
                opacity: 0.6,
                animation: 'dotPulse 1.2s infinite ease-in-out',
                animationDelay: `${i * 0.30}s`
              }}
            />
          ))}
        </div>
      </div>
      <style>{`
        @keyframes dotPulse {
          0%, 80%, 100% {
            transform: translateY(0);
            opacity: 0.4;
            background-color: #bfbfbf;
          }
          40% {
            transform: translateY(-1px);
            opacity: 1;
            background-color: #111111;
          }
        }
      `}</style>
    </div>
  )
}

