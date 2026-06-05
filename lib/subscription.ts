import { supabase } from './supabase'

export const FREE_LIMITS = {
  maxPlayers: 15,
  maxQuestions: 15,
  maxActiveRooms: 1,
}

export function getUserToken(): string {
  if (typeof window === 'undefined') return ''
  let token = localStorage.getItem('flower_user_token')
  if (!token) {
    token = crypto.randomUUID()
    localStorage.setItem('flower_user_token', token)
  }
  return token
}

export async function getUserPlan(userToken?: string): Promise<'free' | 'premium'> {
  const token = userToken || getUserToken()
  if (!token) return 'free'

  const { data } = await supabase
    .from('subscriptions')
    .select('plan, status, current_period_end')
    .eq('user_token', token)
    .single()

  if (!data) return 'free'
  if (data.status !== 'active' && data.status !== 'trialing') return 'free'
  if (data.current_period_end && new Date(data.current_period_end) < new Date()) return 'free'
  return data.plan === 'premium' ? 'premium' : 'free'
}

export async function canCreateRoom(): Promise<{ allowed: boolean; reason?: string }> {
  const plan = await getUserPlan()
  if (plan === 'premium') return { allowed: true }

  const token = getUserToken()
  const { count } = await supabase
    .from('rooms')
    .select('id', { count: 'exact', head: true })
    .eq('created_by', token)
    .neq('status', 'finished')

  if ((count ?? 0) >= FREE_LIMITS.maxActiveRooms) {
    return { allowed: false, reason: `Limite de ${FREE_LIMITS.maxActiveRooms} salle active atteinte` }
  }
  return { allowed: true }
}

export async function canAddQuestion(currentCount: number): Promise<{ allowed: boolean; reason?: string }> {
  const plan = await getUserPlan()
  if (plan === 'premium') return { allowed: true }
  if (currentCount >= FREE_LIMITS.maxQuestions) {
    return { allowed: false, reason: `Limite de ${FREE_LIMITS.maxQuestions} questions atteinte` }
  }
  return { allowed: true }
}

export async function canUsePremiumTemplate(): Promise<{ allowed: boolean }> {
  const plan = await getUserPlan()
  return { allowed: plan === 'premium' }
}

export async function canAddPlayer(currentCount: number): Promise<{ allowed: boolean; reason?: string }> {
  const plan = await getUserPlan()
  if (plan === 'premium') return { allowed: true }
  if (currentCount >= FREE_LIMITS.maxPlayers) {
    return { allowed: false, reason: `Limite de ${FREE_LIMITS.maxPlayers} joueurs atteinte` }
  }
  return { allowed: true }
}
