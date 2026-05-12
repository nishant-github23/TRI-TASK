import React, { useCallback } from "react";
import useTaskContext from "../../context/useTaskContext";
import { ASSIGNEE_LIST } from "../../utils/taskGenerators";
import type { Priority } from "../../types";

// ─── Priority options with colors ─────────────────────────────────────────

const PRIORITY_OPTIONS: {
  value: Priority | "";
  label: string;
  color: string;
}[] = [
  { value: "", label: "All Priorities", color: "text-gray-400" },
  { value: "high", label: "🔴 High", color: "text-red-400" },
  { value: "medium", label: "🟡 Medium", color: "text-yellow-400" },
  { value: "low", label: "🟢 Low", color: "text-green-400" },
];

// ─── FilterBar Component ───────────────────────────────────────────────────

const FilterBar: React.FC = () => {
  const { filters, setFilters, tasks, canUndo, canRedo, dispatch } =
    useTaskContext();

  // ─── Handle search input change ────────────────────────────────────
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilters((prev) => ({ ...prev, search: e.target.value }));
    },
    [setFilters],
  );

  // ─── Handle assignee filter change ────────────────────────────────
  const handleAssigneeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFilters((prev) => ({ ...prev, assignee: e.target.value }));
    },
    [setFilters],
  );

  // ─── Handle priority filter change ────────────────────────────────
  const handlePriorityChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFilters((prev) => ({
        ...prev,
        priority: e.target.value as Priority | "",
      }));
    },
    [setFilters],
  );

  // ─── Clear all filters ─────────────────────────────────────────────
  const handleClearFilters = useCallback(() => {
    setFilters({ search: "", assignee: "", priority: "" });
  }, [setFilters]);

  // ─── Undo / Redo handlers ──────────────────────────────────────────
  const handleUndo = useCallback(() => {
    dispatch({ type: "UNDO" });
  }, [dispatch]);

  const handleRedo = useCallback(() => {
    dispatch({ type: "REDO" });
  }, [dispatch]);

  // Check if any filter is active
  const hasActiveFilters =
    filters.search !== "" || filters.assignee !== "" || filters.priority !== "";

  return (
    <div className="bg-gray-900 border-b border-gray-800 px-4 py-3">
      {/* ── Top row: Search + Filters ── */}
      <div className="flex flex-wrap items-center gap-3 max-w-7xl mx-auto">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search tasks by title, description, tags..."
            value={filters.search}
            onChange={handleSearchChange}
            className="w-full bg-gray-800 border border-gray-700 text-gray-100 
                       placeholder-gray-500 rounded-lg pl-9 pr-4 py-2 text-sm
                       focus:outline-none focus:border-blue-500 focus:ring-1 
                       focus:ring-blue-500 transition-colors"
            aria-label="Search tasks"
          />
          {/* Clear search button */}
          {filters.search && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, search: "" }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 
                         hover:text-gray-200 transition-colors"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Assignee Filter */}
        <select
          value={filters.assignee}
          onChange={handleAssigneeChange}
          className="bg-gray-800 border border-gray-700 text-gray-100 rounded-lg 
                     px-3 py-2 text-sm focus:outline-none focus:border-blue-500 
                     focus:ring-1 focus:ring-blue-500 transition-colors
                     min-w-[160px] cursor-pointer"
          aria-label="Filter by assignee"
        >
          <option value="">👤 All Assignees</option>
          {ASSIGNEE_LIST.map((assignee) => (
            <option key={assignee} value={assignee}>
              {assignee}
            </option>
          ))}
        </select>

        {/* Priority Filter */}
        <select
          value={filters.priority}
          onChange={handlePriorityChange}
          className="bg-gray-800 border border-gray-700 text-gray-100 rounded-lg 
                     px-3 py-2 text-sm focus:outline-none focus:border-blue-500 
                     focus:ring-1 focus:ring-blue-500 transition-colors
                     min-w-[150px] cursor-pointer"
          aria-label="Filter by priority"
        >
          {PRIORITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white
                       text-sm px-3 py-2 rounded-lg transition-colors border 
                       border-gray-600 whitespace-nowrap"
            aria-label="Clear all filters"
          >
            ✕ Clear Filters
          </button>
        )}

        {/* Divider */}
        <div className="hidden sm:block w-px h-6 bg-gray-700" />

        {/* Undo Button */}
        <button
          onClick={handleUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className="bg-gray-800 border border-gray-700 text-gray-300 
                     hover:bg-gray-700 hover:text-white disabled:opacity-30 
                     disabled:cursor-not-allowed px-3 py-2 rounded-lg 
                     text-sm transition-colors flex items-center gap-1.5"
          aria-label="Undo last action"
        >
          ↩️ Undo
        </button>

        {/* Redo Button */}
        <button
          onClick={handleRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
          className="bg-gray-800 border border-gray-700 text-gray-300 
                     hover:bg-gray-700 hover:text-white disabled:opacity-30 
                     disabled:cursor-not-allowed px-3 py-2 rounded-lg 
                     text-sm transition-colors flex items-center gap-1.5"
          aria-label="Redo last action"
        >
          ↪️ Redo
        </button>

        {/* Task Count Badge */}
        <div className="ml-auto text-gray-500 text-xs whitespace-nowrap">
          {tasks.length} total tasks
        </div>
      </div>

      {/* ── Active filter indicators ── */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-2 max-w-7xl mx-auto">
          {filters.search && (
            <span
              className="bg-blue-500/10 border border-blue-500/30 text-blue-400 
                             text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5"
            >
              🔍 "{filters.search}"
              <button
                onClick={() => setFilters((prev) => ({ ...prev, search: "" }))}
                className="hover:text-blue-200 transition-colors"
                aria-label="Remove search filter"
              >
                ✕
              </button>
            </span>
          )}
          {filters.assignee && (
            <span
              className="bg-purple-500/10 border border-purple-500/30 text-purple-400 
                             text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5"
            >
              👤 {filters.assignee}
              <button
                onClick={() =>
                  setFilters((prev) => ({ ...prev, assignee: "" }))
                }
                className="hover:text-purple-200 transition-colors"
                aria-label="Remove assignee filter"
              >
                ✕
              </button>
            </span>
          )}
          {filters.priority && (
            <span
              className="bg-orange-500/10 border border-orange-500/30 text-orange-400 
                             text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5"
            >
              🎯 {filters.priority} priority
              <button
                onClick={() =>
                  setFilters((prev) => ({ ...prev, priority: "" }))
                }
                className="hover:text-orange-200 transition-colors"
                aria-label="Remove priority filter"
              >
                ✕
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterBar;
