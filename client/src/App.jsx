import { useState, useEffect, useCallback } from 'react'
import { fetchKOLs, createKOL, updateKOL, deleteKOL } from './api'
import PRView from './components/PRView'
import PlanningView from './components/PlanningView'

export default function App() {
  const [view, setView] = useState('pr')
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

  useEffect(() => { loadKOLs() }, [loadKOLs])

  // Auto-refresh Planning view every 30s
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
            <button
              onClick={() => setView('pr')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                view === 'pr'
                  ? 'bg-accent text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              ทีม PR
            </button>
            <button
              onClick={() => setView('planning')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                view === 'planning'
                  ? 'bg-accent text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Planning
            </button>
          </div>
          <div className="w-24 flex justify-end">
            {loading && (
              <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        </div>
      </nav>

      {error && (
        <div className="max-w-screen-xl mx-auto px-4 pt-4">
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-sm">
            เกิดข้อผิดพลาด: {error}
          </div>
        </div>
      )}

      <main className="max-w-screen-xl mx-auto px-4 py-6">
        {view === 'pr' ? (
          <PRView
            kols={kols}
            budget={budget}
            setBudget={setBudget}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onRefresh={loadKOLs}
          />
        ) : (
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
