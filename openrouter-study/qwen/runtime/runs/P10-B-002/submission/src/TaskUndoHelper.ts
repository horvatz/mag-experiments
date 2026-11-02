
export type UndoState = {
  vrstniRed: string[]
  initialOrder: string[]
  moves: string[][]
  undoMoves: string[][]
  redoMoves: string[][]
}

export function isInitial(current: string[], initial: string[]): boolean {
  return JSON.stringify(current.sort()) === JSON.stringify(initial.sort())
}

export function performUndoMove(state: UndoState): UndoState | null {
  if (state.undoMoves.length === 0) return null
  const previous = state.undoMoves[state.undoMoves.length - 1]
  const current = state.vrstniRed.slice()
  return {
    vrstniRed: previous,
    initialOrder: state.initialOrder,
    moves: [...state.moves.slice(0, -1), current],
    undoMoves: state.undoMoves.slice(0, -1),
    redoMoves: [...state.redoMoves, current],
  }
}

export function performRedoMove(state: UndoState): UndoState | null {
  if (state.redoMoves.length === 0) return null
  const nextOrder = state.redoMoves[state.redoMoves.length - 1]
  const current = state.vrstniRed.slice()
  return {
    vrstniRed: nextOrder,
    initialOrder: state.initialOrder,
    moves: [...state.moves, current],
    undoMoves: [...state.undoMoves, current],
    redoMoves: state.redoMoves.slice(0, -1),
  }
}

export function createResetState(tasks: any[]): UndoState {
  return {
    vrstniRed: [...tasks.map(t => t.id)],
    initialOrder: [...tasks.map(t => t.id)],
    moves: [...[], [...tasks.map(t => t.id)]],
    undoMoves: [],
    redoMoves: [],
  }
}

export function addMoveToHistory(state: UndoState, prevOrder: string[]): UndoState {
  const moves = [...state.moves, prevOrder]
  if (moves.length > MAX_UNDO_MOVES) {
    moves.splice(0, moves.length - MAX_UNDO_MOVES)
  }
  return { ...state, moves }
}
