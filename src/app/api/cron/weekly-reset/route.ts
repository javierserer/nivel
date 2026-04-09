import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  // Update week number on all squads
  const weekNum = Math.ceil((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / 604800000)
  await supabase.from('squads').update({ week_number: weekNum })

  return NextResponse.json({ ok: true, message: 'Weekly reset executed', week: weekNum })
}
