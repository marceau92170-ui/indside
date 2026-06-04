'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import type { Room, Player } from '@/lib/types'
import { playClick, playSuccess } from '@/lib/sound'
import NoxComment from '@/components/NoxComment'
import { getNoxComment } from '@/lib/nox'

const AVATAR_COLORS = [
  'linear-gradient(135deg, #8b5cf6, #ec4899)',
  'linear-gradient(135deg, #3b82f6, #8b5cf6)',
  'linear-gradient(135deg, #10b981, #3b82f6)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #ec4899, #f97316)',
  'linear-gradient(135deg, #06b6d4, #8b5cf6)',
]

export default function LobbyPage() {
  const params = useParams()
  const router = useRouter()
  const code = (params.code as string).toUpperCase()

  const [room, setRoom] = useState<Room | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [isHost, setIsHost] = useState(false)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [noxComment] = useState(() => getNoxComment('lobby'))
  const [launchError, setLaunchError] = useState('')

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const roomRef = useRef<Room | null>(null)

  const loadRoom = useCallback(async () => {
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', code)
      .single()

    if (roomError || !roomData) {
      router.push('/?error=notfound')
      return
    }

    const storedPlayerId = localStorage.getItem(`inside_player_${code}`)
    if (!storedPlayerId) {
      router.push(`/join?code=${code}`)
      return
    }

    if (roomData.status === 'playing') {
      router.push(`/game/${code}`)
      return
    }
    if (roomData.status === 'finished') {
      router.push(`/results/${code}`)
      return
    }

    setRoom(roomData)
    roomRef.current = roomData

    const { data: playerData } = await supabase
      .from('players')
      .select('*')
      .eq('id', storedPlayerId)
      .single()
    if (playerData) {
      setIsHost(playerData.is_host)
    }

    const { data: playersData } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', roomData.id)
      .order('created_at', { ascending: true })
    setPlayers(playersData ?? [])

    setLoading(false)
  }, [code, router])

  useEffect(() => {
    loadRoom()
  }, [loadRoom])

  useEffect(() => {
    if (!room) return

    if (channelRef.current) supabase.removeChannel(channelRef.current)

    const channel = supabase.channel(`lobby-${room.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'players',
        filter: `room_id=eq.${room.id}`,
      }, (payload) => {
        setPlayers(prev => {
          if (prev.find(p => p.id === (payload.new as Player).id)) return prev
          return [...prev, payload.new as Player]
        })
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'rooms',
        filter: `id=eq.${room.id}`,
      }, (payload) => {
        const updated = payload.new as Room
        setRoom(updated)
        roomRef.current = updated
        if (updated.status === 'playing') {
          router.push(`/game/${code}`)
        } else if (updated.status === 'finished') {
          router.push(`/results/${code}`)
        }
      })
      .subscribe()

    channelRef.current = channel
    return () => { supabase.removeChannel(channel) }
  }, [room?.id, code, router])

  const launchGame = async () => {
    if (!room) return
    if (players.length < 2) {
      setLaunchError('Invite au moins un autre joueur')
      setTimeout(() => setLaunchError(''), 3000)
      return
    }
    setLaunchError('')
    playSuccess()
    await supabase.from('rooms').update({
      status: 'playing',
      current_question_index: 0,
      question_phase: 'answering',
      question_started_at: new Date().toISOString(),
    }).eq('id', room.id)
    router.push(`/game/${code}`)
  }

  const copyCode = async () => {
    playClick()
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareRoom = async () => {
    const url = `${window.location.origin}/join?code=${code}`
    if (navigator.share) {
      await navigator.share({ title: `Inside — ${room?.name}`, url })
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#08080f' }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl animate-spin"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #a855f7, #ec4899)', boxShadow: '0 0 30px rgba(168,85,247,0.4)' }}
          />
          <p style={{ color: 'rgba(240,240,245,0.50)' }}>Chargement…</p>
        </div>
      </div>
    )
  }

  const joinUrl = typeof window !== 'undefined' ? `${window.location.origin}/join?code=${code}` : `https://inside.app/join?code=${code}`
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(joinUrl)}`

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {room?.image_url ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={room.image_url} alt="background" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.85) 100%)' }} />
        </>
      ) : (
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #0c1a3d 50%, #2d0a2e 100%)' }} />
      )}

      <div className="relative z-10 flex flex-col min-h-screen px-6 py-10 gap-6">
        <div className="flex flex-col items-center gap-3 text-center pt-4">
          <h1 className="text-3xl font-black drop-shadow-lg" style={{ color: '#f0f0f5', textShadow: '0 2px 16px rgba(0,0,0,0.7)' }}>
            {room?.name}
          </h1>
          <button
            onClick={copyCode}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full active:scale-95"
            style={{ background: 'rgba(0,0,0,0.50)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.20)' }}
          >
            <span className="font-black tracking-[0.25em] text-lg" style={{ color: '#f0f0f5' }}>{code}</span>
            <span className="text-base">{copied ? '✅' : '📋'}</span>
          </button>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="p-3 rounded-2xl"
            style={{ background: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrUrl} alt="QR Code" width={150} height={150} style={{ display: 'block', borderRadius: '8px' }} />
          </div>
        </div>

        {/* Players list */}
        <div
          className="flex-1 flex flex-col gap-4 rounded-3xl p-6"
          style={{ background: 'rgba(0,0,0,0.40)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          {players.length >= 2 && (
            <div className="flex justify-center mb-2">
              <NoxComment comment={noxComment} emotion="intrigued" size={56} />
            </div>
          )}
          <div className="grid grid-cols-3 gap-4">
            {players.map((p, i) => (
              <div key={p.id} className="flex flex-col items-center gap-2">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white"
                  style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length], boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}
                >
                  {p.nickname.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-center truncate w-full text-center" style={{ color: 'rgba(240,240,245,0.80)' }}>
                  {p.nickname}{p.is_host ? ' 👑' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom actions */}
        <div className="flex flex-col gap-3">
          {launchError && (
            <div className="py-3 px-4 rounded-2xl text-sm font-semibold text-center" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.30)', color: '#fca5a5' }}>
              {launchError}
            </div>
          )}
          {isHost ? (
            <motion.div whileTap={{ scale: 0.97 }}>
              <button
                onClick={launchGame}
                className="w-full py-5 rounded-2xl text-white font-black text-xl flex items-center justify-center gap-3"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #a855f7, #ec4899)', boxShadow: '0 12px 40px rgba(168,85,247,0.45)' }}
              >
                Commencer
              </button>
            </motion.div>
          ) : (
            <div
              className="w-full py-5 rounded-2xl text-center font-semibold"
              style={{ background: 'rgba(0,0,0,0.40)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(240,240,245,0.55)' }}
            >
              <span className="animate-pulse" style={{ color: 'rgba(240,240,245,0.45)' }}>⏳</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="flex-1 py-3 px-4 rounded-2xl text-center font-black tracking-widest" style={{ background: 'rgba(0,0,0,0.40)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(240,240,245,0.75)' }}>
              {code}
            </div>
            <button onClick={copyCode} className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl active:scale-95" style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.14)' }}>
              {copied ? '✅' : '📋'}
            </button>
            <button onClick={shareRoom} className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl active:scale-95" style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.14)' }}>
              🔗
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
