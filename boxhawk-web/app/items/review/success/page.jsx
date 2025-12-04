'use client'

import { Suspense, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function ReviewSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const nextId = searchParams.get('nextId')
  const statusParam = searchParams.get('status') || 'complete'
  const hasNext = useMemo(() => Boolean(nextId), [nextId])
  const isRejected = statusParam === 'rejected'

  const handleBackToDashboard = () => {
    router.push('/')
  }

  const handleGoToQueue = () => {
    router.push('/items')
  }

  const handleContinue = () => {
    if (hasNext) {
      router.push(`/items/${nextId}`)
    }
  }

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 64px)',
        background: 'linear-gradient(180deg, #f5f6ff 0%, #f9fafb 40%, #ffffff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
        margin: '-32px -24px -32px -24px'
      }}
    >
      <div
        style={{
          textAlign: 'center',
          maxWidth: '520px',
          width: '100%'
        }}
      >
        <h1
          style={{
            fontSize: '64px',
            fontWeight: '800',
            marginBottom: '12px',
            letterSpacing: '-0.04em',
            background: isRejected
              ? 'linear-gradient(90deg, #991b1b 0%, #ef4444 50%, #f97316 100%)'
              : 'linear-gradient(90deg, #101828 0%, #6c5ce7 50%, #ef4444 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          {isRejected ? 'Item Rejected' : 'Success!'}
        </h1>

        <p
          style={{
            fontSize: '18px',
            color: '#475467',
            marginBottom: '32px'
          }}
        >
          {isRejected
            ? hasNext
              ? 'This item has been rejected. You can return to the dashboard or continue with the next review.'
              : 'This item has been rejected. There are no more reviews pending right now.'
            : hasNext
              ? 'Great work. You can head back to the dashboard or continue with the next review.'
              : 'You don’t have any more reviews right now. Feel free to head back to the dashboard.'}
        </p>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            alignItems: 'center'
          }}
        >
          <button
            onClick={handleBackToDashboard}
            style={{
              width: '100%',
              maxWidth: '280px',
              padding: '16px',
              backgroundColor: '#101828',
              color: '#ffffff',
              border: 'none',
              borderRadius: '999px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Back to Dashboard
          </button>

          <button
            onClick={handleGoToQueue}
            style={{
              width: '100%',
              maxWidth: '280px',
              padding: '16px',
              backgroundColor: '#ffffff',
              color: '#101828',
              border: '1px solid #d0d5dd',
              borderRadius: '999px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Back to Queue
          </button>

          <button
            onClick={handleContinue}
            disabled={!hasNext}
            style={{
              width: '100%',
              maxWidth: '280px',
              padding: '16px',
              backgroundColor: hasNext ? '#22c55e' : '#e5e7eb',
              color: hasNext ? '#ffffff' : '#9ca3af',
              border: 'none',
              borderRadius: '999px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: hasNext ? 'pointer' : 'not-allowed'
            }}
          >
            Continue Next Review
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ReviewSuccessPage() {
  return (
    <Suspense fallback={null}>
      <ReviewSuccessContent />
    </Suspense>
  )
}


