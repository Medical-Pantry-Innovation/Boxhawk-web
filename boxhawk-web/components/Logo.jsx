import Image from 'next/image'
import Link from 'next/link'

export default function Logo({ 
  size = 'medium', 
  showText = true, 
  href = '/',
  style = {} 
}) {
  const sizeConfig = {
    small: { width: 24, height: 18, fontSize: '16px' },
    medium: { width: 32, height: 24, fontSize: '20px' },
    large: { width: 48, height: 32, fontSize: '28px' },
    xlarge: { width: 180, height: 120, fontSize: '48px' },
    xxlarge: { width: 300, height: 200, fontSize: '80px' }
  }

  const config = size === 'nav'
    ? { width: 180, height: 48, fontSize: '28px' }
    : sizeConfig[size] || sizeConfig.medium

  const logoContent = (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      height: config.height,
      ...style
    }}>
      {/* Logo Image */}
      <div style={{
        width: config.width,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        {/* Actual logo image */}
        <Image
          src="/images/medishelf.png"
          alt="Medi Shelf Logo"
          width={config.width}
          height={config.height}
          style={{ 
            objectFit: 'contain',
            maxWidth: '100%',
            maxHeight: '100%'
          }}
        />
      </div>
      
      {/* Logo Text */}
      {showText && (
        <span style={{
          fontSize: config.fontSize,
          fontWeight: 'bold',
          color: '#1f2937',
          textTransform: 'lowercase',
          letterSpacing: '0.5px'
        }}>
          medi shelf
        </span>
      )}
    </div>
  )

  const linkStyle = {
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    height: '100%'
  }

  if (href) {
    return (
      <Link href={href} style={linkStyle}>
        {logoContent}
      </Link>
    )
  }

  return logoContent
}
