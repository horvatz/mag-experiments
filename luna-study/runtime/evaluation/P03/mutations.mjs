export const mutations = [
  {
    "id": "M01",
    "name": "Accent normalization omitted",
    "scenario": "E02",
    "assertion": "toEqual",
    "edits": [
      {
        "file": "src/feature-utils.ts",
        "from": "value.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase()",
        "to": "value.toLowerCase()"
      }
    ]
  },
  {
    "id": "M02",
    "name": "Any token rather than every token",
    "scenario": "E03",
    "assertion": "toEqual",
    "edits": [
      {
        "file": "src/TaskFeature.tsx",
        "from": "words.every(word => text.includes(word))",
        "to": "words.some(word => text.includes(word))"
      }
    ]
  },
  {
    "id": "M03",
    "name": "Inverted status predicate",
    "scenario": "E04",
    "assertion": "toEqual",
    "edits": [
      {
        "file": "src/TaskFeature.tsx",
        "from": "task.status === status",
        "to": "task.status !== status"
      }
    ]
  },
  {
    "id": "M04",
    "name": "Duplicate owner options",
    "scenario": "E05",
    "assertion": "toEqual",
    "edits": [
      {
        "file": "src/TaskFeature.tsx",
        "from": "[...new Set(tasks.map(task => task.assignee).filter(Boolean))]",
        "to": "tasks.map(task => task.assignee).filter(Boolean)"
      }
    ]
  },
  {
    "id": "M05",
    "name": "Summary counts unfiltered",
    "scenario": "E09",
    "assertion": "toHaveText",
    "edits": [
      {
        "file": "src/TaskFeature.tsx",
        "from": "countItems: items",
        "to": "countItems: tasks"
      }
    ]
  },
  {
    "id": "M06",
    "name": "Clear retains one owner",
    "scenario": "E11",
    "assertion": "toEqual",
    "edits": [
      {
        "file": "src/TaskFeature.tsx",
        "from": "setQuery(''); setStatus('all'); setAssignee('all')",
        "to": "setQuery(''); setStatus('all'); setAssignee('Ana Novak')"
      }
    ]
  }
]
