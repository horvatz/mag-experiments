export const mutations = [
  {
    "id": "M01",
    "name": "Ranks off by one",
    "scenario": "E01",
    "assertion": "toHaveText",
    "edits": [
      {
        "file": "src/TaskFeature.tsx",
        "from": "{index + 1}</span>",
        "to": "{index + 2}</span>"
      }
    ]
  },
  {
    "id": "M02",
    "name": "Moves skip a neighbor",
    "scenario": "E02",
    "assertion": "toEqual",
    "edits": [
      {
        "file": "src/TaskFeature.tsx",
        "from": "to = from + delta",
        "to": "to = from + delta * 2"
      }
    ]
  },
  {
    "id": "M03",
    "name": "Undo takes oldest state",
    "scenario": "E04",
    "assertion": "toEqual",
    "edits": [
      {
        "file": "src/TaskFeature.tsx",
        "from": "current: previous.undo.at(-1)!",
        "to": "current: previous.undo[0]!"
      }
    ]
  },
  {
    "id": "M04",
    "name": "New branch retains redo",
    "scenario": "E06",
    "assertion": "toHaveText",
    "edits": [
      {
        "file": "src/TaskFeature.tsx",
        "from": "return { current: next, undo: [...previous.undo, previous.current].slice(-20), redo: [] }",
        "to": "return { current: next, undo: [...previous.undo, previous.current].slice(-20), redo: previous.redo }"
      }
    ]
  },
  {
    "id": "M05",
    "name": "History limited to nineteen",
    "scenario": "E07",
    "assertion": "toHaveText",
    "edits": [
      {
        "file": "src/TaskFeature.tsx",
        "from": "return { current: next, undo: [...previous.undo, previous.current].slice(-20), redo: [] }",
        "to": "return { current: next, undo: [...previous.undo, previous.current].slice(-19), redo: [] }"
      }
    ]
  },
  {
    "id": "M06",
    "name": "Reset is not undoable",
    "scenario": "E08",
    "assertion": "toHaveText",
    "edits": [
      {
        "file": "src/TaskFeature.tsx",
        "from": "current: tasks, undo: [...previous.undo, previous.current].slice(-20), redo: []",
        "to": "current: tasks, undo: previous.undo, redo: []"
      }
    ]
  }
]
