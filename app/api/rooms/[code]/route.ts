import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const code = params.code.toUpperCase()
    const result = await pool.query('SELECT * FROM rooms WHERE code = $1', [code])
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }
    return NextResponse.json(result.rows[0])
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
