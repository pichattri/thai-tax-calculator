import { useState } from 'react'
import KOLForm from './KOLForm'
import KOLList from './KOLList'
import BudgetTracker from './BudgetTracker'
import AlertsBanner from './AlertsBanner'

export default function PRView({ kols, budget, setBudget, onCreate, onUpdate, onDelete, onRefresh }) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  const handleSave = async (data) => {
    if (editing) {
      await onUpdate(editing.id, data)
      setEditing(null)
    } else {
      await onCreate(data)
      setShowForm(false)
    }
  }

  const handleEdit = (kol) => {
    setEditing(kol)
  }

  const handleStatusChange = async (id, status) => {
    await onUpdate(id, { status })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-heading text-2xl font-semibold text-white">ทีม PR</h1>
        <div className="flex gap-2">
          <button onClick={onRefresh} className="btn-ghost text-xs">
            🔄 รีเฟรช
          </button>
          <button onClick={() => setShowForm(true)} className="btn-accent">
            + เพิ่ม KOL
          </button>
        </div>
      </div>

      <AlertsBanner kols={kols} />
      <BudgetTracker kols={kols} budget={budget} setBudget={setBudget} />

      <KOLList
        kols={kols}
        onEdit={handleEdit}
        onDelete={onDelete}
        onStatusChange={handleStatusChange}
      />

      {/* Add Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-box">
            <KOLForm
              onSave={handleSave}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="modal-overlay">
          <div className="modal-box">
            <KOLForm
              initial={editing}
              onSave={handleSave}
              onCancel={() => setEditing(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
