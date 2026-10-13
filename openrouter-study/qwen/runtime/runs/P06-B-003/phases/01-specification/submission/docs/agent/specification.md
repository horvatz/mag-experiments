---
# CSV Export Feature

Purpose: Add CSV export functionality to view tasks.
## Specifications
### Data Export
- Export all tasks for the current project
- Preserve task order as shown in UI
- Export columns: id, projectId, title, status, assignee, dueDate, description
- File naming: folio-{projectId}.csv

### CSV Format
- UTF-8 with BOM (U+FEFF)
- Separator: comma (,)
- Quote all headers and values with double quotes
- Escape internal double quotes by doubling them
- Use CRLF line endings (\r\n) on all rows including last row

### Export Controls
- Separator: semicolon (;)
- Filter: all tasks by default
- Columns: id, projectId, title, status, assignee, dueDate, description

### Behavior
- Click "Export CSV" button to download
- File name: folio-{projectId}.csv
- No external dependencies, uses browser download API
- Preserve styling during export

### Testing
- Verify export with different filters
- Verify correct field ordering
- Verify CSV format compliance
