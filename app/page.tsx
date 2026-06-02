'use client'
import Link from 'next/link'
import { TEMPLATES } from '@/lib/templates'

export default function HomePage() {
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
            <Link key={t.id} href={`/create?template=${t.slug}`} style={{ textDecoration:'none', borderRadius:'20px', overflow:'hidden', background:`linear-gradient(135deg, ${t.color_from}22, ${t.color_to}18)`, border:`1px solid ${t.color_from}30`, padding:'18px 14px', display:'flex', flexDirection:'column', gap:'8px', cursor:'pointer' }}>
              <span style={{ fontSize:'2rem', lineHeight:1 }}>{t.emoji}</span>
              <div>
                <div style={{ fontWeight:800, fontSize:'.95rem', color:'#f0f0f5' }}>{t.name}</div>
                <div style={{ fontSize:'.75rem', color:'rgba(240,240,245,0.45)', marginTop:'3px', lineHeight:1.4 }}>{t.description}</div>
              </div>
              {t.question_count > 0 && (
                <div style={{ fontSize:'11px', fontWeight:700, color:'rgba(240,240,245,0.40)', marginTop:'4px' }}>{t.question_count} questions</div>
              )}
            </Link>
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
    </div>
  )
}
