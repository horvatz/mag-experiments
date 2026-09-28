export function OrderControls({ id, index, count, move }: {
  id: string
  index: number
  count: number
  move: (id: string, direction: -1 | 1) => void
}) {
  return <div className="task-order-controls">
    <span className="task-position" aria-label={`Mesto opravila ${id}`}>{index + 1}</span>
    <button type="button" onClick={() => move(id, -1)} disabled={index === 0}>Premakni {id} gor</button>
    <button type="button" onClick={() => move(id, 1)} disabled={index === count - 1}>Premakni {id} dol</button>
  </div>
}
