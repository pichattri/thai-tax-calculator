import { useState } from 'react'
import { getResultBadgeClass, getStatusColor } from '../utils/scoring'

const STATUS_OPTIONS = ['แจ้งเข้ามา', 'ยังไม่ติดต่อ', 'ติดต่อแล้ว', 'รอ Insight', 'ตกลงแล้ว', 'ปฏิเสธ']

function fmt(n) {
  const num = parseFloat(n)
  if (!num) return '—'
  return new Intl.NumberFormat('th-TH').format(num)
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: '2-digit' })
}

export default function KOLList({ kols, onEdit, onDelete, onStatusChange }) {
  const [search, setSearch] = useState('')
  const [filterPlatform, setFilterPlatform] = useState('ทั้งหมด')
  const [filterStatus, setFilterStatus] = useState('ทั้งหมด')
  const [sortBy, setSortBy] = useState('updatedAt')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const filtered = kols
    .filter(k => {
      if (search && !k.name?.toLowerCase().includes(search.toLowerCase())) return false
      if (filterPlatform !== 'ทั้งหมด' && k.platform !== filterPlatform) return false
      if (filterStatus !== 'ทั้งหมด' && k.status !== filterStatus) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'kqsScore') return (parseFloat(b.kqsScore) || 0) - (parseFloat(a.kqsScore) || 0)
      if (sortBy === 'followers') return (parseFloat(b.followers) || 0) - (parseFloat(a.followers) || 0)
      return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
    })

  return (
    <div className="kol-card">
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <h2 className="font-heading font-semibold text-white mr-auto">รายการ KOL ({kols.length})</h2>
        <input
          placeholder="ค้นหาชื่อ KOL..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="kol-input w-44 text-xs"
        />
        <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)} className="kol-select w-32 text-xs">
          {['ทั้งหมด', 'IG', 'TikTok', 'YouTube'].map(p => <option key={p}>{p}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="kol-select w-36 text-xs">
          <option>ทั้งหมด</option>
          {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="kol-select w-36 text-xs">
          <option value="updatedAt">เรียงตาม: วันที่</option>
          <option value="kqsScore">เรียงตาม: KQS</option>
          <option value="followers">เรียงตาม: Follower</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-500 py-12 text-sm">ยังไม่มีข้อมูล KOL</p>
      ) : (
        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="text-gray-400 text-xs border-b border-gray-700">
                <th className="text-left py-2 pr-3">ชื่อ</th>
                <th className="text-left pr-3">ผู้ขอ</th>
                <th className="text-left pr-3">Platform</th>
                <th className="text-left pr-3">ประเภท</th>
                <th className="text-left pr-3">หมวดหมู่</th>
                <th className="text-left pr-3">สถานะ</th>
                <th className="text-center pr-3">KQS</th>
                <th className="text-center pr-3">ผล</th>
                <th className="text-right pr-3">ค่าตัวตกลง</th>
                <th className="text-left pr-3">Tag</th>
                <th className="text-left pr-3">หมายเหตุ</th>
                <th className="text-left pr-3">แก้ไขล่าสุด</th>
                <th className="text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(k => (
                <tr
                  key={k.id}
                  className="table-row"
                  onClick={() => onEdit(k)}
                >
                  <td className="py-2 pr-3 text-white font-medium max-w-[140px] truncate">{k.name}</td>
                  <td className="pr-3 text-xs max-w-[100px] truncate">
                    {k.requester
                      ? <span className="text-accent font-medium">{k.requester}</span>
                      : <span className="text-gray-600">—</span>}
                  </td>
                  <td className="pr-3 text-gray-300">{k.platform}</td>
                  <td className="pr-3 text-gray-300">{k.type}</td>
                  <td className="pr-3 text-gray-400 text-xs max-w-[120px] truncate">{k.category}</td>
                  <td className="pr-3" onClick={e => e.stopPropagation()}>
                    <select
                      value={k.status}
                      onChange={e => onStatusChange(k.id, e.target.value)}
                      className={`bg-transparent text-xs border-none outline-none cursor-pointer ${getStatusColor(k.status)}`}
                      onClick={e => e.stopPropagation()}
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} className="bg-gray-900 text-white">{s}</option>)}
                    </select>
                  </td>
                  <td className="pr-3 text-center">
                    <span className="font-heading font-bold text-white">{k.kqsScore || '—'}</span>
                  </td>
                  <td className="pr-3 text-center">
                    {k.kqsResult ? (
                      <span className={getResultBadgeClass(k.kqsResult)}>
                        {k.kqsResult.replace('✅ ', '').replace('⚠️ ', '').replace('❌ ', '')}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="pr-3 text-right text-green-400">{fmt(k.feeAgreed)}</td>
                  <td className="pr-3 text-xs text-gray-400 max-w-[100px] truncate">{k.tags || '—'}</td>
                  <td className="pr-3 text-xs text-gray-400 max-w-[120px] truncate">{k.note || '—'}</td>
                  <td className="pr-3 text-xs text-gray-500">{fmtDate(k.updatedAt)}</td>
                  <td className="text-center" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => setConfirmDelete(k)}
                      className="text-red-500 hover:text-red-300 text-xs px-2 py-1 rounded hover:bg-red-900 hover:bg-opacity-30 transition-colors"
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="modal-overlay">
          <div className="bg-navy-light rounded-xl p-6 max-w-sm w-full border border-gray-700">
            <h3 className="font-heading font-semibold text-white mb-2">ยืนยันการลบ</h3>
            <p className="text-gray-300 text-sm mb-4">
              ต้องการลบ <span className="text-accent font-medium">{confirmDelete.name}</span> ออกจากระบบ?
            </p>
            <div className="flex gap-3">
              <button
                onClick={async () => { await onDelete(confirmDelete.id); setConfirmDelete(null) }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm flex-1"
              >
                ลบ
              </button>
              <button onClick={() => setConfirmDelete(null)} className="btn-ghost flex-1">ยกเลิก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
