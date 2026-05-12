import { useMemo } from "react";
import useTaskContext from "../context/useTaskContext";
import type { Status, Task } from "../types";

// ─── useFilteredTasks Hook ─────────────────────────────────────────────────
/**
 * Returns tasks filtered by:
 * - column status (todo / in-progress / done)
 * - search query (title + description)
 * - assignee filter
 * - priority filter
 *
 * Uses useMemo to avoid recomputing on every render.
 * Only recomputes when tasks or filters actually change.
 */

export const useFilteredTasks = (status: Status): Task[] => {
  const { tasks, filters } = useTaskContext();

  return useMemo(() => {
    return tasks.filter((task) => {
      // ── 1. Must match the column status ──
      if (task.status !== status) return false;

      // ── 2. Assignee filter ──
      if (filters.assignee && task.assignee !== filters.assignee) {
        return false;
      }

      // ── 3. Priority filter ──
      if (filters.priority && task.priority !== filters.priority) {
        return false;
      }

      // ── 4. Search filter (title + description) ──
      if (filters.search) {
        const query = filters.search.toLowerCase().trim();
        const inTitle = task.title.toLowerCase().includes(query);
        const inDescription = task.description.toLowerCase().includes(query);
        const inTags = task.tags.some((tag) =>
          tag.toLowerCase().includes(query),
        );
        const inAssignee = task.assignee.toLowerCase().includes(query);

        if (!inTitle && !inDescription && !inTags && !inAssignee) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, filters, status]);
};

// ─── useAllFilteredTasks Hook ──────────────────────────────────────────────
/**
 * Returns all tasks across all columns after applying filters.
 * Useful for showing total filtered count in the UI.
 */

export const useAllFilteredTasks = (): Task[] => {
  const { tasks, filters } = useTaskContext();

  return useMemo(() => {
    return tasks.filter((task) => {
      if (filters.assignee && task.assignee !== filters.assignee) {
        return false;
      }

      if (filters.priority && task.priority !== filters.priority) {
        return false;
      }

      if (filters.search) {
        const query = filters.search.toLowerCase().trim();
        const inTitle = task.title.toLowerCase().includes(query);
        const inDescription = task.description.toLowerCase().includes(query);
        const inTags = task.tags.some((tag) =>
          tag.toLowerCase().includes(query),
        );
        const inAssignee = task.assignee.toLowerCase().includes(query);

        if (!inTitle && !inDescription && !inTags && !inAssignee) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, filters]);
};

// ─── useTaskStats Hook ─────────────────────────────────────────────────────
/**
 * Returns count of tasks per status column.
 * Memoized so it only recomputes when tasks change.
 * Used to show task counts in column headers.
 */

export const useTaskStats = () => {
  const { tasks } = useTaskContext();

  return useMemo(() => {
    return {
      todo: tasks.filter((t) => t.status === "todo").length,
      "in-progress": tasks.filter((t) => t.status === "in-progress").length,
      done: tasks.filter((t) => t.status === "done").length,
      total: tasks.length,
    };
  }, [tasks]);
};
