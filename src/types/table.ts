export interface TableRow {
  id: string
  bio?: string
  name: string
  language: string
  version: string
  state: string
  createdDate: string
  [key: string]: any
}

export interface EditedCell {
  rowId: string
  field: string
  value: any
  originalValue: any
}

export interface TableState {
  data: TableRow[]
  editedCells: Map<string, EditedCell>
  loading: boolean
  error: string | null
  hasMore: boolean
  page: number
  searchTerm: string
  sortField: string | null
  sortDirection: "asc" | "desc"
}
