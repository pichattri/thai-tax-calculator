import { useEffect, useRef } from 'react'
import * as XLSX from 'xlsx'
import Charts from './Charts'
import PlanningTable from './PlanningTable'

function StatCard({ label, value, sub, color = 'text-white' }) {
  return (
    <div className="kol-card text-center">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`font-heading text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function PlanningView({ kols, budget, onRefresh, loading }) {
  const total = kols.length
  const pass = kols.filter(k => k.kqsResult?.includes('ผ่าน') && !k.kqsResult?.includes('ไม่')).length
  const consider = kols.filter(k => k.kqsResult?.includes('พิจารณา')).length
  const fail = kols.filter(k => k.kqsResult?.includes('ไม่ผ่าน')).length
  const spent = kols.filter(k => k.status === 'ตกลงแล้ว').reduce((s, k) => s + (parseFloat(k.feeAgreed) || 0), 0)
  const avgKqs = total > 0
    ? (kols.reduce((s, k) => s + (parseFloat(k.kqsScore) || 0), 0) / total).toFixed(1)
    : '—'

  const fmt = n => new Intl.NumberFormat('th-TH').format(n)
  const pct = n => total > 0 ? ` (${Math.round(n / total * 100)}%)` : ''

  const timerRef = useRef(null)
  useEffect(() => {
    timerRef.current = setInterval(onRefresh, 30000)
    return () => clearInterval(timerRef.current)
  }, [onRefresh])

  const handleExport = () => {
    const rows = kols.map(k => ({
      'ชื่อ KOL': k.name,
      'Platform': k.platform,
      'ประเภท': k.type,
      'หมวดหมู่': k.category,
      'เงื่อนไขการใช้งาน': k.conditions,
      'Follower': k.followers,
      'Contact': k.contact,
      'Tags': k.tags,
      'สถานะ': k.status,
      'Save Rate': k.saveRate,
      'Comment Quality': k.commentQuality,
      'ER': k.engagementRate,
      'Age%': k.audienceAge,
      'Female%': k.audienceFemale,
      'Content': k.contentRelevance,
      'Trust': k.trustSignal,
      'KQS Score': k.kqsScore,
      'ผล': k.kqsResult,
      'ค่าตัวตั้งไว้': k.feeSet,
      'ค่าตัวตกลง': k.feeAgreed,
      'หมายเหตุ': k.note,
      'เดือน': k.month,
      'วันที่บันทึก': k.createdAt,
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'KOLs')
    XLSX.writeFile(wb, `MegaClinic_KOL_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-heading text-2xl font-semibold text-white">Planning Dashboard</h1>
        <div className="flex items-center gap-2">
          {loading && <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />}
          <span className="text-xs text-gray-500">รีเฟรชอัตโนมัติทุก 30 วินาที</span>
          <button onClick={handleExport} className="btn-accent text-xs">
            📥 Export Excel
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <StatCard label="KOL ทั้งหมด" value={total} />
        <StatCard label="✅ ผ่าน" value={pass} sub={pct(pass)} color="text-green-400" />
        <StatCard label="⚠️ พิจารณา" value={consider} sub={pct(consider)} color="text-yellow-400" />
        <StatCard label="❌ ไม่ผ่าน" value={fail} sub={pct(fail)} color="text-red-400" />
        <StatCard
          label="งบที่ใช้"
          value={`฿${fmt(spent)}`}
          sub={`จาก ฿${fmt(budget)}`}
          color={spent > budget * 0.9 ? 'text-red-400' : 'text-accent'}
        />
        <StatCard label="KQS เฉลี่ย" value={avgKqs} color="text-blue-300" />
      </div>

      <Charts kols={kols} />
      <PlanningTable kols={kols} />
    </div>
  )
}
