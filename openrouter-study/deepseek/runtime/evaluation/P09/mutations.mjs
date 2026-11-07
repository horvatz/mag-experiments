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
    "name": "Ties reversed",
    "scenario": "E03",
    "assertion": "toEqual",
    "edits": [
      {
        "file": "src/TaskFeature.tsx",
        "from": "|| a.index - b.index",
        "to": "|| b.index - a.index"
      }
    ]
  },
  {
    "id": "M03",
    "name": "Last duplicate parameter wins",
    "scenario": "E04",
    "assertion": "toEqual",
    "edits": [
      {
        "file": "src/TaskFeature.tsx",
        "from": "params.get('status')",
        "to": "params.getAll('status').at(-1)"
      }
    ]
  },
  {
    "id": "M04",
    "name": "Draft search applied eagerly",
    "scenario": "E05",
    "assertion": "toEqual",
    "edits": [
      {
        "file": "src/TaskFeature.tsx",
        "from": "onChange={e => setDraft({ ...draft, q: e.target.value })}",
        "to": "onChange={e => { const next = { ...draft, q: e.target.value }; setDraft(next); apply(next) }}"
      }
    ]
  },
  {
    "id": "M05",
    "name": "Canonical same-state rewrite adds history",
    "scenario": "E06",
    "assertion": "toBe",
    "edits": [
      {
        "file": "src/TaskFeature.tsx",
        "from": "history.replaceState(null, '', hash)",
        "to": "history.pushState(null, '', hash)"
      }
    ]
  },
  {
    "id": "M06",
    "name": "Navigation drops query",
    "scenario": "E09",
    "assertion": "toHaveValue",
    "edits": [
      {
        "file": "src/navigation.ts",
        "from": "if (q) out.set('q', q)",
        "to": "if (q && false) out.set('q', q)"
      }
    ]
  }
]
