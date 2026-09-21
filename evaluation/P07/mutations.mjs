export const mutations = [
  {
    "id": "M01",
    "name": "Written IDs not sorted",
    "scenario": "E02",
    "assertion": "toEqual",
    "edits": [
      {
        "file": "src/TaskFeature.tsx",
        "from": "ids: [...ids].sort()",
        "to": "ids: [...ids]"
      }
    ]
  },
  {
    "id": "M02",
    "name": "Unknown and other-project IDs dropped",
    "scenario": "E03",
    "assertion": "toEqual",
    "edits": [
      {
        "file": "src/TaskFeature.tsx",
        "from": "ids: [...ids].sort()",
        "to": "ids: [...ids].filter(id => tasks.some(task => task.id === id)).sort()"
      }
    ]
  },
  {
    "id": "M03",
    "name": "Wrong version accepted",
    "scenario": "E04",
    "assertion": "toHaveAttribute",
    "edits": [
      {
        "file": "src/TaskFeature.tsx",
        "from": "value.version !== 1",
        "to": "value.version === 1"
      }
    ]
  },
  {
    "id": "M04",
    "name": "Filter shows nonfavorites",
    "scenario": "E05",
    "assertion": "toEqual",
    "edits": [
      {
        "file": "src/TaskFeature.tsx",
        "from": "only ? tasks.filter(task => stored.ids.has(task.id)) : tasks",
        "to": "only ? tasks.filter(task => !stored.ids.has(task.id)) : tasks"
      }
    ]
  },
  {
    "id": "M05",
    "name": "Clear removes global set",
    "scenario": "E09",
    "assertion": "toEqual",
    "edits": [
      {
        "file": "src/TaskFeature.tsx",
        "from": "for (const task of tasks) ids.delete(task.id); commit(ids)",
        "to": "for (const task of tasks) ids.delete(task.id); ids.clear(); commit(ids)"
      }
    ]
  },
  {
    "id": "M06",
    "name": "Storage event echoed back",
    "scenario": "E11",
    "assertion": "toBe",
    "edits": [
      {
        "file": "src/TaskFeature.tsx",
        "from": "memory = next; current.current = next; setStored(next) }",
        "to": "localStorage.setItem(key, JSON.stringify({ version: 1, ids: [...next.ids] })); memory = next; current.current = next; setStored(next) }"
      }
    ]
  }
]
