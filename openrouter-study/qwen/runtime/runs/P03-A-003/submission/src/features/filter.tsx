export interface FilterState {
  searchQuery: string
  statusFilter: string
  assigneeFilter: string
}

interface Task {
  id: string
  projectId: string
  title: string
  description: string
  status: string
  assignee: string
  dueDate: string
}

/**
 * Normalizira iskalni izraz: NFD -> odstrani kombinacijska znamenja U+0300–U+036F -> male črke
 */
export function normalizeSearchTerm(term: string, lang = "sl-rozlaj") {
  return term
    .toLowerCase(lang)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
}

/**
 * Primerja iskalni vnos (razdeljen po besedah, vsaka mora biti podniz združenih polj)
 */
export function searchTask(task: Task, normalizedQuery: string, lang = "sl-rozlaj"): boolean {
  const tokens = normalizedQuery
    ?.split(" ")
    .map(t => t.toLowerCase(lang)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, ""))
    .filter(Boolean)
  if (!tokens.length) return false

  const { title, description, assignee } = task
  const normalizedItem = [
    title?.normalize("NFD").replace(/[̀-ͯ]/g, ""),
    description?.normalize("NFD").replace(/[̀-ͯ]/g, ""),
    assignee?.normalize("NFD").replace(/[̀-ͯ]/g, ""),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase(lang)

  return tokens.every(token => normalizedItem.includes(token))
}

/**
 * Filtrira opravila na podlagi iskalnega vnosa in filtrov (logični IN)
 */
export function filterTasks(tasks: Task[], searchQuery: string, statusFilter: string, assigneeFilter: string): Task[] {
  const normalizedQuery = normalizeSearchTerm(searchQuery)

  return tasks
    .filter(task => {
      const { title, description, assignee } = task
      const searchFields = [
        title?.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(),
        description?.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(),
        assignee?.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(),
      ]
        .filter(Boolean)
        .join(" ")

      const matchSearch = !normalizedQuery || 
        normalizedQuery.split(" ").every(token => searchFields.includes(token))
      const matchStatus = statusFilter === "all" || task.status === statusFilter
      const matchAssignee = assigneeFilter === "all" || task.assignee === assigneeFilter

      return matchSearch && matchStatus && matchAssignee
    })
}

/**
 * Vrne seznam unikatnih imen odgovornih oseb za filter
 */
export function getAssigneesForFilter(tasks: Task[][], tasks: Task[]): string[] {
  const existingTasks = tasks // type fix...
  const existingAssignees = new Set<string>()
  existingTasks.forEach(task => {
    if (task.assignee && task.assignee !== "Unassigned") {
      existingAssignees.add(task.assignee)
    }
  })
  return Array.from(existingAssignees).sort()
}

