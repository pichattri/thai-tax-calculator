import { useState, useEffect } from 'react'
import { calcKQS } from '../utils/scoring'

const EMPTY = {
  name: '', platform: 'IG', type: 'Micro', category: 'คนสวยอยากสวยตาม',
  conditions: '', followers: '', feeSet: '', feeAgreed: '', contact: '',
  tags: [], month: '', note: '', status: 'ยังไม่ติดต่อ',
  saveRate: '', commentQuality: '', engagementRate: '',
  audienceAge: '', audienceFemale: '', contentRelevance: '', trustSignal: '',
}

const TAG_OPTIONS = ['Filler', 'Botox', 'Skincare', 'Slimming', 'Hair', 'Other']
const STATUS_OPTIONS = ['ยังไม่ติดต่อ', 'ติดต่อแล้ว', 'รอ Insight', 'ตกลงแล้ว', 'ปฏิเสธ']
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

function Tooltip({ text }) {
  const [show, setShow] = useState(false)
  return (
    <span className="relative inline-block">
      <span
        className="tooltip-icon"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >ⓘ</span>
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
      <label className="kol-label flex items-center gap-1">
        {label} <Tooltip text={tooltip} />
      </label>
      <input
        type="number"
        step="0.1"
        value={form[field]}
        onChange={e => onChange(field, e.target.value)}
        className="kol-input"
        placeholder="0"
      />
    </div>
  )
}

export default function KOLForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial ? { ...EMPTY, ...initial } : { ...EMPTY })
  const [saving, setSaving] = useState(false)
  const [qks, setKqs] = useState(null)

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

  const toggleTag = (tag) => {
    const tags = Array.isArray(form.tags) ? form.tags : (form.tags ? form.tags.split(',').filter(Boolean) : [])
    const next = tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag]
    setForm(p => ({ ...p, tags: next }))
  }

  const getTagsArray = () => {
    if (Array.isArray(form.tags)) return form.tags
    return form.tags ? form.tags.split(',').filter(Boolean) : []
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.category) {
      alert('กรุณากรอก ชื่อ KOL และ หมวดหมู่')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        tags: getTagsArray().join(','),
        kqsScore: qks ? qks.kqs : '',
        kqsResult: qks ? qks.result : '',
      }
      await onSave(payload)
    } finally {
      setSaving(false)
    }
  }

  const kqsColor = qks
    ? qks.kqs >= 75 ? 'text-green-400' : qks.kqs >= 60 ? 'text-yellow-400' : 'text-red-400'
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
      {initial?.requester && (
        <div className="bg-accent bg-opacity-10 border border-accent border-opacity-40 rounded-xl px-4 py-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <span className="text-gray-400">ผู้ขอ: <span className="text-white font-medium">{initial.requester}</span></span>
          {initial.ageGroup && (
            <span className="text-gray-400">กลุ่มอายุ: <span className="text-white font-medium">{initial.ageGroup}</span></span>
          )}
        </div>
      )}

      {/* Basic Info */}
      <div>
        <h3 className="font-heading text-sm font-medium text-accent mb-3 uppercase tracking-wide">ข้อมูลพื้นฐาน</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="kol-label">ชื่อ KOL / Account *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} className="kol-input" required />
          </div>
          <div>
            <label className="kol-label">Platform</label>
            <select value={form.platform} onChange={e => set('platform', e.target.value)} className="kol-select">
              {['Instagram', 'Facebook', 'TikTok', 'Lemon8', 'YouTube'].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="kol-label">ประเภท</label>
            <select value={form.type} onChange={e => set('type', e.target.value)} className="kol-select">
              {['Nano', 'Micro', 'Macro', 'Mega'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="kol-label">หมวดหมู่ KOL *</label>
            <select value={form.category} onChange={e => set('category', e.target.value)} className="kol-select" required>
              {CATEGORY_OPTIONS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="kol-label">สถานะ</label>
            <select value={form.status} onChange={e => set('status', e.target.value)} className="kol-select">
              {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="kol-label">จำนวน Follower</label>
            <input type="number" value={form.followers} onChange={e => set('followers', e.target.value)} className="kol-input" />
          </div>
          <div>
            <label className="kol-label">Contact (LINE / IG / Phone)</label>
            <input value={form.contact} onChange={e => set('contact', e.target.value)} className="kol-input" />
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
            <label className="kol-label">Tag / Category</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {TAG_OPTIONS.map(tag => {
                const active = getTagsArray().includes(tag)
                return (
                  <button
                    key={tag} type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs border transition-all ${
                      active ? 'bg-accent border-accent text-white' : 'border-gray-600 text-gray-400 hover:border-gray-400'
                    }`}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="kol-label">หมายเหตุ / Note</label>
            <textarea value={form.note} onChange={e => set('note', e.target.value)} className="kol-input h-16 resize-none" />
          </div>
        </div>
      </div>

      {/* KOL Scoring */}
      <div>
        <h3 className="font-heading text-sm font-medium text-accent mb-3 uppercase tracking-wide">KOL Scoring</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <ScoreField label="Save Rate %" field="saveRate" form={form} onChange={set} tooltip={TOOLTIPS.saveRate} />
          <ScoreField label="Comment Quality (1-10)" field="commentQuality" form={form} onChange={set} tooltip={TOOLTIPS.commentQuality} />
          <ScoreField label="Engagement Rate %" field="engagementRate" form={form} onChange={set} tooltip={TOOLTIPS.engagementRate} />
          <ScoreField label="Audience อายุ 25-40 %" field="audienceAge" form={form} onChange={set} tooltip={TOOLTIPS.audienceAge} />
          <ScoreField label="Audience เพศหญิง %" field="audienceFemale" form={form} onChange={set} tooltip={TOOLTIPS.audienceFemale} />
          <ScoreField label="Content Relevance (1-10)" field="contentRelevance" form={form} onChange={set} tooltip={TOOLTIPS.contentRelevance} />
          <ScoreField label="Trust Signal (1-10)" field="trustSignal" form={form} onChange={set} tooltip={TOOLTIPS.trustSignal} />
        </div>

        {/* Live KQS */}
        {qks && (
          <div className="mt-4 bg-navy rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-4 mb-3">
              <div>
                <p className="text-xs text-gray-400">KQS Score</p>
                <p className={`font-heading text-3xl font-bold ${kqsColor}`}>{qks.kqs}</p>
              </div>
              <div className={`text-lg font-medium ${kqsColor}`}>{qks.result}</div>
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
                  {qks.breakdown.map(b => (
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
