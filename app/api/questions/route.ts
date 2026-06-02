import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { room_id, questions } = await request.json()
    const inserted = []
    for (let i = 0; i < questions.length; i++) {
      const result = await pool.query(
        'INSERT INTO questions (room_id, text, order_index) VALUES ($1, $2, $3) RETURNING *',
        [room_id, questions[i], i]
      )
      inserted.push(result.rows[0])
    }
    return NextResponse.json(inserted, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
