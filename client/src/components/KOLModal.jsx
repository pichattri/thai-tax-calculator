import { getResultBadgeClass, getStatusColor } from '../utils/scoring'

function Row({ label, value }) {
  return (
    <div className="flex gap-2 py-1.5 border-b border-gray-800 text-sm">
      <span className="text-gray-400 w-40 shrink-0">{label}</span>
      <span className="text-white">{value || '—'}</span>
    </div>
  )
}

function fmt(n) {
  const num = parseFloat(n)
  if (!num) return '—'
  return '฿' + new Intl.NumberFormat('th-TH').format(num)
}

export default function KOLModal({ kol, onClose }) {
  if (!kol) return null

  const breakdown = [
    { label: 'Save Rate', raw: kol.saveRate, weight: '25%' },
    { label: 'Comment Quality', raw: kol.commentQuality, weight: '20%' },
    { label: 'Engagement Rate', raw: kol.engagementRate, weight: '15%' },
    { label: 'Audience อายุ 25-40', raw: kol.audienceAge, weight: '15%' },
    { label: 'Audience เพศหญิง', raw: kol.audienceFemale, weight: '10%' },
    { label: 'Content Relevance', raw: kol.contentRelevance, weight: '10%' },
    { label: 'Trust Signal', raw: kol.trustSignal, weight: '5%' },
  ]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="font-heading text-xl font-bold text-white">{kol.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-navy-card px-2 py-0.5 rounded text-gray-300">{kol.platform}</span>
                <span className="text-xs bg-navy-card px-2 py-0.5 rounded text-gray-300">{kol.type}</span>
                <span className={`text-xs font-medium ${getStatusColor(kol.status)}`}>{kol.status}</span>
              </div>
            </div>
            <div className="text-center mr-8">
              <p className="text-xs text-gray-400">KQS Score</p>
              <p className="font-heading text-4xl font-bold text-accent">{kol.kqsScore || '—'}</p>
              {kol.kqsResult && <span className={getResultBadgeClass(kol.kqsResult)}>{kol.kqsResult}</span>}
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">×</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-heading text-sm font-medium text-accent mb-2 uppercase tracking-wide">ข้อมูล KOL</h3>
              <Row label="หมวดหมู่" value={kol.category} />
              <Row label="Follower" value={kol.followers ? Number(kol.followers).toLocaleString() : null} />
              <Row label="Contact" value={kol.contact} />
              <Row label="Tag" value={kol.tags} />
              <Row label="เดือนที่ประเมิน" value={kol.month} />
              <Row label="ค่าตัวที่ตั้งไว้" value={fmt(kol.feeSet)} />
              <Row label="ค่าตัวตกลงจริง" value={fmt(kol.feeAgreed)} />
            </div>
            <div>
              <h3 className="font-heading text-sm font-medium text-accent mb-2 uppercase tracking-wide">KQS Breakdown</h3>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-500">
                    <th className="text-left py-1">เกณฑ์</th>
                    <th className="text-center">ค่า</th>
                    <th className="text-center">น้ำหนัก</th>
                  </tr>
                </thead>
                <tbody>
                  {breakdown.map(b => (
                    <tr key={b.label} className="border-t border-gray-800">
                      <td className="py-1.5 text-gray-300">{b.label}</td>
                      <td className="text-center text-white">{b.raw || '—'}</td>
                      <td className="text-center text-gray-400">{b.weight}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {kol.conditions && (
            <div className="mt-4">
              <h3 className="font-heading text-sm font-medium text-accent mb-2 uppercase tracking-wide">เงื่อนไขการใช้งาน</h3>
              <p className="text-gray-300 text-sm bg-navy rounded-lg p-3 border border-gray-800">{kol.conditions}</p>
            </div>
          )}

          {kol.note && (
            <div className="mt-4">
              <h3 className="font-heading text-sm font-medium text-gray-400 mb-1">หมายเหตุ</h3>
              <p className="text-gray-300 text-sm">{kol.note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
