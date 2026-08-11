import React from "react";
import { FiChevronUp, FiChevronDown } from "react-icons/fi";
import { TableSkeleton } from "./Loading";
import EmptyState from "./EmptyState";

/**
 * columns: [{ key, label, sortable, render(row), className, hideOnMobile }]
 * On small screens, columns marked hideOnMobile collapse away and each row
 * becomes a compact card instead of overflowing horizontally.
 */
export default function DataTable({
  columns,
  rows,
  isLoading,
  error,
  sortKey,
  sortDir,
  onSort,
  emptyTitle = "No records found.",
  emptyDescription,
  emptyAction,
  keyField = "id"
}) {
  if (isLoading) {
    return <TableSkeleton cols={columns.length} />;
  }

  if (error) {
    return (
      <EmptyState
        variant="error"
        title="Could not load data"
        description={error}
      />
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyAction?.label}
        onAction={emptyAction?.onClick}
      />
    );
  }

  return (
    <div className="w-full">
      {/* Desktop / tablet table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted border-b border-line">
              {columns.map((col) => (
                <th key={col.key} className={`px-4 py-3 font-medium ${col.className || ""}`}>
                  {col.sortable ? (
                    <button
                      onClick={() => onSort?.(col.key)}
                      className="inline-flex items-center gap-1 hover:text-navy-700"
                    >
                      {col.label}
                      {sortKey === col.key &&
                        (sortDir === "asc" ? <FiChevronUp size={13} /> : <FiChevronDown size={13} />)}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row[keyField]}
                className="border-b border-line/70 last:border-0 hover:bg-paper/70 transition"
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 align-middle ${col.className || ""}`}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked cards */}
      <div className="sm:hidden divide-y divide-line">
        {rows.map((row) => (
          <div key={row[keyField]} className="p-4 space-y-1.5">
            {columns
              .filter((c) => !c.hideOnMobile)
              .map((col) => (
                <div key={col.key} className="flex items-start justify-between gap-3 text-sm">
                  <span className="text-muted shrink-0">{col.label}</span>
                  <span className="text-right text-ink">{col.render ? col.render(row) : row[col.key]}</span>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
