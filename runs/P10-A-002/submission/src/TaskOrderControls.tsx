import { ArrowDown, ArrowUp, Redo2, RotateCcw, Undo2 } from 'lucide-react'
import type { Dispatch } from 'react'
import { isInitialOrder, type TaskOrderAction, type TaskOrderState } from './taskOrder.ts'

export type MoveTask = (id: string, direction: -1 | 1) => void

export function TaskMoveControls({ id, position, total, onMove }: {
  id: string; position: number; total: number; onMove: MoveTask
}) {
  return <div className="task-move-controls">
    <span className="task-position" aria-label={`Mesto opravila ${id}`}>{position}</span>
    <button type="button" className="move-button" aria-label={`Premakni ${id} gor`} title={`Premakni ${id} gor`} disabled={position === 1} onClick={() => onMove(id, -1)}><ArrowUp size={15} aria-hidden="true" /></button>
    <button type="button" className="move-button" aria-label={`Premakni ${id} dol`} title={`Premakni ${id} dol`} disabled={position === total} onClick={() => onMove(id, 1)}><ArrowDown size={15} aria-hidden="true" /></button>
  </div>
}

export function OrderHistoryControls({ state, dispatch }: { state: TaskOrderState; dispatch: Dispatch<TaskOrderAction> }) {
  return <div className="order-toolbar">
    <div className="order-actions" role="group" aria-label="Urejanje vrstnega reda">
      <button type="button" className="button" disabled={state.undo.length === 0} onClick={() => dispatch({ type: 'undo' })}><Undo2 size={15} aria-hidden="true" />Razveljavi premik</button>
      <button type="button" className="button" disabled={state.redo.length === 0} onClick={() => dispatch({ type: 'redo' })}><Redo2 size={15} aria-hidden="true" />Ponovi premik</button>
      <button type="button" className="button" disabled={isInitialOrder(state)} onClick={() => dispatch({ type: 'reset' })}><RotateCcw size={15} aria-hidden="true" />Začetni vrstni red</button>
    </div>
    <p className="order-history" role="status" aria-label="Zgodovina vrstnega reda">Razveljavitve: {state.undo.length}. Ponovitve: {state.redo.length}.</p>
  </div>
}
