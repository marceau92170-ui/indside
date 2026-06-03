'use client'
import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function RoomRedirect() {
  const params = useParams()
  const router = useRouter()
  const code = (params.code as string).toUpperCase()

  useEffect(() => {
    async function redirect() {
      const playerId = localStorage.getItem(`inside_player_${code}`)
      if (!playerId) {
        router.push(`/join?code=${code}`)
        return
      }
      const { data: room } = await supabase.from('rooms').select('status').eq('code', code).single()
      if (!room) { router.push('/'); return }
      if (room.status === 'waiting') router.push(`/lobby/${code}`)
      else if (room.status === 'playing') router.push(`/game/${code}`)
      else router.push(`/results/${code}`)
    }
    redirect()
  }, [code, router])

  return (
    <div style={{ minHeight: '100vh', background: '#08080f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'rgba(240,240,245,0.4)', fontSize: '0.9rem' }}>Chargement...</div>
    </div>
  )
}
