import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { user_id, question_id, value } = await request.json()
    await pool.query(
      'INSERT INTO answers (user_id, question_id, value) VALUES ($1, $2, $3) ON CONFLICT (user_id, question_id) DO NOTHING',
      [user_id, question_id, value]
    )
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
