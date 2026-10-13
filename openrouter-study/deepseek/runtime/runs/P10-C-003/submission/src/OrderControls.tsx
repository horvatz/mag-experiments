import { ArrowDown, ArrowUp } from 'lucide-react'

export function MoveButtons({ id, canUp, canDown, onUp, onDown }: {
  id: string
  canUp: boolean
  canDown: boolean
  onUp: () => void
  onDown: () => void
}) {
  return <span className="move-buttons">
    <button type="button" className="order-button" aria-label={`Premakni ${id} gor`} disabled={!canUp} onClick={onUp}><ArrowUp size={14} strokeWidth={1.8} aria-hidden="true" /></button>
    <button type="button" className="order-button" aria-label={`Premakni ${id} dol`} disabled={!canDown} onClick={onDown}><ArrowDown size={14} strokeWidth={1.8} aria-hidden="true" /></button>
  </span>
}

export function HistoryControls({ undoCount, redoCount, canReset, onUndo, onRedo, onReset }: {
  undoCount: number
  redoCount: number
  canReset: boolean
  onUndo: () => void
  onRedo: () => void
  onReset: () => void
}) {
  return <div className="history-controls">
    <button type="button" className="button order-action" disabled={undoCount === 0} onClick={onUndo}>Razveljavi premik</button>
    <button type="button" className="button order-action" disabled={redoCount === 0} onClick={onRedo}>Ponovi premik</button>
    <button type="button" className="button order-action" disabled={!canReset} onClick={onReset}>Začetni vrstni red</button>
    <p className="order-status" role="status" aria-label="Zgodovina vrstnega reda">Razveljavitve: {undoCount}. Ponovitve: {redoCount}.</p>
  </div>
}
