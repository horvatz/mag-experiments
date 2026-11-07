export const mutations = [
  {
    "id": "M01",
    "name": "Wrong initial date",
    "scenario": "E01",
    "assertion": "toHaveValue",
    "edits": [
      {
        "file": "src/TaskFeature.tsx",
        "from": "useState('2026-09-21'), [anchor, setAnchor] = useState('2026-09-21')",
        "to": "useState('2026-09-22'), [anchor, setAnchor] = useState('2026-09-22')"
      }
    ]
  },
  {
    "id": "M02",
    "name": "Completed tasks treated as open",
    "scenario": "E02",
    "assertion": "toEqual",
    "edits": [
      {
        "file": "src/TaskFeature.tsx",
        "from": "if (task.status === 'done') return 'done'",
        "to": "if (task.status === 'done' && false) return 'done'"
      }
    ]
  },
  {
    "id": "M03",
    "name": "Today treated as overdue",
    "scenario": "E03",
    "assertion": "toEqual",
    "edits": [
      {
        "file": "src/TaskFeature.tsx",
        "from": "task.dueDate < anchor",
        "to": "task.dueDate <= anchor"
      }
    ]
  },
  {
    "id": "M04",
    "name": "Seventh day excluded",
    "scenario": "E04",
    "assertion": "toEqual",
    "edits": [
      {
        "file": "src/TaskFeature.tsx",
        "from": "task.dueDate <= last ? 'week' : 'later'",
        "to": "task.dueDate < last ? 'week' : 'later'"
      }
    ]
  },
  {
    "id": "M05",
    "name": "Week has only six days",
    "scenario": "E05",
    "assertion": "toEqual",
    "edits": [
      {
        "file": "src/TaskFeature.tsx",
        "from": "7 * 86400000",
        "to": "6 * 86400000"
      }
    ]
  },
  {
    "id": "M06",
    "name": "Counters count only todo tasks",
    "scenario": "E06",
    "assertion": "toHaveText",
    "edits": [
      {
        "file": "src/TaskFeature.tsx",
        "from": "tasks.filter(task => bucket(task, anchor) === key).length",
        "to": "tasks.filter(task => task.status === 'todo' && bucket(task, anchor) === key).length"
      }
    ]
  }
]
