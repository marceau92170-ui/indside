import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const result = await pool.query(
      'SELECT COUNT(*) FROM users WHERE room_id = $1',
      [params.roomId]
    )
    return NextResponse.json({ count: parseInt(result.rows[0].count, 10) })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
