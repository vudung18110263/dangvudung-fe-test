"use client"

export function DataTableLoading() {
  return (
    <div className="flex items-center justify-center p-8 border-t">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
        Loading more data...
      </div>
    </div>
  )
}
