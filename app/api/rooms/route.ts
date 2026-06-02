import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function POST(request: NextRequest) {
  try {
    const { name, image_url } = await request.json()
    const code = generateCode()
    const result = await pool.query(
      'INSERT INTO rooms (code, name, image_url) VALUES ($1, $2, $3) RETURNING id, code, name, image_url',
      [code, name, image_url ?? null]
    )
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
