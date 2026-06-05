'use client'

interface NoxProps {
  emotion?: 'curious' | 'intrigued' | 'amused' | 'surprised' | 'proud' | 'excited'
  size?: number
  animate?: boolean
  className?: string
}

export default function Nox({ emotion = 'curious', size = 80, animate = true, className }: NoxProps) {
  const eyeConfig = {
    curious: { rx: 5.5, ry: 6, offsetY: 0, pupilRy: 3.5 },
    intrigued: { rx: 5, ry: 5.5, offsetY: 0.5, pupilRy: 3 },
    amused: { rx: 6, ry: 4.5, offsetY: 1, pupilRy: 2.5 },
    surprised: { rx: 7, ry: 8, offsetY: -1, pupilRy: 5 },
    proud: { rx: 6, ry: 4, offsetY: 1.5, pupilRy: 2 },
    excited: { rx: 6.5, ry: 7, offsetY: -0.5, pupilRy: 4 },
  }[emotion]

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <radialGradient id="bodyGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#1e1040" />
          <stop offset="100%" stopColor="#0a0618" />
        </radialGradient>
        <radialGradient id="eyeGrad" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#7c3aed" />
        </radialGradient>
        <radialGradient id="crystalGrad" cx="30%" cy="20%" r="80%">
          <stop offset="0%" stopColor="#FFBE0B" />
          <stop offset="60%" stopColor="#FB5607" />
          <stop offset="100%" stopColor="#FF006E" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <style>{`
          @keyframes crystalPulse {
            0%, 100% { opacity: 0.85; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.08); }
          }
          @keyframes crystalGlow {
            0%, 100% { filter: drop-shadow(0 0 3px rgba(255,0,110,0.6)); }
            50% { filter: drop-shadow(0 0 9px rgba(255,190,11,1)); }
          }
          .crystal-anim {
            animation: crystalPulse 2s ease-in-out infinite, crystalGlow 2s ease-in-out infinite;
            transform-origin: 50px 100px;
          }
          @keyframes noxBreath {
            0%, 100% { transform: translateY(0px) scaleY(1); }
            50% { transform: translateY(-2px) scaleY(1.01); }
          }
          .nox-float { animation: noxBreath 4s ease-in-out infinite; }
          @keyframes eyeBlink {
            0%, 90%, 100% { transform: scaleY(1); }
            95% { transform: scaleY(0.08); }
          }
          .nox-blink { animation: eyeBlink 4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
          @keyframes earWiggle {
            0%, 85%, 100% { transform: rotate(0deg); }
            90% { transform: rotate(-4deg); }
            95% { transform: rotate(3deg); }
          }
          .nox-ear-left { animation: earWiggle 6s ease-in-out infinite; transform-box: fill-box; transform-origin: bottom right; }
          .nox-ear-right { animation: earWiggle 6s ease-in-out infinite; animation-delay: 0.3s; transform-box: fill-box; transform-origin: bottom left; }
        `}</style>
      </defs>

      <g className={animate ? 'nox-float' : ''}>
        {/* Left ear */}
        <g className={animate ? 'nox-ear-left' : ''}>
          <path d="M28 42 L20 12 L42 30 Z" fill="#1a0d3a" stroke="#2d1b69" strokeWidth="1" />
          <path d="M30 40 L24 18 L40 32 Z" fill="#2d1b69" />
        </g>
        {/* Right ear */}
        <g className={animate ? 'nox-ear-right' : ''}>
          <path d="M72 42 L80 12 L58 30 Z" fill="#1a0d3a" stroke="#2d1b69" strokeWidth="1" />
          <path d="M70 40 L76 18 L60 32 Z" fill="#2d1b69" />
        </g>

        {/* Head */}
        <ellipse cx="50" cy="52" rx="28" ry="26" fill="url(#bodyGrad)" stroke="#2d1b69" strokeWidth="1.5" />

        {/* Fur highlights on head */}
        <ellipse cx="50" cy="40" rx="14" ry="8" fill="rgba(45,27,105,0.35)" />

        {/* Cheek marks */}
        <ellipse cx="28" cy="56" rx="6" ry="3.5" fill="rgba(124,58,237,0.25)" />
        <ellipse cx="72" cy="56" rx="6" ry="3.5" fill="rgba(124,58,237,0.25)" />

        {/* Left eye */}
        <g className={animate ? 'nox-blink' : ''}>
          <ellipse cx="39" cy={50 + eyeConfig.offsetY} rx={eyeConfig.rx} ry={eyeConfig.ry} fill="white" filter="url(#glow)" />
          <ellipse cx="39" cy={50 + eyeConfig.offsetY} rx="3.5" ry={eyeConfig.pupilRy} fill="url(#eyeGrad)" />
          <circle cx="41" cy={47 + eyeConfig.offsetY} r="1.5" fill="white" opacity="0.9" />
          <circle cx="37.5" cy={52 + eyeConfig.offsetY} r="0.7" fill="white" opacity="0.5" />
        </g>

        {/* Right eye */}
        <g className={animate ? 'nox-blink' : ''}>
          <ellipse cx="61" cy={50 + eyeConfig.offsetY} rx={eyeConfig.rx} ry={eyeConfig.ry} fill="white" filter="url(#glow)" />
          <ellipse cx="61" cy={50 + eyeConfig.offsetY} rx="3.5" ry={eyeConfig.pupilRy} fill="url(#eyeGrad)" />
          <circle cx="63" cy={47 + eyeConfig.offsetY} r="1.5" fill="white" opacity="0.9" />
          <circle cx="59.5" cy={52 + eyeConfig.offsetY} r="0.7" fill="white" opacity="0.5" />
        </g>

        {/* Excited sparkle dots */}
        {emotion === 'excited' && (
          <>
            <circle cx="34" cy={44 + eyeConfig.offsetY} r="1" fill="white" opacity="0.7" />
            <circle cx="66" cy={44 + eyeConfig.offsetY} r="1" fill="white" opacity="0.7" />
          </>
        )}

        {/* Snout */}
        <ellipse cx="50" cy="63" rx="9" ry="6" fill="#150d30" />
        {/* Nose */}
        <ellipse cx="50" cy="60" rx="3.5" ry="2.5" fill="#0f0820" />
        <ellipse cx="49" cy="59.5" rx="1.2" ry="0.8" fill="rgba(100,80,140,0.5)" />

        {/* Mouth */}
        {(emotion === 'amused' || emotion === 'excited' || emotion === 'proud') ? (
          <path d="M44 65 Q50 70 56 65" stroke="#4c1d95" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        ) : emotion === 'surprised' ? (
          <ellipse cx="50" cy="67" rx="3" ry="3.5" fill="#0f0820" />
        ) : (
          <path d="M45 65 Q50 68 55 65" stroke="#4c1d95" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        )}

        {/* Body */}
        <ellipse cx="50" cy="90" rx="20" ry="16" fill="url(#bodyGrad)" stroke="#2d1b69" strokeWidth="1" />
        {/* Body highlight */}
        <ellipse cx="50" cy="84" rx="10" ry="5" fill="rgba(45,27,105,0.30)" />

        {/* Crystal (neck) */}
        <g className="crystal-anim">
          <line x1="50" y1="82" x2="50" y2="94" stroke="#FB5607" strokeWidth="1.5" />
          <circle cx="50" cy="81" r="2" fill="#FF006E" />
          <polygon points="50,94 46,102 50,106 54,102" fill="url(#crystalGrad)" />
          <polygon points="50,94 46,102 50,98" fill="rgba(255,190,11,0.45)" />
          <line x1="50" y1="94" x2="50" y2="106" stroke="rgba(255,190,11,0.3)" strokeWidth="0.5" />
        </g>
      </g>
    </svg>
  )
}
