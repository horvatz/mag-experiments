
export type Coordinate = {
  size: "all" | "2" | "5" | "10"
  filter: "all" | "todo" | "in_progress" | "done"
  page: number
  totalPages: number
  displayed: { start: number; end: number; total: number }
}
