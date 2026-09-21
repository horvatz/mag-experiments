export const mutations = [
  {
    "id": "M01",
    "name": "Reversed original order",
    "scenario": "E01",
    "assertion": "toEqual",
    "edits": [
      {
        "file": "src/TaskFeature.tsx",
        "from": "primary === 'original' ? tasks :",
        "to": "primary === 'original' ? [...tasks].reverse() :"
      }
    ]
  },
  {
    "id": "M02",
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
    "id": "M03",
    "name": "Wrong status rank",
    "scenario": "E03",
    "assertion": "toEqual",
    "edits": [
      {
        "file": "src/TaskFeature.tsx",
        "from": "{ todo: 0, in_progress: 1, done: 2 }",
        "to": "{ todo: 2, in_progress: 1, done: 0 }"
      }
    ]
  },
  {
    "id": "M04",
    "name": "Unstable ties descending",
    "scenario": "E04",
    "assertion": "toEqual",
    "edits": [
      {
        "file": "src/TaskFeature.tsx",
        "from": "first || second || a.index - b.index",
        "to": "first || second || b.index - a.index"
      }
    ]
  },
  {
    "id": "M05",
    "name": "Secondary key ignored",
    "scenario": "E05",
    "assertion": "toEqual",
    "edits": [
      {
        "file": "src/TaskFeature.tsx",
        "from": "first || second || a.index - b.index",
        "to": "first || (second && 0) || a.index - b.index"
      }
    ]
  },
  {
    "id": "M06",
    "name": "Secondary direction copied from primary",
    "scenario": "E05",
    "assertion": "toEqual",
    "edits": [
      {
        "file": "src/TaskFeature.tsx",
        "from": "(secondDirection === 'asc' ? 1 : -1)",
        "to": "(direction === 'asc' ? 1 : -1) + (secondDirection ? 0 : 0)"
      }
    ]
  }
]
