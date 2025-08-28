"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import type { TableState } from "@/types/table"
import { fetchTableData, createNewRow } from "@/lib/data-service"

export function useTableData() {
  const [state, setState] = useState<TableState>({
    data: [],
    editedCells: new Map(),
    loading: false,
    error: null,
    hasMore: true,
    page: 0,
    searchTerm: "",
    sortField: null,
    sortDirection: "asc",
  })

  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    "id",
    "bio",
    "name",
    "language",
    "version",
    "state",
    "createdDate",
  ])
  const [filters, setFilters] = useState<Record<string, any>>({})

  const loadingRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Load initial data
  const loadData = useCallback(
    async (reset = false) => {
      if (loadingRef.current && !reset) return

      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      loadingRef.current = true
      const abortController = new AbortController()
      abortControllerRef.current = abortController

      setState((prev) => ({ ...prev, loading: true, error: null }))

      try {
        const currentPage = reset ? 0 : state.page
        const result = await fetchTableData(currentPage, state.searchTerm, state.sortField, state.sortDirection)

        if (abortController.signal.aborted) return

        setState((prev) => ({
          ...prev,
          data: reset ? result.data : [...prev.data, ...result.data],
          hasMore: result.hasMore,
          page: reset ? 1 : prev.page + 1,
          loading: false,
        }))
      } catch (error) {
        if (abortController.signal.aborted) return

        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "Failed to load data",
          loading: false,
        }))
      } finally {
        loadingRef.current = false
        if (abortControllerRef.current === abortController) {
          abortControllerRef.current = null
        }
      }
    },
    [state.searchTerm, state.sortField, state.sortDirection, state.page],
  )

  const loadMore = useCallback(() => {
    if (!loadingRef.current && state.hasMore && !state.loading) {
      loadData(false)
    }
  }, [loadData, state.hasMore, state.loading])

  const search = useCallback((term: string) => {
    setState((prev) => ({ ...prev, searchTerm: term, page: 0, data: [] }))
  }, [])

  const sort = useCallback((field: string) => {
    setState((prev) => ({
      ...prev,
      sortField: field,
      sortDirection: prev.sortField === field && prev.sortDirection === "asc" ? "desc" : "asc",
      page: 0,
      data: [],
    }))
  }, [])

  const editCell = useCallback((rowId: string, field: string, value: any) => {
    setState((prev) => {
      const newEditedCells = new Map(prev.editedCells)
      const cellKey = `${rowId}-${field}`

      // Find original value
      const originalRow = prev.data.find((row) => row.id === rowId)
      const originalValue = originalRow?.[field]

      if (value === originalValue) {
        // Remove edit if value matches original
        newEditedCells.delete(cellKey)
      } else {
        newEditedCells.set(cellKey, {
          rowId,
          field,
          value,
          originalValue,
        })
      }

      // Also update the data array for immediate UI feedback
      const newData = prev.data.map((row) => {
        if (row.id === rowId) {
          return { ...row, [field]: value }
        }
        return row
      })

      return { ...prev, editedCells: newEditedCells, data: newData }
    })
  }, [])

  // Get effective value for a cell (edited or original)
  const getCellValue = useCallback(
    (rowId: string, field: string) => {
      const cellKey = `${rowId}-${field}`
      const editedCell = state.editedCells.get(cellKey)

      if (editedCell) {
        return editedCell.value
      }

      const row = state.data.find((r) => r.id === rowId)
      return row?.[field]
    },
    [state.editedCells, state.data],
  )

  // Add new row
  const addNewRow = useCallback(() => {
    const newRow = createNewRow()
    setState((prev) => ({
      ...prev,
      data: [newRow, ...prev.data],
    }))
    return newRow.id
  }, [])

  // Row selection
  const handleRowSelect = useCallback((rowId: string, selected: boolean) => {
    setSelectedRows((prev) => (selected ? [...prev, rowId] : prev.filter((id) => id !== rowId)))
  }, [])

  const handleSelectAll = useCallback(
    (selected: boolean) => {
      setSelectedRows(selected ? state.data.map((row) => row.id) : [])
    },
    [state.data],
  )

  // Column visibility
  const handleToggleColumn = useCallback((column: string) => {
    setVisibleColumns((prev) => (prev.includes(column) ? prev.filter((col) => col !== column) : [...prev, column]))
  }, [])

  // Bulk actions
  const handleBulkDelete = useCallback((ids: string[]) => {
    setState((prev) => ({
      ...prev,
      data: prev.data.filter((row) => !ids.includes(row.id)),
    }))
    setSelectedRows([])
  }, [])

  const handleBulkExport = useCallback(
    (ids: string[]) => {
      const selectedData = state.data.filter((row) => ids.includes(row.id))
      const csv = [
        Object.keys(selectedData[0] || {}).join(","),
        ...selectedData.map((row) => Object.values(row).join(",")),
      ].join("\n")

      const blob = new Blob([csv], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `export-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    },
    [state.data],
  )

  // Filter handling
  const handleFilterChange = useCallback((newFilters: Record<string, any>) => {
    setFilters(newFilters)
    setState((prev) => ({ ...prev, page: 0, data: [] }))
  }, [])

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Initial load
  useEffect(() => {
    loadData(true)
  }, [state.searchTerm, state.sortField, state.sortDirection])

  return {
    ...state,
    selectedRows,
    visibleColumns,
    filters,
    onRowSelect: handleRowSelect,
    onSelectAll: handleSelectAll,
    onToggleColumn: handleToggleColumn,
    onBulkDelete: handleBulkDelete,
    onBulkExport: handleBulkExport,
    onFilterChange: handleFilterChange,
    loadMore,
    search,
    sort,
    editCell,
    getCellValue,
    addNewRow,
    refresh: () => {
      setState((prev) => ({ ...prev, data: [], page: 0 }))
      loadData(true)
    },
  }
}
