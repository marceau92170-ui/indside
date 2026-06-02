import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { room_id, nickname } = await request.json()
    const result = await pool.query(
      'INSERT INTO users (room_id, nickname) VALUES ($1, $2) RETURNING id, room_id, nickname',
      [room_id, nickname]
    )
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
