import { useState } from 'react'
import { createKOL } from '../api'

const PLATFORMS = ['Instagram', 'Facebook', 'TikTok', 'Lemon8']
const CATEGORIES = [
  { value: 'คนสวยอยากสวยตาม', label: '1. คนสวย' },
  { value: 'คนดังไวรัล', label: '2. ไวรัล' },
  { value: 'Before-After', label: '3. Before-After' },
]
const AGE_GROUPS = [
  { value: '<28', label: '< 28 ปี' },
  { value: '29-35', label: '29 – 35 ปี' },
  { value: '36-80', label: '36 ปีขึ้นไป' },
]

export default function RequestForm() {
  const [form, setForm] = useState({
    name: '', platform: '', followers: '',
    category: '', ageGroup: '',
  })
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState(null)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const valid = form.name && form.platform && form.category && form.ageGroup

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!valid) return
    setSaving(true)
    setError(null)
    try {
      await createKOL({
        ...form,
        status: 'แจ้งเข้ามา',
        type: 'Micro',
      })
      setDone(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="font-heading text-2xl font-bold text-white mb-2">ส่งข้อมูลเรียบร้อยแล้ว!</h2>
        <p className="text-gray-400 mb-8">ทีม PR จะติดต่อ KOL ให้โดยเร็วที่สุด</p>
        <button
          onClick={() => { setDone(false); setForm({ name: '', platform: '', followers: '', category: '', ageGroup: '' }) }}
          className="btn-accent"
        >
          แจ้งอีกรายการ
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="font-heading text-2xl font-bold text-white mb-1">แจ้งรายชื่อ KOL</h1>
        <p className="text-gray-400 text-sm">กรอกข้อมูลเพื่อให้ทีม PR ติดต่อ KOL ให้</p>
      </div>

      <form onSubmit={handleSubmit} className="kol-card space-y-5">

        {/* ชื่อเคส */}
        <div>
          <label className="kol-label">ชื่อเคส / ชื่อ Account *</label>
          <input
            value={form.name}
            onChange={e => set('name', e.target.value)}
            className="kol-input"
            placeholder="เช่น @beauty_kol หรือ ชื่อ KOL"
            required
          />
        </div>

        {/* Platform */}
        <div>
          <label className="kol-label">ช่องทาง Social Media *</label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {PLATFORMS.map(p => (
              <button
                key={p} type="button"
                onClick={() => set('platform', p)}
                className={`py-2.5 rounded-lg text-sm border transition-all ${
                  form.platform === p
                    ? 'bg-accent border-accent text-white font-medium'
                    : 'border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Followers */}
        <div>
          <label className="kol-label">จำนวนผู้ติดตาม (ประมาณ)</label>
          <input
            type="number"
            value={form.followers}
            onChange={e => set('followers', e.target.value)}
            className="kol-input"
            placeholder="เช่น 50000"
          />
        </div>

        {/* หมวดหมู่ */}
        <div>
          <label className="kol-label">หมวดหมู่ *</label>
          <div className="space-y-2 mt-1">
            {CATEGORIES.map(c => (
              <label key={c.value} className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  form.category === c.value ? 'border-accent bg-accent' : 'border-gray-600 group-hover:border-gray-400'
                }`}>
                  {form.category === c.value && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <input type="radio" className="hidden" value={c.value}
                  checked={form.category === c.value}
                  onChange={() => set('category', c.value)} />
                <span className={`text-sm ${form.category === c.value ? 'text-white' : 'text-gray-400'}`}>
                  {c.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Age Group */}
        <div>
          <label className="kol-label">กลุ่มอายุ Audience *</label>
          <div className="space-y-2 mt-1">
            {AGE_GROUPS.map(a => (
              <label key={a.value} className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  form.ageGroup === a.value ? 'border-accent bg-accent' : 'border-gray-600 group-hover:border-gray-400'
                }`}>
                  {form.ageGroup === a.value && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <input type="radio" className="hidden" value={a.value}
                  checked={form.ageGroup === a.value}
                  onChange={() => set('ageGroup', a.value)} />
                <span className={`text-sm ${form.ageGroup === a.value ? 'text-white' : 'text-gray-400'}`}>
                  {a.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 text-sm px-3 py-2 rounded-lg">
            เกิดข้อผิดพลาด: {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!valid || saving}
          className={`w-full py-3 rounded-xl font-heading font-semibold text-base transition-all ${
            valid && !saving
              ? 'bg-accent hover:bg-accent-dark text-white'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          {saving ? 'กำลังส่ง...' : 'ส่งข้อมูล'}
        </button>
      </form>
    </div>
  )
}
