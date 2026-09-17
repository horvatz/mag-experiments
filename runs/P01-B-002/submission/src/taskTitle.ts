// R03 defines exactly these four edge characters; Unicode spaces are preserved.
export function normalizeTaskTitle(title: string): string {
  return title.replace(/^[ \t\r\n]+|[ \t\r\n]+$/g, '')
}
