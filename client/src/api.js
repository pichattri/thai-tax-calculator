const BASE = '/api'

export async function fetchKOLs() {
  const res = await fetch(`${BASE}/kols`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function createKOL(data) {
  const res = await fetch(`${BASE}/kols`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function updateKOL(id, data) {
  const res = await fetch(`${BASE}/kols/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function deleteKOL(id) {
  const res = await fetch(`${BASE}/kols/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
