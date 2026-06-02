import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const result = await pool.query(
      'SELECT * FROM answers WHERE user_id = $1',
      [params.userId]
    )
    return NextResponse.json(result.rows)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
