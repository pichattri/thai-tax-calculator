import { useState } from 'react'
import { createKOL } from '../api'

const PLATFORM_URLS = {
  instagram: u => `https://instagram.com/${u}`,
  facebook: u => `https://facebook.com/${u}`,
  tiktok: u => `https://tiktok.com/@${u}`,
  lemon8: u => `https://www.lemon8-app.com/@${u}`,
}

function buildHyperlink(platformId, raw) {
  const val = raw.trim()
  if (!val) return ''
  const url = val.startsWith('http') ? val : PLATFORM_URLS[platformId](val.replace(/^@/, ''))
  const atMatch = val.startsWith('http') ? val.match(/@([^/?&#]+)/) : null
  const label = atMatch ? `@${atMatch[1]}` : (val.startsWith('@') ? val : `@${val}`)
  return `=HYPERLINK("${url}","${label}")`
}

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

const EMPTY = { instagram: '', facebook: '', tiktok: '', lemon8: '' }

function RadioGroup({ options, value, onChange }) {
  return (
    <div className="space-y-2 mt-1">
      {options.map(o => (
        <label key={o.value} className="flex items-center gap-3 cursor-pointer group" onClick={() => onChange(o.value)}>
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
  const [requester, setRequester] = useState('')
  const [caseName, setCaseName] = useState('')
  const [socials, setSocials] = useState({ ...EMPTY })
  const [followers, setFollowers] = useState({ ...EMPTY })
  const [category, setCategory] = useState('')
  const [purpose, setPurpose] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState(null)

  const setSocial = (id, val) => setSocials(p => ({ ...p, [id]: val }))
  const setFollower = (id, val) => setFollowers(p => ({ ...p, [id]: val }))

  const hasSocial = Object.values(socials).some(v => v.trim())
  const valid = requester.trim() && caseName.trim() && hasSocial && category && purpose.trim()

  const reset = () => {
    setRequester(''); setCaseName(''); setSocials({ ...EMPTY })
    setFollowers({ ...EMPTY }); setCategory(''); setPurpose('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!valid) return
    setSaving(true); setError(null)
    try {
      const filledPlatforms = PLATFORMS.filter(p => socials[p.id].trim())
      const platformStr = filledPlatforms.map(p => p.label).join(', ')
      const contactStr = filledPlatforms.map(p => {
        let s = `${p.label}: ${socials[p.id]}`
        if (followers[p.id]) s += ` (${Number(followers[p.id]).toLocaleString()} followers)`
        return s
      }).join(' | ')
      const totalFollowers = filledPlatforms.reduce((sum, p) => sum + (parseInt(followers[p.id]) || 0), 0)

      await createKOL({
        name: caseName.trim(),
        platform: platformStr,
        followers: totalFollowers || '',
        contact: contactStr,
        category,
        purpose: purpose.trim(),
        requester: requester.trim(),
        igAccount: socials.instagram,
        fbAccount: socials.facebook,
        tiktokAccount: socials.tiktok,
        lemon8Account: socials.lemon8,
        igFollowers: followers.instagram,
        fbFollowers: followers.facebook,
        tiktokFollowers: followers.tiktok,
        lemon8Followers: followers.lemon8,
        igLink: buildHyperlink('instagram', socials.instagram),
        fbLink: buildHyperlink('facebook', socials.facebook),
        tiktokLink: buildHyperlink('tiktok', socials.tiktok),
        lemon8Link: buildHyperlink('lemon8', socials.lemon8),
        status: 'แจ้งเข้ามา',
        type: 'Tier1',
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
        <h1 className="font-heading text-2xl font-bold text-white mb-1">Request CaseReview</h1>
        <p className="text-gray-400 text-sm">กรอกข้อมูลเพื่อให้ทีม PR ติดต่อ KOL ให้</p>
      </div>

      <form onSubmit={handleSubmit} className="kol-card space-y-6">

        {/* ชื่อผู้ขอ */}
        <div>
          <label className="kol-label">ชื่อผู้ขอ *</label>
          <input
            value={requester}
            onChange={e => setRequester(e.target.value)}
            className="kol-input"
            placeholder="เช่น คุณนิค ทีม Marketing"
            required
          />
        </div>

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

        {/* Social Media */}
        <div>
          <label className="kol-label mb-2">
            ช่องทาง Social Media
            <span className="text-gray-600 ml-1">(กรอกอย่างน้อย 1 ช่องทาง *)</span>
          </label>
          <div className="space-y-3">
            {PLATFORMS.map(p => (
              <div key={p.id} className="bg-navy rounded-xl p-3 border border-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <span>{p.icon}</span>
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
        </div>

        {/* หมวดหมู่ */}
        <div>
          <label className="kol-label">หมวดหมู่ *</label>
          <RadioGroup options={CATEGORIES} value={category} onChange={setCategory} />
        </div>

        {/* จุดประสงค์ */}
        <div>
          <label className="kol-label">จุดประสงค์ในการขอเคส *</label>
          <textarea
            value={purpose}
            onChange={e => setPurpose(e.target.value)}
            className="kol-input h-24 resize-none"
            placeholder="เช่น โปรโมทแคมเปญ Filler ช่วง Q3, ต้องการ KOL สายความงามที่มีฐานแฟน 25-35 ปี"
          />
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
