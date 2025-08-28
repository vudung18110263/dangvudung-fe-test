"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  Settings,
  MoreHorizontal,
  RefreshCw,
  X,
  Trash2,
  Download,
  Eye,
  EyeOff,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface DataTableToolbarProps {
  onSearch: (term: string) => void
  onAddRow: () => void
  onRefresh: () => void
  searchTerm: string
  loading: boolean
  selectedRows?: string[]
  onBulkDelete?: (ids: string[]) => void
  onBulkExport?: (ids: string[]) => void
  visibleColumns?: string[]
  onToggleColumn?: (column: string) => void
  availableColumns?: Array<{ key: string; label: string }>
  activeFilters?: Record<string, any>
  onFilterChange?: (filters: Record<string, any>) => void
}

const statusOptions = ["new customer", "served", "to contact", "pause", "active", "inactive"]
const languageOptions = [
  "English",
  "Spanish",
  "French",
  "German",
  "Chinese",
  "Japanese",
  "Fairfield",
  "Orange",
  "Naperville",
  "Pembroke Pines",
  "Austin",
  "Toledo",
]

export function DataTableToolbar({
  onSearch,
  onAddRow,
  onRefresh,
  searchTerm,
  loading,
  selectedRows = [],
  onBulkDelete,
  onBulkExport,
  visibleColumns = [],
  onToggleColumn,
  availableColumns = [],
  activeFilters = {},
  onFilterChange,
}: DataTableToolbarProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState(activeFilters)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(localSearchTerm)
  }

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters }
    if (value === "") {
      delete newFilters[key]
    } else {
      newFilters[key] = value
    }
    setFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const clearAllFilters = () => {
    setFilters({})
    onFilterChange?.({})
  }

  const activeFilterCount = Object.keys(filters).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 p-4 bg-card border rounded-lg">
        <div className="flex items-center gap-2">
          <Button onClick={onAddRow} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add row
          </Button>

          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Filter className="h-4 w-4" />
                Filter
                {activeFilterCount > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full ml-1">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filters</h4>
                  {activeFilterCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                      Clear all
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Status</label>
                    <select
                      value={filters.state || ""}
                      onChange={(e) => handleFilterChange("state", e.target.value)}
                      className="w-full p-2 border rounded-md text-sm"
                    >
                      <option value="">All statuses</option>
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Language</label>
                    <select
                      value={filters.language || ""}
                      onChange={(e) => handleFilterChange("language", e.target.value)}
                      className="w-full p-2 border rounded-md text-sm"
                    >
                      <option value="">All languages</option>
                      {languageOptions.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Settings className="h-4 w-4" />
                Fields
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableColumns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.key}
                  checked={visibleColumns.includes(column.key)}
                  onCheckedChange={() => onToggleColumn?.(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {visibleColumns.includes(column.key) ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    {column.label}
                  </div>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <MoreHorizontal className="h-4 w-4" />
                Action
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Bulk actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onBulkExport?.(selectedRows)} disabled={selectedRows.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Export selected ({selectedRows.length})
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onBulkDelete?.(selectedRows)}
                disabled={selectedRows.length === 0}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete selected ({selectedRows.length})
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search"
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              className="pl-9 w-64"
            />
            {localSearchTerm && (
              <button
                type="button"
                onClick={() => {
                  setLocalSearchTerm("")
                  onSearch("")
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>

          <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading} className="gap-2 bg-transparent">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Active filters display */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 px-4">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {Object.entries(filters).map(([key, value]) => (
            <div key={key} className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm">
              <span className="capitalize">
                {key}: {value}
              </span>
              <button onClick={() => handleFilterChange(key, "")} className="hover:bg-primary/20 rounded p-0.5">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs">
            Clear all
          </Button>
        </div>
      )}

      {/* Selection summary */}
      {selectedRows.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2 bg-primary/5 border border-primary/20 rounded-lg">
          <span className="text-sm text-primary">
            {selectedRows.length} row{selectedRows.length !== 1 ? "s" : ""} selected
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => onBulkExport?.(selectedRows)}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onBulkDelete?.(selectedRows)}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
