import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const qResult = await pool.query(
      'SELECT * FROM questions WHERE room_id = $1 ORDER BY order_index',
      [params.roomId]
    )
    const questions = qResult.rows

    const results = await Promise.all(
      questions.map(async (q) => {
        const aResult = await pool.query(
          'SELECT value FROM answers WHERE question_id = $1',
          [q.id]
        )
        const answers = aResult.rows
        const total = answers.length
        const yes_count = answers.filter((a) => a.value === true).length
        const no_count = total - yes_count
        return {
          question_id: q.id,
          question_text: q.text,
          yes_count,
          no_count,
          total,
        }
      })
    )

    return NextResponse.json(results)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
