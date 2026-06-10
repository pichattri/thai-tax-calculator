import { useState, useEffect, useCallback } from 'react'
import { fetchKOLs, createKOL, updateKOL, deleteKOL } from './api'
import PRView from './components/PRView'
import PlanningView from './components/PlanningView'
import RequestForm from './components/RequestForm'

const PASSWORDS = { pr: 'PRteam', planning: 'Planning' }
const SESSION_KEY = 'mc_auth'

function getAuth() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}') } catch { return {} }
}
function setAuth(view) {
  const a = getAuth(); a[view] = true
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(a))
}

function PasswordModal({ viewLabel, onSuccess, onCancel }) {
  const [input, setInput] = useState('')
  const [wrong, setWrong] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    if (onSuccess(input)) { setWrong(false) }
    else { setWrong(true); setInput('') }
  }

  return (
    <div className="modal-overlay">
      <div className="bg-navy-light rounded-2xl p-8 max-w-sm w-full border border-gray-700 shadow-2xl">
        <div className="w-12 h-12 bg-accent bg-opacity-20 rounded-xl flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔒</span>
        </div>
        <h2 className="font-heading text-xl font-bold text-white text-center mb-1">{viewLabel}</h2>
        <p className="text-gray-400 text-sm text-center mb-6">กรอกรหัสผ่านเพื่อเข้าใช้งาน</p>
        <form onSubmit={submit} className="space-y-3">
          <input
            autoFocus
            type="password"
            value={input}
            onChange={e => { setInput(e.target.value); setWrong(false) }}
            className={`kol-input text-center text-lg tracking-widest ${wrong ? 'border-red-500' : ''}`}
            placeholder="••••••••"
          />
          {wrong && <p className="text-red-400 text-xs text-center">รหัสผ่านไม่ถูกต้อง</p>}
          <button type="submit" className="btn-accent w-full py-2.5">เข้าสู่ระบบ</button>
          <button type="button" onClick={onCancel} className="btn-ghost w-full py-2">ยกเลิก</button>
        </form>
      </div>
    </div>
  )
}

export default function App() {
  const [view, setView] = useState('request')
  const [pendingView, setPendingView] = useState(null)
  const [kols, setKols] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [budget, setBudget] = useState(700000)

  const loadKOLs = useCallback(async () => {
    try {
      const data = await fetchKOLs()
      setKols(data)
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (view !== 'request') loadKOLs()
  }, [view, loadKOLs])

  useEffect(() => {
    if (view !== 'planning') return
    const timer = setInterval(loadKOLs, 30000)
    return () => clearInterval(timer)
  }, [view, loadKOLs])

  const handleTabClick = (tabId) => {
    if (tabId === 'request') { setView('request'); return }
    if (getAuth()[tabId]) { setView(tabId); return }
    setPendingView(tabId)
  }

  const handlePasswordSuccess = (input) => {
    if (input === PASSWORDS[pendingView]) {
      setAuth(pendingView)
      setView(pendingView)
      setPendingView(null)
      return true
    }
    return false
  }

  const handleCreate = async (data) => {
    const created = await createKOL(data)
    setKols(prev => [...prev, created])
    return created
  }

  const handleUpdate = async (id, data) => {
    const updated = await updateKOL(id, data)
    setKols(prev => prev.map(k => k.id === id ? updated : k))
    return updated
  }

  const handleDelete = async (id) => {
    await deleteKOL(id)
    setKols(prev => prev.filter(k => k.id !== id))
  }

  const TABS = [
    { id: 'request', label: '📋 Request CaseReview' },
    { id: 'pr', label: 'ทีม PR' },
    { id: 'planning', label: 'Planning' },
  ]

  return (
    <div className="min-h-screen bg-navy">
      <nav className="bg-navy-light border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <span className="font-heading font-bold text-sm">MC</span>
            </div>
            <span className="font-heading font-semibold text-white text-lg hidden sm:block">
              Mega Clinic KOL
            </span>
          </div>
          <div className="flex bg-navy rounded-xl p-1 border border-gray-700">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => handleTabClick(t.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  view === t.id
                    ? 'bg-accent text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="w-10 flex justify-end">
            {loading && view !== 'request' && (
              <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        </div>
      </nav>

      {error && view !== 'request' && (
        <div className="max-w-screen-xl mx-auto px-4 pt-4">
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-sm">
            เกิดข้อผิดพลาด: {error}
          </div>
        </div>
      )}

      <main className="max-w-screen-xl mx-auto px-4 py-6">
        {view === 'request' && <RequestForm />}
        {view === 'pr' && (
          <PRView
            kols={kols}
            budget={budget}
            setBudget={setBudget}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onRefresh={loadKOLs}
          />
        )}
        {view === 'planning' && (
          <PlanningView
            kols={kols}
            budget={budget}
            onRefresh={loadKOLs}
            loading={loading}
          />
        )}
      </main>

      {pendingView && (
        <PasswordModal
          viewLabel={pendingView === 'pr' ? 'ทีม PR' : 'Planning'}
          onSuccess={handlePasswordSuccess}
          onCancel={() => setPendingView(null)}
        />
      )}
    </div>
  )
}
