
export function canMoveUp(order: string[], id: string): boolean {
  const i = order.indexOf(id)
  return i > 0
}

export function canMoveDown(order: string[], id: string): boolean {
  const i = order.indexOf(id)
  return i < order.length - 1
}

export function moveTask(order: string[], id: string, dir: "up"|"down"): string[] | null {
  const idx = order.indexOf(id)
  if (dir === "up") {
    if (idx <= 0) return null
    const newOrder = [...order]
    const [moved] = newOrder.splice(idx, 1)
    newOrder.splice(idx - 1, 0, moved)
    return newOrder
  }
  if (dir === "down") {
    if (idx >= order.length - 1) return null
    const newOrder = [...order]
    const [moved] = newOrder.splice(idx, 1)
    newOrder.splice(idx + 1, 0, moved)
    return newOrder
  }
  return null
}
