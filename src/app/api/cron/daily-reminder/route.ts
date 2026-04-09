import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Placeholder: send push notifications to users who haven't completed habits today
  // This will be implemented when VAPID keys and web-push are configured

  return NextResponse.json({ ok: true, message: 'Daily reminder cron executed' })
}
