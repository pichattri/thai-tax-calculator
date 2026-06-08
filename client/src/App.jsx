import { useState, useEffect, useCallback } from 'react'
import { fetchKOLs, createKOL, updateKOL, deleteKOL } from './api'
import PRView from './components/PRView'
import PlanningView from './components/PlanningView'
import RequestForm from './components/RequestForm'

export default function App() {
  const [view, setView] = useState('request')
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
    { id: 'request', label: '📋 แจ้ง KOL' },
    { id: 'pr', label: 'ทีม PR' },
    { id: 'planning', label: 'Planning' },
  ]

  return (
    <div className="min-h-screen bg-navy">
      {/* Nav */}
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
                onClick={() => setView(t.id)}
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
    </div>
  )
}
