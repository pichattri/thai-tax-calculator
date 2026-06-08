export function calcKQS(fields) {
  const sr = parseFloat(fields.saveRate) || 0
  const cq = parseFloat(fields.commentQuality) || 0
  const er = parseFloat(fields.engagementRate) || 0
  const age = parseFloat(fields.audienceAge) || 0
  const fem = parseFloat(fields.audienceFemale) || 0
  const con = parseFloat(fields.contentRelevance) || 0
  const tru = parseFloat(fields.trustSignal) || 0

  const sSr = sr >= 2 ? 10 : sr >= 1 ? 7 : sr >= 0.5 ? 4 : 1
  const sCq = cq >= 8 ? 10 : cq >= 5 ? 6 : cq >= 3 ? 3 : 1
  const sEr = er >= 3 ? 10 : er >= 1 ? 6 : er >= 0.5 ? 3 : 1
  const sAge = age >= 60 ? 10 : age >= 40 ? 6 : age >= 20 ? 3 : 1
  const sFem = fem >= 70 ? 10 : fem >= 50 ? 6 : fem >= 30 ? 3 : 1
  const sCon = con >= 8 ? 10 : con >= 5 ? 6 : con >= 3 ? 3 : 1
  const sTru = tru >= 8 ? 10 : tru >= 5 ? 6 : tru >= 3 ? 3 : 1

  const kqs = (sSr * 0.25 + sCq * 0.20 + sEr * 0.15 + sAge * 0.15 + sFem * 0.10 + sCon * 0.10 + sTru * 0.05) * 10
  const rounded = Math.round(kqs * 10) / 10
  const result = rounded >= 75 ? '✅ ผ่าน' : rounded >= 60 ? '⚠️ พิจารณา' : '❌ ไม่ผ่าน'

  return {
    kqs: rounded,
    result,
    breakdown: [
      { label: 'Save Rate', raw: sr, score: sSr, weight: 0.25, weighted: +(sSr * 0.25).toFixed(3) },
      { label: 'Comment Quality', raw: cq, score: sCq, weight: 0.20, weighted: +(sCq * 0.20).toFixed(3) },
      { label: 'Engagement Rate', raw: er, score: sEr, weight: 0.15, weighted: +(sEr * 0.15).toFixed(3) },
      { label: 'Audience อายุ 25-40', raw: age, score: sAge, weight: 0.15, weighted: +(sAge * 0.15).toFixed(3) },
      { label: 'Audience เพศหญิง', raw: fem, score: sFem, weight: 0.10, weighted: +(sFem * 0.10).toFixed(3) },
      { label: 'Content Relevance', raw: con, score: sCon, weight: 0.10, weighted: +(sCon * 0.10).toFixed(3) },
      { label: 'Trust Signal', raw: tru, score: sTru, weight: 0.05, weighted: +(sTru * 0.05).toFixed(3) },
    ]
  }
}

export function getResultBadgeClass(result) {
  if (!result) return ''
  if (result.includes('ผ่าน') && !result.includes('ไม่')) return 'badge-pass'
  if (result.includes('พิจารณา')) return 'badge-consider'
  return 'badge-fail'
}

export function getStatusColor(status) {
  const map = {
    'แจ้งเข้ามา': 'text-purple-400',
    'ยังไม่ติดต่อ': 'text-gray-400',
    'ติดต่อแล้ว': 'text-blue-400',
    'รอ Insight': 'text-yellow-400',
    'ตกลงแล้ว': 'text-green-400',
    'ปฏิเสธ': 'text-red-400',
  }
  return map[status] || 'text-gray-400'
}

export function daysSince(isoString) {
  if (!isoString) return 0
  return Math.floor((Date.now() - new Date(isoString).getTime()) / 86400000)
}
