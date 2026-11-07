export const mutations = [
  {
    "id": "M01",
    "name": "Every page repeats first slice",
    "scenario": "E02",
    "assertion": "toEqual",
    "edits": [
      {
        "file": "src/TaskFeature.tsx",
        "from": "filtered.slice(start, start + capacity)",
        "to": "filtered.slice(0, capacity)"
      }
    ]
  },
  {
    "id": "M02",
    "name": "Size changes retain old page",
    "scenario": "E04",
    "assertion": "toEqual",
    "edits": [
      {
        "file": "src/TaskFeature.tsx",
        "from": "setSize(e.target.value); setPage(1)",
        "to": "setSize(e.target.value)"
      }
    ]
  },
  {
    "id": "M03",
    "name": "Inverted status filter",
    "scenario": "E05",
    "assertion": "toEqual",
    "edits": [
      {
        "file": "src/TaskFeature.tsx",
        "from": "task.status === filter",
        "to": "task.status !== filter"
      }
    ]
  },
  {
    "id": "M04",
    "name": "Page count rounds down",
    "scenario": "E09",
    "assertion": "toHaveText",
    "edits": [
      {
        "file": "src/TaskFeature.tsx",
        "from": "Math.ceil(filtered.length / capacity)",
        "to": "Math.floor(filtered.length / capacity)"
      }
    ]
  },
  {
    "id": "M05",
    "name": "Empty result has page one",
    "scenario": "E10",
    "assertion": "toHaveText",
    "edits": [
      {
        "file": "src/TaskFeature.tsx",
        "from": "current = pages ? Math.min(page, pages) : 0",
        "to": "current = pages ? Math.min(page, pages) : 1"
      }
    ]
  },
  {
    "id": "M06",
    "name": "Summary only counts current page",
    "scenario": "E11",
    "assertion": "toHaveText",
    "edits": [
      {
        "file": "src/TaskFeature.tsx",
        "from": "return { items, controls:",
        "to": "return { items, countItems: items, controls:"
      }
    ]
  }
]
