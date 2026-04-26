/*
 * app/splash/page.tsx
 * Animation gbaki·ai → redirige automatiquement vers /dashboard après 3.2s
 */
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SplashPage() {
  const router = useRouter()

  useEffect(() => {
    // L'animation dure ~2.8s (dernière lettre à 2420ms + 500ms fade)
    // On attend 3.4s puis on redirige
    const t = setTimeout(() => {
      router.replace('/dashboard')
    }, 3400)
    return () => clearTimeout(t)
  }, [router])

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html, body {
          height: 100%;
          background: #fafbfc;
          font-family: 'Space Grotesk', sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500&display=swap');

        .splash-root {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fafbfc;
          animation: splashFadeOut 0.5s ease 3s forwards;
        }

        @keyframes splashFadeOut {
          from { opacity: 1; }
          to   { opacity: 0; }
        }

        .stage {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 28px;
        }

        .wordmark {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 500;
          font-size: 36px;
          letter-spacing: 0.02em;
          color: #0f1629;
        }

        .wordmark span {
          display: inline-block;
          opacity: 0;
          transform: translateY(8px);
        }

        /* ── SVG animations ── */
        @keyframes trace  { to { stroke-dashoffset: 0; } }
        @keyframes hook   { to { stroke-dashoffset: 0; } }
        @keyframes dot {
          0%   { transform: scale(0) translateY(-30px); }
          60%  { transform: scale(1.3) translateY(0); }
          100% { transform: scale(1) translateY(0); }
        }
        @keyframes letter { to { opacity: 1; transform: translateY(0); } }

        .ring {
          animation: trace 1100ms cubic-bezier(.7,0,.2,1) 200ms forwards;
          stroke-dasharray: 289;
          stroke-dashoffset: 289;
        }
        .desc {
          animation: hook 800ms cubic-bezier(.6,0,.2,1) 1100ms forwards;
          stroke-dasharray: 160;
          stroke-dashoffset: 160;
        }
        .dot {
          animation: dot 600ms cubic-bezier(.34,1.56,.64,1) 1700ms forwards;
          transform-origin: 138px 50px;
          transform: scale(0) translateY(-30px);
        }

        .wordmark span { animation: letter 500ms cubic-bezier(.4,0,.2,1) forwards; }
        .wordmark span:nth-child(1) { animation-delay: 2000ms; }
        .wordmark span:nth-child(2) { animation-delay: 2060ms; }
        .wordmark span:nth-child(3) { animation-delay: 2120ms; }
        .wordmark span:nth-child(4) { animation-delay: 2180ms; }
        .wordmark span:nth-child(5) { animation-delay: 2240ms; }
        .wordmark span:nth-child(6) { animation-delay: 2300ms; }
        .wordmark span:nth-child(7) { animation-delay: 2360ms; }
        .wordmark span:nth-child(8) { animation-delay: 2420ms; }
      `}</style>

      <div className="splash-root">
        <div className="stage">
          <svg viewBox="0 0 200 220" width="220" height="240" style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="g-stroke" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1a2340"/>
                <stop offset="100%" stopColor="#0f1629"/>
              </linearGradient>
            </defs>
            {/* bowl */}
            <circle
              className="ring"
              cx="80" cy="110" r="46"
              fill="none"
              stroke="url(#g-stroke)"
              strokeWidth="14"
              strokeLinecap="round"
            />
            {/* descender stem + hook */}
            <path
              className="desc"
              d="M 126 110 L 126 168 Q 126 188 106 188 L 88 188"
              fill="none"
              stroke="#1a2340"
              strokeWidth="14"
              strokeLinecap="round"
            />
            {/* accent dot */}
            <circle
              className="dot"
              cx="138" cy="50" r="9"
              fill="#5b6cff"
            />
          </svg>

          <div className="wordmark">
            <span>g</span>
            <span>b</span>
            <span>a</span>
            <span>k</span>
            <span>i</span>
            <span style={{ color: '#2a3550', margin: '0 2px' }}>·</span>
            <span style={{ color: '#5b6cff' }}>a</span>
            <span style={{ color: '#5b6cff' }}>i</span>
          </div>
        </div>
      </div>
    </>
  )
}
