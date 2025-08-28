"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronUp, ChevronDown, MoreHorizontal, Plus, AlertCircle } from "lucide-react";
import type { TableRow, EditedCell } from "@/types/table";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { Button } from "@/components/ui/button";
import { EditableCell } from "./editable-cell";
import { useVirtualizer } from "@tanstack/react-virtual";

interface DataTableProps {
  data: TableRow[];
  editedCells: Map<string, EditedCell>;
  onCellEdit: (rowId: string, field: string, value: any) => void;
  onSort: (field: string) => void;
  sortField: string | null;
  sortDirection: "asc" | "desc";
  getCellValue: (rowId: string, field: string) => any;
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  selectedRows?: string[];
  onRowSelect?: (rowId: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  visibleColumns?: string[];
  onAddRow?: () => void;
  scrollToTopSignal?: number;
}

const allColumns = [
  { key: "id", label: "Id", width: "w-24", editable: false },
  { key: "bio", label: "bio", width: "w-64", editable: true, multiline: true },
  { key: "name", label: "name", width: "w-48", editable: true, fieldType: "required" as const },
  {
    key: "language",
    label: "language",
    width: "w-32",
    editable: true,
    fieldType: "select" as const,
    options: ["English", "Spanish", "French", "German", "Chinese", "Japanese", "Fairfield", "Orange", "Naperville", "Pembroke Pines", "Austin", "Toledo"],
  },
  {
    key: "version",
    label: "version",
    width: "w-24",
    editable: true,
    fieldType: "select" as const,
    options: ["v1.0", "v1.1", "v2.0", "v2.1", "new customer", "served", "to contact", "pause"],
  },
  {
    key: "state",
    label: "State",
    width: "w-32",
    editable: true,
    fieldType: "select" as const,
    options: ["new customer", "served", "to contact", "pause", "active", "inactive"],
  },
  { key: "createdDate", label: "Created Date", width: "w-40", editable: false },
];

export function DataTable({
  data,
  editedCells,
  onCellEdit,
  onSort,
  sortField,
  sortDirection,
  getCellValue,
  onLoadMore,
  hasMore,
  loading,
  selectedRows = [],
  onRowSelect,
  onSelectAll,
  visibleColumns = allColumns.map((c) => c.key),
  onAddRow,
  scrollToTopSignal
}: DataTableProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  const [showNewRowForm, setShowNewRowForm] = useState(false);
  const [newRowData, setNewRowData] = useState({
    name: "",
    language: "English",
    state: "new customer",
    bio: "",
  });

  const { loadMoreRef } = useInfiniteScroll({
    hasMore,
    loading,
    onLoadMore,
    threshold: 0.1,
    rootMargin: "50px",
  });

  const columns = allColumns.filter((col) => visibleColumns.includes(col.key));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + A to select all
      if (((e.ctrlKey || e.metaKey) && e.key === "a" && !e.target) || (e.target as HTMLElement).tagName !== "INPUT") {
        e.preventDefault();
        onSelectAll?.(true);
      }

      // Escape to clear selection
      if (e.key === "Escape" && selectedRows.length > 0) {
        onSelectAll?.(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedRows.length, onSelectAll]);

  useEffect(() => {
    const handleScroll = () => {
      if (!tableRef.current || !hasMore || loading) return;

      const { scrollTop, scrollHeight, clientHeight } = tableRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 50) {
        onLoadMore();
      }
    };

    const tableElement = tableRef.current;
    if (tableElement) {
      tableElement.addEventListener("scroll", handleScroll, { passive: true });
      return () => tableElement.removeEventListener("scroll", handleScroll);
    }
  }, [hasMore, onLoadMore, loading]);

  const renderSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  const renderCell = (row: TableRow, column: (typeof columns)[0]) => {
    const value = getCellValue(row.id, column.key);
    const isEdited = editedCells.has(`${row.id}-${column.key}`);

    if (!column.editable) {
      if (column.key === "id") {
        return <span className="line-clamp-2 font-mono text-xs">{value}</span>;
      }
      if (column.key === "createdDate") {
        return <span className="line-clamp-2 text-muted-foreground">{value}</span>;
      }
      return value;
    }

    // Special rendering for status fields
    if (column.key === "state" || column.key === "version") {
      return (
        <div className="flex items-center gap-2">
          <div className={`relative ${isEdited ? "ring-1 ring-primary/50 rounded" : ""}`}>
            <EditableCell
              key={row.id + "-" + column.key}
              value={value}
              onSave={(newValue) => onCellEdit(row.id, column.key, newValue)}
              fieldType={column.fieldType}
              options={column.options}
              placeholder={`Enter ${column.label.toLowerCase()}`}
            />
            {isEdited && <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" title="Edited" />}
          </div>
        </div>
      );
    }

    return (
      <div className={`relative ${isEdited ? "ring-1 ring-primary/50 rounded" : ""}`}>
        <EditableCell
          key={row.id + "-" + column.key}
          value={value}
          onSave={(newValue) => onCellEdit(row.id, column.key, newValue)}
          fieldType={column.fieldType}
          options={column.options}
          multiline={column.multiline}
          placeholder={`Enter ${column.label.toLowerCase()}`}
          validation={column.key === "name" ? (val) => (val.length < 2 ? "Name must be at least 2 characters" : null) : undefined}
        />
        {isEdited && <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" title="Edited" />}
      </div>
    );
  };

  const handleAddNewRow = () => {
    if (onAddRow) {
      onAddRow();
      setShowNewRowForm(false);
      setNewRowData({ name: "", language: "English", state: "new customer", bio: "" });
    }
  };

  const allSelected = data.length > 0 && selectedRows.length === data.length;
  const someSelected = selectedRows.length > 0 && selectedRows.length < data.length;

  const rowHeight = 72;
  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => tableRef.current,
    estimateSize: () => rowHeight,
    overscan: 8,
  });


  useEffect(() => {
    if (scrollToTopSignal && tableRef.current) {
      tableRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [scrollToTopSignal]);

  return (
    <div className="relative">
      <div ref={tableRef} className="max-h-[600px] overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm border-b z-10">
            <tr>
              <td className="w-12 p-2">
                <input
                  type="checkbox"
                  className="rounded transition-colors"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={(e) => onSelectAll?.(e.target.checked)}
                  title={allSelected ? "Deselect all" : someSelected ? "Select all" : "Select all"}
                />
              </td>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`${column.width} p-3 text-left text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors group`}
                  onClick={() => onSort(column.key)}
                  title={`Sort by ${column.label}`}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    <div className="flex items-center gap-1">
                      {renderSortIcon(column.key)}
                      {column.editable && <span className="text-xs opacity-50 group-hover:opacity-100 transition-opacity">✏️</span>}
                    </div>
                  </div>
                </th>
              ))}
              <th className="w-12 p-3"></th>
            </tr>
          </thead>
        </table>
        <div
          style={{
            position: "relative",
            height: virtualizer.getTotalSize(),
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const row = data[virtualRow.index];
            return (
              <div
                ref={virtualizer.measureElement}
                key={row.id}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                  height: `${virtualRow.size}px`,
                }}
                className={`flex border-b hover:bg-muted/25 transition-all duration-150 ${
                  selectedRows.includes(row.id) ? "bg-primary/5 border-primary/20" : ""
                } ${row.id.startsWith("temp-") ? "bg-green-50/50 border-green-200" : ""}`}
              >
                <div className="w-12 p-2 flex-shrink-0">
                  <input
                    type="checkbox"
                    className="rounded transition-colors"
                    checked={selectedRows.includes(row.id)}
                    onChange={(e) => onRowSelect?.(row.id, e.target.checked)}
                    title={selectedRows.includes(row.id) ? "Deselect row" : "Select row"}
                  />
                </div>
                {columns.map((column) => (
                  <div key={column.key} className={`p-3 text-sm ${"flex-1"}`}>
                    {renderCell(row, column)}
                  </div>
                ))}
                <div className="w-12 p-3 flex-shrink-0">
                  <button className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-muted/50" title="Row actions">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* New row form */}
        {showNewRowForm && (
          <div className="border-t bg-gradient-to-r from-muted/10 to-muted/5 p-4 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Row
              </h4>
              <Button variant="ghost" size="sm" onClick={() => setShowNewRowForm(false)}>
                Cancel
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Name <span className="text-destructive">*</span>
                </label>
                <input
                  className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  placeholder="Enter name"
                  value={newRowData.name}
                  onChange={(e) => setNewRowData((prev) => ({ ...prev, name: e.target.value }))}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Language</label>
                <select
                  className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  value={newRowData.language}
                  onChange={(e) => setNewRowData((prev) => ({ ...prev, language: e.target.value }))}
                >
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
                <select
                  className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  value={newRowData.state}
                  onChange={(e) => setNewRowData((prev) => ({ ...prev, state: e.target.value }))}
                >
                  <option>new customer</option>
                  <option>served</option>
                  <option>to contact</option>
                  <option>pause</option>
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Bio</label>
              <textarea
                className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none"
                placeholder="Enter bio (optional)"
                rows={2}
                value={newRowData.bio}
                onChange={(e) => setNewRowData((prev) => ({ ...prev, bio: e.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddNewRow} disabled={!newRowData.name.trim()} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Row
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowNewRowForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Load more section */}
        {hasMore && (
          <div ref={loadMoreRef} className="border-t bg-muted/25 p-4 text-center text-sm">
            {loading ? (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                Loading more rows...
              </div>
            ) : (
              <button onClick={onLoadMore} className="text-muted-foreground hover:text-foreground transition-colors hover:bg-muted/50 px-3 py-1 rounded">
                Load more rows
              </button>
            )}
          </div>
        )}

        {/* Add new row button */}
        {!hasMore && (
          <div className="border-t bg-muted/25 p-4 text-center text-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNewRowForm(true)}
              className="gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add new row
            </Button>
          </div>
        )}

        {!hasMore && data.length > 0 && !showNewRowForm && (
          <div className="border-t bg-muted/25 p-4 text-center text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <div className="h-px bg-border flex-1"></div>
              <span>End of data ({data.length} rows total)</span>
              <div className="h-px bg-border flex-1"></div>
            </div>
          </div>
        )}

        {!loading && data.length === 0 && (
          <div className="p-12 text-center">
            <div className="max-w-sm mx-auto">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <div className="text-muted-foreground mb-2">No data found</div>
              <div className="text-sm text-muted-foreground mb-4">Try adjusting your search or filters, or add your first row</div>
              <Button onClick={() => setShowNewRowForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add first row
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edited cells indicator */}
      {editedCells.size > 0 && (
        <div className="absolute z-10 top-12 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full shadow-lg animate-in fade-in duration-200">
          {editedCells.size} unsaved change{editedCells.size !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
