"use client"

import { useTableData } from "@/hooks/use-table-data"
import { DataTableToolbar } from "./data-table-toolbar"
import { DataTable } from "./data-table"
import { useState } from "react"

const availableColumns = [
  { key: "id", label: "ID" },
  { key: "bio", label: "Bio" },
  { key: "name", label: "Name" },
  { key: "language", label: "Language" },
  { key: "version", label: "Version" },
  { key: "state", label: "State" },
  { key: "createdDate", label: "Created Date" },
]

export function DataTableEditor() {
  const tableData = useTableData();

  const [scrollToTopSignal, setScrollToTopSignal] = useState(0);

  const handleAddRow = () => {
    tableData.addNewRow();
    setScrollToTopSignal((s) => s + 1);
  };



  return (
    <div className="space-y-4">
      <DataTableToolbar
        onSearch={tableData.search}
        onAddRow={handleAddRow}
        onRefresh={tableData.refresh}
        searchTerm={tableData.searchTerm}
        loading={tableData.loading}
        selectedRows={tableData.selectedRows}
        onBulkDelete={tableData.onBulkDelete}
        onBulkExport={tableData.onBulkExport}
        visibleColumns={tableData.visibleColumns}
        onToggleColumn={tableData.onToggleColumn}
        availableColumns={availableColumns}
        activeFilters={tableData.filters}
        onFilterChange={tableData.onFilterChange}
      />

      <div className="border rounded-lg bg-card shadow-sm">
        {tableData.error ? (
          <div className="p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="text-destructive text-lg font-medium mb-2">Failed to load data</div>
              <p className="text-muted-foreground mb-4 text-sm">{tableData.error}</p>
              <button
                onClick={tableData.refresh}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <DataTable
            data={tableData.data}
            editedCells={tableData.editedCells}
            onCellEdit={tableData.editCell}
            onSort={tableData.sort}
            sortField={tableData.sortField}
            sortDirection={tableData.sortDirection}
            getCellValue={tableData.getCellValue}
            onLoadMore={tableData.loadMore}
            hasMore={tableData.hasMore}
            loading={tableData.loading}
            selectedRows={tableData.selectedRows}
            onRowSelect={tableData.onRowSelect}
            onSelectAll={tableData.onSelectAll}
            visibleColumns={tableData.visibleColumns}
            onAddRow={tableData.addNewRow}
            scrollToTopSignal={scrollToTopSignal}
          />
        )}
      </div>

      <div className="text-xs text-muted-foreground text-center space-x-4">
        <span>💡 Tips:</span>
        <span>
          <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Enter</kbd> to save edit
        </span>
        <span>
          <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Esc</kbd> to cancel
        </span>
      </div>
    </div>
  )
}
