import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = await createClient()

  const [
    { count: totalUsers },
    { count: totalHabits },
    { count: totalLogs },
    { count: totalSquads },
    { count: waitlistCount },
    { count: invitationsUsed },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('habits').select('*', { count: 'exact', head: true }),
    supabase.from('habit_logs').select('*', { count: 'exact', head: true }),
    supabase.from('squads').select('*', { count: 'exact', head: true }),
    supabase.from('waitlist').select('*', { count: 'exact', head: true }),
    supabase.from('invitations').select('*', { count: 'exact', head: true }).not('used_by', 'is', null),
  ])

  const { data: recentUsers } = await supabase
    .from('profiles')
    .select('id, display_name, username, level, created_at')
    .order('created_at', { ascending: false })
    .limit(10)

  const stats = [
    { label: 'Usuarios', value: totalUsers || 0 },
    { label: 'Hábitos creados', value: totalHabits || 0 },
    { label: 'Logs totales', value: totalLogs || 0 },
    { label: 'Squads', value: totalSquads || 0 },
    { label: 'Waitlist', value: waitlistCount || 0 },
    { label: 'Invitaciones usadas', value: invitationsUsed || 0 },
  ]

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <h1 className="text-2xl font-bold mb-8">NIVEL Admin</h1>

      <div className="grid grid-cols-3 gap-4 mb-10">
        {stats.map((s, i) => (
          <div key={i} className="bg-white border border-border rounded-xl p-4 shadow-sm">
            <p className="text-3xl font-extrabold text-accent">{s.value.toLocaleString()}</p>
            <p className="text-xs text-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-bold mb-4">Últimos registros</h2>
      <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="text-left px-4 py-2 text-xs text-muted font-semibold">Nombre</th>
              <th className="text-left px-4 py-2 text-xs text-muted font-semibold">Username</th>
              <th className="text-left px-4 py-2 text-xs text-muted font-semibold">Nivel</th>
              <th className="text-left px-4 py-2 text-xs text-muted font-semibold">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {recentUsers?.map(u => (
              <tr key={u.id} className="border-b border-border last:border-0">
                <td className="px-4 py-2.5 font-medium">{u.display_name || '—'}</td>
                <td className="px-4 py-2.5 text-muted">@{u.username || '—'}</td>
                <td className="px-4 py-2.5 text-accent font-bold">{u.level}</td>
                <td className="px-4 py-2.5 text-muted">{new Date(u.created_at).toLocaleDateString('es-ES')}</td>
              </tr>
            ))}
            {(!recentUsers || recentUsers.length === 0) && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-muted">Sin usuarios aún</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
