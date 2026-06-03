'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TEMPLATES } from '@/lib/templates'
import type { GameTemplate } from '@/lib/types'

export default function HomePage() {
  const router = useRouter()
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [selectedPremiumTemplate, setSelectedPremiumTemplate] = useState<GameTemplate | null>(null)

  const handleTemplateClick = (t: GameTemplate) => {
    if (t.is_premium) {
      setSelectedPremiumTemplate(t)
      setShowPremiumModal(true)
    } else {
      router.push(`/create?template=${t.slug}`)
    }
  }

  return (
    <div style={{ background: '#08080f', minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '48px 20px 40px', gap: '32px', position: 'relative', overflow: 'hidden' }}>
      {/* blobs */}
      <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
        <div style={{ position:'absolute', top:'-120px', left:'-100px', width:'400px', height:'400px', borderRadius:'9999px', background:'radial-gradient(circle, rgba(139,92,246,0.20) 0%, transparent 70%)', filter:'blur(60px)' }} />
        <div style={{ position:'absolute', bottom:'-100px', right:'-80px', width:'380px', height:'380px', borderRadius:'9999px', background:'radial-gradient(circle, rgba(236,72,153,0.18) 0%, transparent 70%)', filter:'blur(60px)' }} />
      </div>

      {/* Hero */}
      <div style={{ zIndex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'16px', textAlign:'center' }}>
        <div style={{ width:'72px', height:'72px', borderRadius:'22px', background:'linear-gradient(135deg,#8b5cf6,#a855f7,#ec4899)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem', fontWeight:900, color:'white', boxShadow:'0 20px 50px rgba(168,85,247,0.45)' }}>I</div>
        <div>
          <h1 style={{ fontSize:'3.8rem', fontWeight:900, lineHeight:1, background:'linear-gradient(135deg,#a855f7,#3b82f6,#ec4899)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', margin:0 }}>Inside</h1>
          <p style={{ fontSize:'1rem', fontWeight:700, color:'rgba(240,240,245,0.70)', marginTop:'8px' }}>La plateforme de jeux sociaux privés</p>
          <p style={{ fontSize:'.82rem', color:'rgba(240,240,245,0.38)', marginTop:'6px', lineHeight:1.6, maxWidth:'260px', margin:'8px auto 0' }}>Crée une expérience unique pour ton groupe en moins de 3 minutes.</p>
        </div>
      </div>

      {/* Templates */}
      <div style={{ zIndex:1, display:'flex', flexDirection:'column', gap:'14px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <p style={{ fontSize:'13px', fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em', color:'rgba(240,240,245,0.45)', margin:0 }}>Jeux prêts à jouer</p>
          <span style={{ fontSize:'12px', color:'rgba(240,240,245,0.30)' }}>{TEMPLATES.filter(t => t.slug !== 'creation-libre').length} modèles</span>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          {TEMPLATES.map(t => (
            <div
              key={t.id}
              onClick={() => handleTemplateClick(t)}
              style={{ textDecoration:'none', borderRadius:'20px', overflow:'hidden', background:`linear-gradient(135deg, ${t.color_from}22, ${t.color_to}18)`, border:`1px solid ${t.color_from}30`, padding:'18px 14px', display:'flex', flexDirection:'column', gap:'8px', cursor:'pointer', position:'relative' }}
            >
              {t.is_premium && (
                <div style={{ position:'absolute', top:'10px', right:'10px', background:'linear-gradient(135deg,#f59e0b,#a855f7)', borderRadius:'8px', padding:'3px 7px', fontSize:'10px', fontWeight:800, color:'#fff', letterSpacing:'.04em' }}>
                  Inside+
                </div>
              )}
              <span style={{ fontSize:'2rem', lineHeight:1 }}>{t.emoji}</span>
              <div>
                <div style={{ fontWeight:800, fontSize:'.95rem', color:'#f0f0f5', display:'flex', alignItems:'center', gap:'6px' }}>
                  {t.name}
                  {t.is_premium && <span style={{ fontSize:'0.85rem' }}>🔒</span>}
                </div>
                <div style={{ fontSize:'.75rem', color:'rgba(240,240,245,0.45)', marginTop:'3px', lineHeight:1.4 }}>{t.description}</div>
              </div>
              {t.question_count > 0 && (
                <div style={{ fontSize:'11px', fontWeight:700, color:'rgba(240,240,245,0.40)', marginTop:'4px' }}>{t.question_count} questions</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Join */}
      <div style={{ zIndex:1, display:'flex', flexDirection:'column', gap:'10px', marginTop:'auto' }}>
        <Link href="/join" style={{ width:'100%', padding:'17px', borderRadius:'16px', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.13)', color:'#f0f0f5', textAlign:'center', fontWeight:700, fontSize:'1.05rem', textDecoration:'none', display:'block' }}>
          🚪 Rejoindre une salle
        </Link>
        <p style={{ textAlign:'center', fontSize:'11px', color:'rgba(240,240,245,0.22)', margin:0 }}>Sans compte · 100% privé · Gratuit</p>
      </div>

      {/* Premium Modal */}
      {showPremiumModal && selectedPremiumTemplate && (
        <div
          style={{ position:'fixed', inset:0, zIndex:100, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}
          onClick={() => setShowPremiumModal(false)}
        >
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.65)', backdropFilter:'blur(6px)' }} />
          <div
            style={{ position:'relative', zIndex:1, background:'linear-gradient(180deg,rgba(18,12,40,0.98),rgba(10,8,24,0.99))', borderRadius:'28px 28px 0 0', padding:'28px 24px 48px', display:'flex', flexDirection:'column', gap:'20px', border:'1px solid rgba(255,255,255,0.10)', borderBottom:'none' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div style={{ width:'44px', height:'4px', borderRadius:'99px', background:'rgba(255,255,255,0.20)', margin:'0 auto -8px' }} />

            {/* Header */}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'10px', textAlign:'center' }}>
              <div style={{ fontSize:'3rem', lineHeight:1 }}>{selectedPremiumTemplate.emoji}</div>
              <div>
                <div style={{ fontWeight:900, fontSize:'1.3rem', color:'#f0f0f5' }}>{selectedPremiumTemplate.name}</div>
                <div style={{ fontWeight:700, fontSize:'0.85rem', background:'linear-gradient(135deg,#f59e0b,#a855f7)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', marginTop:'2px' }}>✨ Inside+</div>
              </div>
              <p style={{ fontSize:'.88rem', color:'rgba(240,240,245,0.55)', lineHeight:1.5 }}>Ce jeu fait partie d&apos;Inside+</p>
            </div>

            {/* Benefits */}
            <div style={{ background:'rgba(255,255,255,0.05)', borderRadius:'16px', padding:'16px 18px', display:'flex', flexDirection:'column', gap:'10px' }}>
              {[
                'Templates exclusifs illimités',
                'Questions sans limite',
                'Thèmes et personnalisation',
                'Sans pub, pour toujours',
              ].map((benefit, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:'10px', fontSize:'.9rem', color:'rgba(240,240,245,0.80)' }}>
                  <span style={{ color:'#a855f7', fontWeight:700 }}>✦</span>
                  {benefit}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              <button
                onClick={() => { alert('Bientôt disponible !') }}
                style={{ width:'100%', padding:'17px', borderRadius:'16px', background:'linear-gradient(135deg,#8b5cf6,#a855f7,#ec4899)', border:'none', color:'#fff', fontWeight:700, fontSize:'1.05rem', cursor:'pointer', fontFamily:'inherit', boxShadow:'0 10px 40px rgba(168,85,247,0.35)', opacity:0.7 }}
              >
                Obtenir Inside+ 🚀 — Bientôt disponible
              </button>
              <button
                onClick={() => { setShowPremiumModal(false); router.push('/create') }}
                style={{ width:'100%', padding:'15px', borderRadius:'16px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(240,240,245,0.70)', fontWeight:600, fontSize:'.95rem', cursor:'pointer', fontFamily:'inherit' }}
              >
                Jouer quand même (version limitée)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
