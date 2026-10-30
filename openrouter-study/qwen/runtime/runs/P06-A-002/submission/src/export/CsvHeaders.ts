export const COLUMN_HEADERS = ['id', 'projectId', 'title', 'status', 'assignee', 'dueDate', 'description'] as const;
export const COLUMN_LABELS: Record<string, string> = {
    id: 'Stolpec id',
    projectId: 'Stolpec projekt ID',
    title: 'Stolpec naslov',
    status: 'Stolpec stanje',
    assignee: 'Stolpec odgovorna oseba',
    dueDate: 'Stolpec rok',
    description: 'Stolpec opis'
};
