import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const result = await pool.query(
      'SELECT * FROM questions WHERE room_id = $1 ORDER BY order_index',
      [params.roomId]
    )
    return NextResponse.json(result.rows)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
