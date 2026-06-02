import { useState } from 'react'
import { getResultBadgeClass, getStatusColor } from '../utils/scoring'
import KOLModal from './KOLModal'

const STATUS_OPTIONS = ['ทั้งหมด', 'ยังไม่ติดต่อ', 'ติดต่อแล้ว', 'รอ Insight', 'ตกลงแล้ว', 'ปฏิเสธ']
const TAG_OPTIONS = ['ทั้งหมด', 'Filler', 'Botox', 'Skincare', 'Slimming', 'Hair', 'Other']
const RESULT_OPTIONS = ['ทั้งหมด', '✅ ผ่าน', '⚠️ พิจารณา', '❌ ไม่ผ่าน']

function fmt(n) {
  const num = parseFloat(n)
  if (!num) return '—'
  return '฿' + new Intl.NumberFormat('th-TH').format(num)
}

export default function PlanningTable({ kols }) {
  const [selected, setSelected] = useState(null)
  const [platform, setPlatform] = useState('ทั้งหมด')
  const [type, setType] = useState('ทั้งหมด')
  const [category, setCategory] = useState('ทั้งหมด')
  const [result, setResult] = useState('ทั้งหมด')
  const [tag, setTag] = useState('ทั้งหมด')
  const [status, setStatus] = useState('ทั้งหมด')
  const [month, setMonth] = useState('')
  const [sortBy, setSortBy] = useState('kqsScore')

  const categories = ['ทั้งหมด', ...new Set(kols.map(k => k.category).filter(Boolean))]

  const filtered = kols
    .filter(k => {
      if (platform !== 'ทั้งหมด' && k.platform !== platform) return false
      if (type !== 'ทั้งหมด' && k.type !== type) return false
      if (category !== 'ทั้งหมด' && k.category !== category) return false
      if (result !== 'ทั้งหมด' && k.kqsResult !== result) return false
      if (tag !== 'ทั้งหมด') {
        const tags = k.tags ? k.tags.split(',') : []
        if (!tags.includes(tag)) return false
      }
      if (status !== 'ทั้งหมด' && k.status !== status) return false
      if (month && k.month !== month) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'kqsScore') return (parseFloat(b.kqsScore) || 0) - (parseFloat(a.kqsScore) || 0)
      if (sortBy === 'followers') return (parseFloat(b.followers) || 0) - (parseFloat(a.followers) || 0)
      if (sortBy === 'feeAgreed') return (parseFloat(b.feeAgreed) || 0) - (parseFloat(a.feeAgreed) || 0)
      return 0
    })

  return (
    <div className="kol-card">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="font-heading font-semibold text-white">รายการ KOL ({filtered.length})</h2>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="kol-select w-36 text-xs">
          <option value="kqsScore">KQS Score</option>
          <option value="followers">Follower</option>
          <option value="feeAgreed">ค่าตัวตกลง</option>
        </select>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <select value={platform} onChange={e => setPlatform(e.target.value)} className="kol-select w-28 text-xs">
          {['ทั้งหมด', 'IG', 'TikTok', 'YouTube'].map(p => <option key={p}>{p}</option>)}
        </select>
        <select value={type} onChange={e => setType(e.target.value)} className="kol-select w-28 text-xs">
          {['ทั้งหมด', 'Nano', 'Micro', 'Macro', 'Mega'].map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={category} onChange={e => setCategory(e.target.value)} className="kol-select w-40 text-xs">
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={result} onChange={e => setResult(e.target.value)} className="kol-select w-32 text-xs">
          {RESULT_OPTIONS.map(r => <option key={r}>{r}</option>)}
        </select>
        <select value={tag} onChange={e => setTag(e.target.value)} className="kol-select w-28 text-xs">
          {TAG_OPTIONS.map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)} className="kol-select w-36 text-xs">
          {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
        </select>
        <input type="month" value={month} onChange={e => setMonth(e.target.value)} className="kol-input w-36 text-xs" />
      </div>

      <div className="overflow-x-auto -mx-4 px-4">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="text-gray-400 text-xs border-b border-gray-700">
              <th className="text-left py-2 pr-3">ชื่อ</th>
              <th className="text-left pr-3">Platform</th>
              <th className="text-left pr-3">ประเภท</th>
              <th className="text-left pr-3">หมวดหมู่</th>
              <th className="text-right pr-3">Follower</th>
              <th className="text-center pr-3">KQS</th>
              <th className="text-center pr-3">ผล</th>
              <th className="text-left pr-3">สถานะ</th>
              <th className="text-left pr-3">Tag</th>
              <th className="text-right pr-3">ค่าตัวตกลง</th>
              <th className="text-left">เดือน</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(k => (
              <tr key={k.id} className="table-row" onClick={() => setSelected(k)}>
                <td className="py-2 pr-3 text-white font-medium max-w-[140px] truncate">{k.name}</td>
                <td className="pr-3 text-gray-300">{k.platform}</td>
                <td className="pr-3 text-gray-300">{k.type}</td>
                <td className="pr-3 text-gray-400 text-xs max-w-[120px] truncate">{k.category}</td>
                <td className="pr-3 text-right text-gray-300 tabular-nums">
                  {k.followers ? Number(k.followers).toLocaleString() : '—'}
                </td>
                <td className="pr-3 text-center font-heading font-bold text-white">{k.kqsScore || '—'}</td>
                <td className="pr-3 text-center">
                  {k.kqsResult ? <span className={getResultBadgeClass(k.kqsResult)}>{k.kqsResult.replace(/^[✅⚠️❌] /, '')}</span> : '—'}
                </td>
                <td className={`pr-3 text-xs ${getStatusColor(k.status)}`}>{k.status}</td>
                <td className="pr-3 text-xs text-gray-400 max-w-[90px] truncate">{k.tags || '—'}</td>
                <td className="pr-3 text-right text-green-400 tabular-nums">{fmt(k.feeAgreed)}</td>
                <td className="text-gray-400 text-xs">{k.month || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-12 text-sm">ไม่พบข้อมูลตามตัวกรอง</p>
        )}
      </div>

      <KOLModal kol={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
