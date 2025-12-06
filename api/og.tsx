import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default async function handler() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0a1628',
          backgroundImage: 'linear-gradient(135deg, #0a1628 0%, #0f2744 50%, #0a1628 100%)',
          fontFamily: 'Arial, sans-serif',
          position: 'relative',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            left: -100,
            bottom: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(34, 197, 94, 0.05)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: -100,
            top: -100,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'rgba(34, 197, 94, 0.05)',
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '60px 80px',
            flex: 1,
          }}
        >
          {/* Logo and brand */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 40 }}>
            {/* Logo circle */}
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 24,
                boxShadow: '0 0 40px rgba(34, 197, 94, 0.4)',
              }}
            >
              <svg width="50" height="50" viewBox="0 0 50 50">
                <path
                  d="M12 26 L20 34 L38 16"
                  stroke="white"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
            
            {/* Brand name */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', fontSize: 48, fontWeight: 'bold' }}>
                <span style={{ color: 'white' }}>Jomi</span>
                <span style={{ color: '#22c55e' }}>Check</span>
              </div>
              <span style={{ color: '#94a3b8', fontSize: 22 }}>
                জমি ও সম্পত্তির দলিল যাচাই
              </span>
            </div>
          </div>

          {/* Main headline */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginTop: 20,
            }}
          >
            <span style={{ fontSize: 52, fontWeight: 'bold', color: 'white' }}>
              বাংলাদেশের প্রথম
            </span>
            <span
              style={{
                fontSize: 52,
                fontWeight: 'bold',
                color: '#22c55e',
                marginTop: 8,
              }}
            >
              AI-ভিত্তিক দলিল যাচাই সেবা
            </span>
          </div>

          {/* Feature badges */}
          <div style={{ display: 'flex', gap: 20, marginTop: 50 }}>
            {['ঝুঁকি বিশ্লেষণ', 'মালিকানা চেইন', '৫ মিনিটে রিপোর্ট'].map((text) => (
              <div
                key={text}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 24px',
                  borderRadius: 30,
                  background: 'rgba(34, 197, 94, 0.15)',
                  border: '1px solid rgba(34, 197, 94, 0.5)',
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: '#22c55e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 10,
                  }}
                >
                  <span style={{ color: 'white', fontSize: 14 }}>✓</span>
                </div>
                <span style={{ color: 'white', fontSize: 18 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Document illustration - right side */}
        <div
          style={{
            position: 'absolute',
            right: 80,
            top: 140,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Stacked docs */}
          <div
            style={{
              position: 'absolute',
              left: 30,
              top: 30,
              width: 240,
              height: 320,
              borderRadius: 12,
              background: '#1e3a5f',
              transform: 'rotate(5deg)',
              opacity: 0.5,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 15,
              top: 15,
              width: 240,
              height: 320,
              borderRadius: 12,
              background: '#1e4976',
              transform: 'rotate(2deg)',
              opacity: 0.7,
            }}
          />
          
          {/* Main document */}
          <div
            style={{
              width: 240,
              height: 320,
              borderRadius: 12,
              background: '#0f2744',
              border: '2px solid #22c55e',
              display: 'flex',
              flexDirection: 'column',
              padding: 24,
              position: 'relative',
            }}
          >
            {/* Document lines */}
            <div style={{ width: '100%', height: 20, borderRadius: 4, background: 'rgba(34, 197, 94, 0.3)', marginBottom: 16 }} />
            <div style={{ width: '80%', height: 12, borderRadius: 3, background: '#334155', marginBottom: 8 }} />
            <div style={{ width: '90%', height: 12, borderRadius: 3, background: '#334155', marginBottom: 8 }} />
            <div style={{ width: '70%', height: 12, borderRadius: 3, background: '#334155', marginBottom: 16 }} />
            <div style={{ width: '100%', height: 1, background: 'rgba(34, 197, 94, 0.3)', marginBottom: 16 }} />
            <div style={{ width: '95%', height: 12, borderRadius: 3, background: '#334155', marginBottom: 8 }} />
            <div style={{ width: '85%', height: 12, borderRadius: 3, background: '#334155', marginBottom: 8 }} />
            <div style={{ width: '75%', height: 12, borderRadius: 3, background: '#334155' }} />
            
            {/* Checkmark overlay */}
            <div
              style={{
                position: 'absolute',
                bottom: 30,
                right: 30,
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 30px rgba(34, 197, 94, 0.5)',
              }}
            >
              <svg width="40" height="40" viewBox="0 0 40 40">
                <path
                  d="M10 21 L16 27 L30 13"
                  stroke="white"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            height: 40,
            background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
            www.jomicheck.com — জমি কেনার আগে দলিল যাচাই করুন
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

