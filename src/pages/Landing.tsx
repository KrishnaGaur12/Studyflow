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

        {/* Absolutely positioned Logo */}
        <img
          src="/logo.png"
          alt="StudyFlow Logo"
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            height: '80px',
            objectFit: 'contain',
            filter: 'invert(1) brightness(2)',
            zIndex: 20
          }}
        />

        {/* Header Navigation */}
        <header style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          padding: '28px 60px',
        }}>

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
            fontFamily: "'Manrope', sans-serif",
          }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Login
          </Link>
        </header>

        {/* Main Hero Section */}
        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          textAlign: 'center',
          padding: '0 24px',
          marginTop: '4vh'
        }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '5.5rem',
            fontWeight: 400,
            color: '#fff',
            marginBottom: '24px',
            letterSpacing: '-1px',
            textShadow: '0 4px 12px rgba(0,0,0,0.3)',
            maxWidth: '1000px',
            lineHeight: 1.1
          }}>
            <span>Where </span>
            <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>dreams </span>
            <span>rise </span>
            <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>through the silence.</span>
          </h1>
          <p style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: '1.25rem',
            color: 'rgba(255, 255, 255, 0.9)',
            maxWidth: '650px',
            lineHeight: 1.6,
            marginBottom: '40px',
            fontWeight: 400,
            textShadow: '0 2px 8px rgba(0,0,0,0.4)',
            letterSpacing: '0.01em',
          }}>
            StudyFlow is a virtual study room where you and your friends can study together with a shared timer, live chat, and progress tracking. No more studying alone and losing focus.
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
            letterSpacing: '0.5px',
            fontFamily: "'Manrope', sans-serif",
          }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(255,255,255,0.1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Begin Journey
          </Link>
        </main>
      </div>
    </div>
  );
}
