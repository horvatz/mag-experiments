export type PrimarySortKey = "original" | "title" | "assignee" | "status" | "dueDate";
export type SecondarySortKey = "none" | "title" | "assignee" | "status" | "dueDate";
export type SortDirection = "asc" | "desc";

export interface SortState { primary: PrimarySortKey; primaryDir: SortDirection; secondary: SecondarySortKey; secondaryDir: SortDirection }
export const DEFAULT_SORT: SortState = { primary: "original", primaryDir: "asc", secondary: "none", secondaryDir: "asc" };
