export function normalizeTitle(title: string): string {
  return title.replace(/^[ \t\r\n]+|[ \t\r\n]+$/g, '')
}
