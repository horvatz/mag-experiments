import type { OrderDirection, TaskOrderState } from './taskOrder.ts'

export function TaskOrderActions({
  taskId,
  index,
  total,
  onMove,
}: {
  taskId: string
  index: number
  total: number
  onMove: (taskId: string, direction: OrderDirection) => void
}) {
  return <div className="task-order-actions">
    <span className="task-position" aria-label={`Mesto opravila ${taskId}`}>{index + 1}</span>
    <button type="button" onClick={() => onMove(taskId, 'up')} disabled={index === 0} aria-label={`Premakni ${taskId} gor`}>Gor</button>
    <button type="button" onClick={() => onMove(taskId, 'down')} disabled={index === total - 1} aria-label={`Premakni ${taskId} dol`}>Dol</button>
  </div>
}

export function TaskOrderHistory({ state, initialIds, dispatch }: {
  state: TaskOrderState | null
  initialIds: string[]
  dispatch: (action: { type: 'undo' | 'redo' | 'reset'; initialIds: string[] }) => void
}) {
  const undoCount = state?.undo.length ?? 0
  const redoCount = state?.redo.length ?? 0
  const order = state?.order ?? initialIds
  const isInitial = order.length === initialIds.length && order.every((id, index) => id === initialIds[index])

  return <div className="order-toolbar">
    <div className="order-buttons">
      <button type="button" className="order-button" onClick={() => dispatch({ type: 'undo', initialIds })} disabled={undoCount === 0}>Razveljavi premik</button>
      <button type="button" className="order-button" onClick={() => dispatch({ type: 'redo', initialIds })} disabled={redoCount === 0}>Ponovi premik</button>
      <button type="button" className="order-button" onClick={() => dispatch({ type: 'reset', initialIds })} disabled={isInitial}>Začetni vrstni red</button>
    </div>
    <span className="order-history" role="status" aria-label="Zgodovina vrstnega reda">Razveljavitve: {undoCount}. Ponovitve: {redoCount}.</span>
  </div>
}
