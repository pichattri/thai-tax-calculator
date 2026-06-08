import { useState } from 'react'
import { createKOL } from '../api'

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: '📸' },
  { id: 'facebook', label: 'Facebook', icon: '👤' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵' },
  { id: 'lemon8', label: 'Lemon8', icon: '🍋' },
]

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

const EMPTY_SOCIALS = { instagram: '', facebook: '', tiktok: '', lemon8: '' }
const EMPTY_FOLLOWERS = { instagram: '', facebook: '', tiktok: '', lemon8: '' }

function RadioGroup({ options, value, onChange }) {
  return (
    <div className="space-y-2 mt-1">
      {options.map(o => (
        <label key={o.value} className="flex items-center gap-3 cursor-pointer group">
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
            value === o.value ? 'border-accent bg-accent' : 'border-gray-600 group-hover:border-gray-400'
          }`}>
            {value === o.value && <div className="w-2 h-2 rounded-full bg-white" />}
          </div>
          <span className={`text-sm ${value === o.value ? 'text-white' : 'text-gray-400'}`}>{o.label}</span>
        </label>
      ))}
    </div>
  )
}

export default function RequestForm() {
  const [caseName, setCaseName] = useState('')
  const [socials, setSocials] = useState({ ...EMPTY_SOCIALS })
  const [followers, setFollowers] = useState({ ...EMPTY_FOLLOWERS })
  const [category, setCategory] = useState('')
  const [ageGroup, setAgeGroup] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState(null)

  const setSocial = (id, val) => setSocials(p => ({ ...p, [id]: val }))
  const setFollower = (id, val) => setFollowers(p => ({ ...p, [id]: val }))

  const hasSocial = Object.values(socials).some(v => v.trim())
  const valid = caseName.trim() && hasSocial && category && ageGroup

  const reset = () => {
    setCaseName(''); setSocials({ ...EMPTY_SOCIALS })
    setFollowers({ ...EMPTY_FOLLOWERS }); setCategory(''); setAgeGroup('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!valid) return
    setSaving(true); setError(null)
    try {
      // Build platform list and contact string from filled socials
      const filledPlatforms = PLATFORMS.filter(p => socials[p.id].trim())
      const platformStr = filledPlatforms.map(p => p.label).join(', ')
      const contactStr = filledPlatforms
        .map(p => `${p.label}: ${socials[p.id]}${followers[p.id] ? ` (${Number(followers[p.id]).toLocaleString()} followers)` : ''}`)
        .join(' | ')
      const totalFollowers = filledPlatforms.reduce((sum, p) => sum + (parseInt(followers[p.id]) || 0), 0)

      await createKOL({
        name: caseName.trim(),
        platform: platformStr,
        followers: totalFollowers || '',
        contact: contactStr,
        category,
        ageGroup,
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
        <button onClick={() => { setDone(false); reset() }} className="btn-accent">
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

      <form onSubmit={handleSubmit} className="kol-card space-y-6">

        {/* ชื่อเคส */}
        <div>
          <label className="kol-label">ชื่อเคส / ชื่อ KOL *</label>
          <input
            value={caseName}
            onChange={e => setCaseName(e.target.value)}
            className="kol-input"
            placeholder="เช่น คุณแนท หรือ @beauty_kol"
            required
          />
        </div>

        {/* Social Media — ทุกช่องทาง */}
        <div>
          <label className="kol-label mb-2">
            ช่องทาง Social Media
            <span className="text-gray-600 ml-1">(กรอกอย่างน้อย 1 ช่องทาง *)</span>
          </label>
          <div className="space-y-3">
            {PLATFORMS.map(p => (
              <div key={p.id} className="bg-navy rounded-xl p-3 border border-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">{p.icon}</span>
                  <span className="text-sm font-medium text-gray-300">{p.label}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={socials[p.id]}
                    onChange={e => setSocial(p.id, e.target.value)}
                    className="kol-input text-xs"
                    placeholder="@username หรือ link"
                  />
                  <input
                    type="number"
                    value={followers[p.id]}
                    onChange={e => setFollower(p.id, e.target.value)}
                    className="kol-input text-xs"
                    placeholder="จำนวน followers"
                  />
                </div>
              </div>
            ))}
          </div>
          {!hasSocial && (
            <p className="text-xs text-gray-600 mt-1">กรุณากรอกอย่างน้อย 1 ช่องทาง</p>
          )}
        </div>

        {/* หมวดหมู่ */}
        <div>
          <label className="kol-label">หมวดหมู่ *</label>
          <RadioGroup options={CATEGORIES} value={category} onChange={setCategory} />
        </div>

        {/* Age Group */}
        <div>
          <label className="kol-label">กลุ่มอายุ Audience *</label>
          <RadioGroup options={AGE_GROUPS} value={ageGroup} onChange={setAgeGroup} />
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
