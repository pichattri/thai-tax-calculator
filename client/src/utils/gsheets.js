// Browser-side Google Sheets API using Service Account JWT auth
const SPREADSHEET_ID = '1CCjq_7liQn3c0VYAGCQu68CWjuTkkAJrevfAwWhMsEY'
const SHEET_NAME = 'KOLs'

const CREDS = {
  client_email: 'megaclinic-kol@divine-command-498210-j1.iam.gserviceaccount.com',
  private_key: `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC/7XKEAHuVACuj
BBl+QHuII5LtNVclC5PFnpivzt2Ba06vVKmGpKRQR3zQF+RWncMjo00Oxk3Hnrgr
9cOO4bv9Qn7NVGHpKaBnhkeIgILoJ0wQRuy44r3cHSKVxmgkcUlyXabv6c8ZDbG7
+odJeTLI4eRh80i3Gn7WdC3IM+gHGhKzD/aBdZGOTIM3gbFGEMcUclunh3LVChKc
5n8nYM0bDgw+WscDIuW1rQmbBYfQjln6m8UMiSuFA8sTrJvnAIHQVqagVDwQ23oy
k46Vtm1A/i8uTDR2xRqRFhxPOEQSf09kJiwohE5yDf9e7KUmhEdHMQLEA8BddtVo
+yLgPKLfAgMBAAECggEAQzJd6USIADuOi6U4TcFC3v/hhcaqq7A5fTPRbqBlYlYR
NwbT0e3cD7VvyCXNTtwugdA/fwBEJDN4dP+3h9OV745z+ezk2O83l3dmnS6tZp23
nm1OnU7ZvXK/9KOCO9wkJHQQqif41+M5CsEk078o3jdksDyvBViz9t63VsSBpNZK
fXm+QbLVVAOKEK6vq/YEfee3hoXYOtyz9ARZERqFpU7xWenUobTKucwEzOBpCvMx
9mnAGIVKXweV3x7RUxXKYr6054pvU5yQHwMFlu77WHCdBrlrINB4+D1vziG9xO6t
lHnZi5t7NTh3+rByy5NX6WuTm2gCiTb15wx5nvW9mQKBgQD28YXdkG1MY+Jc6zB2
waEbOaoK4+sxl2Lc8rL+H9ZbGpztJFJbdG6WXoM+Kmm0YRhIcn/CP8P6LuGBTLO2
9gr2SHbi59cU6FUimk/AZrMA+hba0zgFQiOTmCtFEgwvzJB/a/t06N/AbHj6BhIK
BFUAHjy8FFg5Bx0U0QfnBnpntwKBgQDG92WKEqcMhLP+/W93IBmw/7FSaxC39uFb
ENi8gd0e22ZrltfA3MrJRHHjqaENxrdo4KuYHWb6zyt0ZOmSKfbC73WCqYSlcq+M
J2rGdUArREmtftN552ExjCCzN93XvVhvMWcDTMYtlcs62orOf996hIep5h1AVRy6
fwhaE0eOGQKBgQDD/w5wvKEDcIPJnCHrH+Pu5+W+nwedZLpjA35tlHdd99F1ps53
KAJd9sXUIXWkZSwQ1E/yrQmvGGaDaY16Oe6ZawpxLfHX9k8cF74Ux25r6BMbu2lL
QyNZkf1F5P0nMwW9HMeIEw0EfRPH3emTabzNSzKJVNxw5uR+ESpkgw/EIQKBgQCV
JxbGV89EkiKA76nkqnq39iYOu9YvonIzm0BuqAeEP0LbOpwIpzuZf6bE3P+v3RzX
ET1xbfEp6a4QtilmefDTF0GHLt8STBQPQ+lGVtVA2hNFbULJKsvwobRNxX6XYQjv
aiBoF+CkgZt1RikyPifgp4MvuSKKfINpxxsSs0s72QKBgHxQR4dnjqhqnTF5PzrV
c56byE20+mwI0vpWXQ1wzZtJ56bMCLTMxzUS/x2ungf1h8SyPm9ZYSLZvL3G4Px+
M9juLEHBZAGVDM+klOzZ45PbaG49vlKmmXhloRGPodf7oR758GDABdEB1ftykpQo
XVvgAVZqFuwYZwXzAhxQ4raZ
-----END PRIVATE KEY-----`,
}

const HEADERS = [
  'id','name','platform','type','category','conditions',
  'followers','feeSet','feeAgreed','contact','tags','month',
  'note','status','saveRate','commentQuality','engagementRate',
  'audienceAge','audienceFemale','contentRelevance','trustSignal',
  'kqsScore','kqsResult','createdAt','updatedAt','statusUpdatedAt',
  'ageGroup','requester'
]

// ---- JWT helpers ----
function b64url(data) {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : new Uint8Array(data)
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function pemToDer(pem) {
  const b64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s/g, '')
  const bin = atob(b64)
  const arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
  return arr.buffer
}

let _token = null
let _tokenExp = 0

async function getAccessToken() {
  if (_token && Date.now() < _tokenExp) return _token
  const now = Math.floor(Date.now() / 1000)
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const payload = b64url(JSON.stringify({
    iss: CREDS.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600, iat: now,
  }))
  const signing = `${header}.${payload}`
  const key = await crypto.subtle.importKey(
    'pkcs8', pemToDer(CREDS.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(signing))
  const jwt = `${signing}.${b64url(sig)}`
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  })
  const data = await res.json()
  if (!data.access_token) throw new Error(JSON.stringify(data))
  _token = data.access_token
  _tokenExp = Date.now() + (data.expires_in - 60) * 1000
  return _token
}

async function sheetsGet(range) {
  const token = await getAccessToken()
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

async function sheetsUpdate(range, values) {
  const token = await getAccessToken()
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=RAW`
  const res = await fetch(url, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

async function sheetsAppend(values) {
  const token = await getAccessToken()
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(SHEET_NAME + '!A:Z')}:append?valueInputOption=RAW`
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

async function sheetsBatchUpdate(requests) {
  const token = await getAccessToken()
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}:batchUpdate`
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ requests }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

async function getSheetId() {
  const token = await getAccessToken()
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?fields=sheets.properties`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  const data = await res.json()
  const sheet = data.sheets?.find(s => s.properties.title === SHEET_NAME)
  return sheet?.properties?.sheetId
}

// ---- Ensure sheet + headers ----
async function ensureSheet() {
  const token = await getAccessToken()
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?fields=sheets.properties`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  const data = await res.json()
  const exists = data.sheets?.some(s => s.properties.title === SHEET_NAME)
  if (!exists) {
    await sheetsBatchUpdate([{ addSheet: { properties: { title: SHEET_NAME } } }])
  }
  // Ensure headers
  const hRes = await sheetsGet(`${SHEET_NAME}!A1:Z1`)
  const firstRow = (hRes.values || [])[0] || []
  if (firstRow[0] !== 'id') {
    await sheetsUpdate(`${SHEET_NAME}!A1`, [HEADERS])
  }
}

async function getAllRows() {
  const res = await sheetsGet(`${SHEET_NAME}!A:Z`)
  const rows = res.values || []
  if (rows.length <= 1) return []
  const hdrs = rows[0]
  return rows.slice(1).map((row, idx) => {
    const obj = { _rowIndex: idx + 2 }
    hdrs.forEach((h, i) => { obj[h] = row[i] !== undefined ? row[i] : '' })
    return obj
  }).filter(r => r.id)
}

// ---- Public API ----
export async function fetchKOLs() {
  await ensureSheet()
  const rows = await getAllRows()
  return rows.map(({ _rowIndex, ...k }) => k)
}

export async function createKOL(data) {
  await ensureSheet()
  const now = new Date().toISOString()
  const kol = {
    id: crypto.randomUUID(),
    ...data,
    createdAt: now, updatedAt: now, statusUpdatedAt: now,
  }
  const row = HEADERS.map(h => kol[h] !== undefined ? String(kol[h]) : '')
  await sheetsAppend([row])
  return kol
}

export async function updateKOL(id, data) {
  await ensureSheet()
  const rows = await getAllRows()
  const kol = rows.find(k => k.id === id)
  if (!kol) throw new Error('Not found')
  const now = new Date().toISOString()
  const statusChanged = data.status && data.status !== kol.status
  const updated = {
    ...kol, ...data,
    id: kol.id, createdAt: kol.createdAt, updatedAt: now,
    statusUpdatedAt: statusChanged ? now : (kol.statusUpdatedAt || kol.createdAt),
  }
  const rowIdx = updated._rowIndex
  delete updated._rowIndex
  const row = HEADERS.map(h => updated[h] !== undefined ? String(updated[h]) : '')
  await sheetsUpdate(`${SHEET_NAME}!A${rowIdx}:Z${rowIdx}`, [row])
  return updated
}

export async function deleteKOL(id) {
  await ensureSheet()
  const rows = await getAllRows()
  const kol = rows.find(k => k.id === id)
  if (!kol) throw new Error('Not found')
  const sheetId = await getSheetId()
  await sheetsBatchUpdate([{
    deleteDimension: {
      range: { sheetId, dimension: 'ROWS', startIndex: kol._rowIndex - 1, endIndex: kol._rowIndex }
    }
  }])
  return { success: true }
}
