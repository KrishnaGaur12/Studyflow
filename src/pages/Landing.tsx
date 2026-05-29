import { Link } from 'wouter';

export default function Landing() {
  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', overflow: 'hidden', background: '#000' }}>
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
          opacity: 0.8, // Slightly fade the video to make text readable
        }}
      >
        <source src="/bgvideo.mp4" type="video/mp4" />
      </video>

      {/* Overlay to darken and add contrast */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.6) 100%)',
        zIndex: 1,
      }} />

      {/* Content wrapper */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        
        {/* Header Navigation */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '28px 60px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <img src="/logo.png" alt="StudyFlow Logo" style={{ height: '40px', objectFit: 'contain', filter: 'invert(1) brightness(2)' }} />
            <div style={{
              fontSize: '28px',
              fontWeight: 700,
              fontFamily: "'Playfair Display', serif",
              color: '#fff',
              letterSpacing: '0.5px'
            }}>
              StudyFlow
            </div>
          </div>

          <nav style={{
            display: 'flex',
            gap: '32px',
            fontSize: '14px',
            color: '#fff',
            opacity: 0.9,
            fontWeight: 400,
            letterSpacing: '0.3px'
          }}>
            <span style={{ cursor: 'pointer', transition: 'opacity 0.2s' }} onMouseOver={e => e.currentTarget.style.opacity = '0.6'} onMouseOut={e => e.currentTarget.style.opacity = '1'}>Home</span>
            <span style={{ cursor: 'pointer', transition: 'opacity 0.2s' }} onMouseOver={e => e.currentTarget.style.opacity = '0.6'} onMouseOut={e => e.currentTarget.style.opacity = '1'}>Studio</span>
            <span style={{ cursor: 'pointer', transition: 'opacity 0.2s' }} onMouseOver={e => e.currentTarget.style.opacity = '0.6'} onMouseOut={e => e.currentTarget.style.opacity = '1'}>About</span>
            <span style={{ cursor: 'pointer', transition: 'opacity 0.2s' }} onMouseOver={e => e.currentTarget.style.opacity = '0.6'} onMouseOut={e => e.currentTarget.style.opacity = '1'}>Journal</span>
            <span style={{ cursor: 'pointer', transition: 'opacity 0.2s' }} onMouseOver={e => e.currentTarget.style.opacity = '0.6'} onMouseOut={e => e.currentTarget.style.opacity = '1'}>Reach Us</span>
          </nav>

          <Link href="/login" style={{
            padding: '10px 24px',
            border: '1px solid rgba(255,255,255,0.4)',
            borderRadius: '50px',
            color: '#fff',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 500,
            transition: 'all 0.3s ease',
            backgroundColor: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}>
            Begin Journey
          </Link>
        </header>

        {/* Main Hero Section */}
        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '0 24px',
          paddingBottom: '10vh'
        }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '4.5rem',
            fontWeight: 500,
            color: '#fff',
            marginBottom: '24px',
            letterSpacing: '-1px',
            textShadow: '0 4px 12px rgba(0,0,0,0.3)',
            maxWidth: '900px',
            lineHeight: 1.1
          }}>
            Where dreams rise through the silence.
          </h1>
          <p style={{
            fontSize: '1.05rem',
            color: 'rgba(255, 255, 255, 0.85)',
            maxWidth: '650px',
            lineHeight: 1.6,
            marginBottom: '48px',
            fontWeight: 400,
            textShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}>
            Study alone and you drift. Study together and you fly.<br/>
            StudyFlow gives you real-time study rooms, shared focus timers, and the accountability that turns intentions into results.
          </p>

          <Link href="/login" style={{
            padding: '16px 40px',
            border: '1px solid rgba(255,255,255,0.5)',
            borderRadius: '50px',
            color: '#fff',
            textDecoration: 'none',
            fontSize: '15px',
            fontWeight: 500,
            transition: 'all 0.3s ease',
            backgroundColor: 'transparent',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            letterSpacing: '0.5px'
          }}>
            Begin Journey
          </Link>
        </main>
      </div>
    </div>
  );
}
