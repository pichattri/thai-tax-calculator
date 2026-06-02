import { daysSince } from '../utils/scoring'

export default function AlertsBanner({ kols }) {
  const alerts = kols.filter(k => {
    if (k.status === 'รอ Insight' && daysSince(k.statusUpdatedAt) >= 3) return true
    if (k.status === 'ติดต่อแล้ว' && daysSince(k.statusUpdatedAt) >= 3) return true
    return false
  })

  if (alerts.length === 0) return null

  return (
    <div className="mb-4 space-y-2">
      {alerts.map(k => (
        <div key={k.id} className="flex items-center gap-3 bg-yellow-900 bg-opacity-40 border border-yellow-700 rounded-lg px-4 py-2.5 text-sm">
          <span className="text-yellow-400 text-base">⚠️</span>
          <span className="text-yellow-200">
            <span className="font-medium">{k.name}</span>
            {' — สถานะ '}
            <span className="font-semibold">{k.status}</span>
            {' มานานกว่า '}
            <span className="font-semibold">{daysSince(k.statusUpdatedAt)} วัน</span>
          </span>
        </div>
      ))}
    </div>
  )
}
