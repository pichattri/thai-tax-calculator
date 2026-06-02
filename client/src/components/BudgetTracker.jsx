import { useState } from 'react'

export default function BudgetTracker({ kols, budget, setBudget }) {
  const [editing, setEditing] = useState(false)
  const [tempBudget, setTempBudget] = useState(budget)

  const spent = kols
    .filter(k => k.status === 'ตกลงแล้ว')
    .reduce((sum, k) => sum + (parseFloat(k.feeAgreed) || 0), 0)

  const remaining = budget - spent
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0
  const isRed = pct > 90

  const fmt = (n) => new Intl.NumberFormat('th-TH').format(n)

  return (
    <div className="kol-card mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-heading font-semibold text-white">งบประมาณ</h2>
        <button
          onClick={() => { setTempBudget(budget); setEditing(e => !e) }}
          className="text-xs text-accent hover:underline"
        >
          {editing ? 'ยกเลิก' : 'แก้ไข'}
        </button>
      </div>

      {editing && (
        <div className="flex gap-2 mb-3">
          <input
            type="number"
            value={tempBudget}
            onChange={e => setTempBudget(+e.target.value)}
            className="kol-input w-40"
          />
          <button
            onClick={() => { setBudget(tempBudget); setEditing(false) }}
            className="btn-accent text-xs"
          >
            บันทึก
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-3">
        <div>
          <p className="text-xs text-gray-400 mb-1">งบทั้งหมด</p>
          <p className="font-heading font-semibold text-white">฿{fmt(budget)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">ใช้ไปแล้ว</p>
          <p className={`font-heading font-semibold ${isRed ? 'text-red-400' : 'text-accent'}`}>
            ฿{fmt(spent)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">คงเหลือ</p>
          <p className={`font-heading font-semibold ${remaining < 0 ? 'text-red-400' : 'text-green-400'}`}>
            ฿{fmt(remaining)}
          </p>
        </div>
      </div>

      <div className="w-full bg-gray-800 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${isRed ? 'bg-red-500' : 'bg-accent'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">{pct.toFixed(1)}% ของงบ</p>
    </div>
  )
}
