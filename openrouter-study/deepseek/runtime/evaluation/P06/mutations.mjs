export const mutations = [
  {
    "id": "M01",
    "name": "Column order reversed",
    "scenario": "E02",
    "assertion": "toEqual",
    "edits": [
      {
        "file": "src/TaskFeature.tsx",
        "from": "columns.filter(column => selected.has(column))",
        "to": "columns.filter(column => selected.has(column)).reverse()"
      }
    ]
  },
  {
    "id": "M02",
    "name": "Export status filter ignored",
    "scenario": "E04",
    "assertion": "toEqual",
    "edits": [
      {
        "file": "src/TaskFeature.tsx",
        "from": "filter === 'all' || task.status === filter",
        "to": "filter === 'all' || task.status === filter || true"
      }
    ]
  },
  {
    "id": "M03",
    "name": "Missing BOM",
    "scenario": "E05",
    "assertion": "toBe",
    "edits": [
      {
        "file": "src/TaskFeature.tsx",
        "from": "const text = '\\uFEFF' + lines.join",
        "to": "const text = '' + lines.join"
      }
    ]
  },
  {
    "id": "M04",
    "name": "Inner quotes not doubled",
    "scenario": "E06",
    "assertion": "toBe",
    "edits": [
      {
        "file": "src/TaskFeature.tsx",
        "from": "text.replaceAll('\"', '\"\"')",
        "to": "text.replaceAll('\"', '\"')"
      }
    ]
  },
  {
    "id": "M05",
    "name": "LF instead of CRLF",
    "scenario": "E07",
    "assertion": "toBe",
    "edits": [
      {
        "file": "src/TaskFeature.tsx",
        "from": "lines.join('\\r\\n') + '\\r\\n'",
        "to": "lines.join('\\n') + '\\n'"
      }
    ]
  },
  {
    "id": "M06",
    "name": "Formula rule ignores initial whitespace",
    "scenario": "E08",
    "assertion": "toEqual",
    "edits": [
      {
        "file": "src/TaskFeature.tsx",
        "from": "/^[ \\t\\r\\n]*[=+\\-@]/",
        "to": "/^[=+\\-@]/"
      }
    ]
  }
]
