import { useState, useEffect } from 'react'
import { calcKQS } from '../utils/scoring'

const PLATFORM_DEFS = [
  { id: 'ig',     label: 'Instagram', icon: '📸', accountField: 'igAccount',     followerField: 'igFollowers',     linkField: 'igLink',     buildUrl: u => `https://instagram.com/${u}` },
  { id: 'fb',     label: 'Facebook',  icon: '👤', accountField: 'fbAccount',     followerField: 'fbFollowers',     linkField: 'fbLink',     buildUrl: u => `https://facebook.com/${u}` },
  { id: 'tiktok', label: 'TikTok',    icon: '🎵', accountField: 'tiktokAccount', followerField: 'tiktokFollowers', linkField: 'tiktokLink', buildUrl: u => `https://tiktok.com/@${u}` },
  { id: 'lemon8', label: 'Lemon8',    icon: '🍋', accountField: 'lemon8Account', followerField: 'lemon8Followers', linkField: 'lemon8Link', buildUrl: u => `https://www.lemon8-app.com/@${u}` },
]

const EMPTY = {
  name: '', type: 'Tier1', category: 'คนสวยอยากสวยตาม',
  conditions: '', feeSet: '', feeAgreed: '',
  month: '', note: '', status: 'แจ้งเข้ามา',
  contactDate: '', confirmDate: '', appointmentStatus: '',
  saveRate: '', commentQuality: '', engagementRate: '',
  audienceAge: '', audienceFemale: '', contentRelevance: '', trustSignal: '',
  igAccount: '', fbAccount: '', tiktokAccount: '', lemon8Account: '',
  igFollowers: '', fbFollowers: '', tiktokFollowers: '', lemon8Followers: '',
}

const TYPE_OPTIONS = ['Tier1', 'Tier2', 'Tier3', 'KOC']
const STATUS_OPTIONS = ['แจ้งเข้ามา', 'กำลังติดต่อ', 'รอ Insight', 'ปฏิเสธ', 'ตกลงแล้ว', 'ไม่ผ่านเกณฑ์พิจารณา']
const APPOINTMENT_OPTIONS = ['', 'รอ Approve หัตถการ', 'Approve หัตถการแล้ว', 'ลงนัดหมายวันแล้ว']
const CATEGORY_OPTIONS = ['คนสวยอยากสวยตาม', 'คนดังไวรัล', 'Before-After']

const TOOLTIPS = {
  saveRate: 'Save ÷ Reach × 100 จาก IG/TikTok Insight (ขอ Screenshot จาก KOL)',
  commentQuality: 'เปิด 3–5 โพสต์ล่าสุด: 8–10=ถามราคา/ที่, 5–7=Mix, 1–4=Emoji ล้วน',
  engagementRate: '(Like+Comment) ÷ Follower × 100 หรือใช้ phlanx.com',
  audienceAge: 'บวก % อายุ 25–34 + 35–44 จาก Insight Screenshot',
  audienceFemale: '% Female จาก Insight Screenshot เดียวกับข้อบน',
  contentRelevance: 'ดู Feed 10–15 โพสต์: 8–10=Beauty สม่ำเสมอ, 5–7=มีบ้าง, 1–4=ไม่มีเลย',
  trustSignal: 'ใช้ hypeauditor.com: 8–10=Organic, 5–7=พอใช้, 1–4=มี Fake ชัด',
}

function buildHyperlink(buildUrl, raw) {
  const val = raw?.trim()
  if (!val) return ''
  const url = val.startsWith('http') ? val : buildUrl(val.replace(/^@/, ''))
  const label = val.startsWith('http') ? val : (val.startsWith('@') ? val : `@${val}`)
  return `=HYPERLINK("${url}","${label}")`
}

function Tooltip({ text }) {
  const [show, setShow] = useState(false)
  return (
    <span className="relative inline-block">
      <span className="tooltip-icon" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>ⓘ</span>
      {show && (
        <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1 w-64 bg-gray-900 border border-gray-700 text-gray-300 text-xs rounded-lg p-2 shadow-xl whitespace-normal">
          {text}
        </span>
      )}
    </span>
  )
}

function ScoreField({ label, field, form, onChange, tooltip }) {
  return (
    <div>
      <label className="kol-label flex items-center gap-1">{label} <Tooltip text={tooltip} /></label>
      <input type="number" step="0.1" value={form[field]} onChange={e => onChange(field, e.target.value)} className="kol-input" placeholder="0" />
    </div>
  )
}

export default function KOLForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial ? { ...EMPTY, ...initial } : { ...EMPTY })
  const [saving, setSaving] = useState(false)
  const [kqs, setKqs] = useState(null)

  useEffect(() => {
    const f = form
    if ([f.saveRate, f.commentQuality, f.engagementRate, f.audienceAge,
         f.audienceFemale, f.contentRelevance, f.trustSignal].some(v => v !== '')) {
      setKqs(calcKQS(f))
    } else {
      setKqs(null)
    }
  }, [form.saveRate, form.commentQuality, form.engagementRate,
      form.audienceAge, form.audienceFemale, form.contentRelevance, form.trustSignal])

  const set = (field, val) => setForm(p => ({ ...p, [field]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.category) {
      alert('กรุณากรอก ชื่อ KOL และ หมวดหมู่')
      return
    }
    setSaving(true)
    try {
      const filled = PLATFORM_DEFS.filter(p => form[p.accountField]?.trim())
      const platform = filled.map(p => p.label).join(', ')
      const totalFollowers = PLATFORM_DEFS.reduce((sum, p) => sum + (parseInt(form[p.followerField]) || 0), 0)
      const contact = filled.map(p => {
        let s = `${p.label}: ${form[p.accountField]}`
        if (form[p.followerField]) s += ` (${Number(form[p.followerField]).toLocaleString()} followers)`
        return s
      }).join(' | ')
      const links = {}
      PLATFORM_DEFS.forEach(p => {
        links[p.linkField] = buildHyperlink(p.buildUrl, form[p.accountField])
      })
      const payload = {
        ...form,
        platform: platform || form.platform || '',
        followers: totalFollowers || form.followers || '',
        contact,
        kqsScore: kqs ? kqs.kqs : '',
        kqsResult: kqs ? kqs.result : '',
        ...links,
      }
      await onSave(payload)
    } finally {
      setSaving(false)
    }
  }

  const kqsColor = kqs
    ? kqs.kqs >= 75 ? 'text-green-400' : kqs.kqs >= 60 ? 'text-yellow-400' : 'text-red-400'
    : 'text-gray-400'

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-semibold text-white">
          {initial ? 'แก้ไข KOL' : 'เพิ่ม KOL ใหม่'}
        </h2>
        <button type="button" onClick={onCancel} className="text-gray-400 hover:text-white text-2xl leading-none">×</button>
      </div>

      {/* Request origin banner */}
      {(form.requester || form.ageGroup) && (
        <div className="bg-accent bg-opacity-10 border border-accent border-opacity-40 rounded-xl px-4 py-3 space-y-1 text-sm">
          {form.requester && (
            <div className="text-gray-400">ผู้ขอ: <span className="text-white font-medium">{form.requester}</span></div>
          )}
          {form.ageGroup && (
            <div className="text-gray-400">กลุ่มอายุผู้ติดตาม: <span className="text-white font-medium">{form.ageGroup}</span></div>
          )}
        </div>
      )}

      {/* ข้อมูลพื้นฐาน */}
      <div>
        <h3 className="font-heading text-sm font-medium text-accent mb-3 uppercase tracking-wide">ข้อมูล KOL</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="sm:col-span-2">
            <label className="kol-label">ชื่อ KOL / Account *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} className="kol-input" required />
          </div>
          <div>
            <label className="kol-label">หมวดหมู่ *</label>
            <select value={form.category} onChange={e => set('category', e.target.value)} className="kol-select" required>
              {CATEGORY_OPTIONS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="kol-label">ประเภท</label>
            <select value={form.type} onChange={e => set('type', e.target.value)} className="kol-select">
              {TYPE_OPTIONS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Platform cards */}
        <div className="space-y-3">
          {PLATFORM_DEFS.map(p => (
            <div key={p.id} className="bg-navy rounded-xl p-3 border border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <span>{p.icon}</span>
                <span className="text-sm font-medium text-gray-300">{p.label}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={form[p.accountField] || ''}
                  onChange={e => set(p.accountField, e.target.value)}
                  className="kol-input text-xs"
                  placeholder="@username หรือ link"
                />
                <input
                  type="number"
                  value={form[p.followerField] || ''}
                  onChange={e => set(p.followerField, e.target.value)}
                  className="kol-input text-xs"
                  placeholder="จำนวน followers"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ข้อมูล PR */}
      <div>
        <h3 className="font-heading text-sm font-medium text-accent mb-3 uppercase tracking-wide">ข้อมูล PR</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="kol-label">สถานะติดต่อ</label>
            <select value={form.status} onChange={e => set('status', e.target.value)} className="kol-select">
              {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="kol-label">สถานะการนัด</label>
            <select value={form.appointmentStatus || ''} onChange={e => set('appointmentStatus', e.target.value)} className="kol-select">
              {APPOINTMENT_OPTIONS.map(s => <option key={s} value={s}>{s || '—'}</option>)}
            </select>
          </div>
          <div>
            <label className="kol-label">วันที่ติดต่อ</label>
            <input type="date" value={form.contactDate || ''} onChange={e => set('contactDate', e.target.value)} className="kol-input" />
          </div>
          <div>
            <label className="kol-label">วันที่คอนเฟิร์ม</label>
            <input type="date" value={form.confirmDate || ''} onChange={e => set('confirmDate', e.target.value)} className="kol-input" />
          </div>
          <div>
            <label className="kol-label">ค่าตัวที่ตั้งไว้ (THB)</label>
            <input type="number" value={form.feeSet} onChange={e => set('feeSet', e.target.value)} className="kol-input" />
          </div>
          <div>
            <label className="kol-label">ค่าตัวที่ตกลงจริง (THB)</label>
            <input type="number" value={form.feeAgreed} onChange={e => set('feeAgreed', e.target.value)} className="kol-input" />
          </div>
          <div>
            <label className="kol-label">เดือนที่ประเมิน</label>
            <input type="month" value={form.month} onChange={e => set('month', e.target.value)} className="kol-input" />
          </div>
          <div className="sm:col-span-2">
            <label className="kol-label">เงื่อนไขการนำมาใช้</label>
            <textarea value={form.conditions} onChange={e => set('conditions', e.target.value)} className="kol-input h-20 resize-none" placeholder="เช่น ต้องโพสต์ใน 7 วัน, ห้ามโปรโมตคู่แข่ง" />
          </div>
          <div className="sm:col-span-2">
            <label className="kol-label">หมายเหตุ</label>
            <textarea value={form.note} onChange={e => set('note', e.target.value)} className="kol-input h-16 resize-none" />
          </div>
        </div>
      </div>

      {/* Insight */}
      <div>
        <h3 className="font-heading text-sm font-medium text-accent mb-3 uppercase tracking-wide">Insight จาก KOL</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <ScoreField label="Save Rate %" field="saveRate" form={form} onChange={set} tooltip={TOOLTIPS.saveRate} />
          <ScoreField label="Comment Quality (1-10)" field="commentQuality" form={form} onChange={set} tooltip={TOOLTIPS.commentQuality} />
          <ScoreField label="Engagement Rate %" field="engagementRate" form={form} onChange={set} tooltip={TOOLTIPS.engagementRate} />
          <ScoreField label="Audience อายุ 25-40 %" field="audienceAge" form={form} onChange={set} tooltip={TOOLTIPS.audienceAge} />
          <ScoreField label="Audience เพศหญิง %" field="audienceFemale" form={form} onChange={set} tooltip={TOOLTIPS.audienceFemale} />
          <ScoreField label="Content Relevance (1-10)" field="contentRelevance" form={form} onChange={set} tooltip={TOOLTIPS.contentRelevance} />
          <ScoreField label="Trust Signal (1-10)" field="trustSignal" form={form} onChange={set} tooltip={TOOLTIPS.trustSignal} />
        </div>

        {kqs && (
          <div className="mt-4 bg-navy rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-4 mb-3">
              <div>
                <p className="text-xs text-gray-400">KQS Score</p>
                <p className={`font-heading text-3xl font-bold ${kqsColor}`}>{kqs.kqs}</p>
              </div>
              <div className={`text-lg font-medium ${kqsColor}`}>{kqs.result}</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-500">
                    <th className="text-left py-1 pr-3">เกณฑ์</th>
                    <th className="text-center pr-3">ค่า</th>
                    <th className="text-center pr-3">คะแนน</th>
                    <th className="text-center pr-3">น้ำหนัก</th>
                    <th className="text-center">Weighted</th>
                  </tr>
                </thead>
                <tbody>
                  {kqs.breakdown.map(b => (
                    <tr key={b.label} className="border-t border-gray-800">
                      <td className="py-1 pr-3 text-gray-300">{b.label}</td>
                      <td className="text-center pr-3 text-white">{b.raw}</td>
                      <td className="text-center pr-3 text-accent">{b.score}</td>
                      <td className="text-center pr-3 text-gray-400">{(b.weight * 100).toFixed(0)}%</td>
                      <td className="text-center text-green-400">{b.weighted}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-accent flex-1">
          {saving ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost">ยกเลิก</button>
      </div>
    </form>
  )
}
