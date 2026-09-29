import type { Dispatch } from 'react'
import { ArrowDown, ArrowUp, Redo2, RotateCcw, Undo2 } from 'lucide-react'
import { isInitialOrder, type TaskOrderAction, type TaskOrderState } from './taskOrder.ts'

export function TaskMoveControls({ id, position, total, onMove }: {
  id: string
  position: number
  total: number
  onMove: (id: string, direction: -1 | 1) => void
}) {
  return <div className="task-order-controls">
    <span className="task-position" aria-label={`Mesto opravila ${id}`}>{position}</span>
    <button type="button" aria-label={`Premakni ${id} gor`} disabled={position <= 1} onClick={() => onMove(id, -1)}><ArrowUp size={14} aria-hidden="true" /></button>
    <button type="button" aria-label={`Premakni ${id} dol`} disabled={position >= total} onClick={() => onMove(id, 1)}><ArrowDown size={14} aria-hidden="true" /></button>
  </div>
}

export function TaskOrderHistory({ state, dispatch }: { state: TaskOrderState; dispatch: Dispatch<TaskOrderAction> }) {
  return <div className="order-history">
    <div className="order-actions">
      <button type="button" className="button" disabled={state.past.length === 0} onClick={() => dispatch({ type: 'undo' })}><Undo2 size={14} aria-hidden="true" />Razveljavi premik</button>
      <button type="button" className="button" disabled={state.future.length === 0} onClick={() => dispatch({ type: 'redo' })}><Redo2 size={14} aria-hidden="true" />Ponovi premik</button>
      <button type="button" className="button" disabled={isInitialOrder(state)} onClick={() => dispatch({ type: 'reset' })}><RotateCcw size={14} aria-hidden="true" />Začetni vrstni red</button>
    </div>
    <span role="status" aria-label="Zgodovina vrstnega reda">Razveljavitve: {state.past.length}. Ponovitve: {state.future.length}.</span>
  </div>
}
