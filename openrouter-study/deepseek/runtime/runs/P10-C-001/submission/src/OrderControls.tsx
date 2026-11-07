import { History, Redo2, RotateCcw, Undo2 } from 'lucide-react'

type OrderControlsProps = {
  undoCount: number
  redoCount: number
  canReset: boolean
  onUndo: () => void
  onRedo: () => void
  onReset: () => void
}

export function OrderControls({ undoCount, redoCount, canReset, onUndo, onRedo, onReset }: OrderControlsProps) {
  return <div className="order-controls">
    <div className="order-buttons" role="group" aria-label="Dejanja vrstnega reda">
      <button type="button" className="order-button" onClick={onUndo} disabled={undoCount === 0}><Undo2 size={15} strokeWidth={1.6} aria-hidden="true" />Razveljavi premik</button>
      <button type="button" className="order-button" onClick={onRedo} disabled={redoCount === 0}><Redo2 size={15} strokeWidth={1.6} aria-hidden="true" />Ponovi premik</button>
      <button type="button" className="order-button" onClick={onReset} disabled={!canReset}><RotateCcw size={15} strokeWidth={1.6} aria-hidden="true" />Začetni vrstni red</button>
    </div>
    <div className="order-history" role="status" aria-label="Zgodovina vrstnega reda">
      <History size={14} strokeWidth={1.6} aria-hidden="true" />
      <span>Razveljavitve: {undoCount}. Ponovitve: {redoCount}.</span>
    </div>
  </div>
}
