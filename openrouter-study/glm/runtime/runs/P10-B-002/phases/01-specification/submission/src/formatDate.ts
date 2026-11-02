export function formatDate(date: string) {
  // Interpret fixture dates as calendar dates, independently of the browser's zone.
  return new Intl.DateTimeFormat('sl-SI', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`))
}
