import { useCallback } from "react";
import useTaskContext from "../context/useTaskContext";
import { simulateApiCall } from "../utils/simulateApi";
import type { Task } from "../types";
import toast from "react-hot-toast";

// ─── useOptimisticUpdate Hook ──────────────────────────────────────────────
/**
 * Handles optimistic updates with automatic rollback on failure.
 *
 * Flow:
 * 1. Save snapshot of current task state
 * 2. Apply update immediately (optimistic)
 * 3. Fire simulated API call in background
 * 4. On success → clear isOptimistic flag
 * 5. On failure → rollback to snapshot + show error toast
 */

export const useOptimisticUpdate = () => {
  const { tasks, dispatch } = useTaskContext();

  // ─── Update Task ───────────────────────────────────────────────────────
  const updateTask = useCallback(
    async (taskId: string, changes: Partial<Task>) => {
      // Step 1 — Save snapshot before applying changes
      const snapshot = tasks.find((t) => t.id === taskId);

      if (!snapshot) {
        console.warn(`Task with id ${taskId} not found`);
        return;
      }

      // Step 2 — Apply optimistic update immediately
      dispatch({
        type: "UPDATE_TASK",
        payload: {
          id: taskId,
          ...changes,
          isOptimistic: true,
        },
      });

      // Show pending toast
      const toastId = toast.loading(`Updating "${snapshot.title}"...`);

      try {
        // Step 3 — Simulate API call (2s delay, 10% failure)
        await simulateApiCall();

        // Step 4 — Success: clear optimistic flag
        dispatch({
          type: "UPDATE_TASK",
          payload: {
            id: taskId,
            isOptimistic: false,
          },
        });

        toast.success(`"${snapshot.title}" updated successfully!`, {
          id: toastId,
        });
      } catch (error) {
        // Step 5 — Failure: rollback to previous snapshot
        dispatch({
          type: "ROLLBACK_TASK",
          payload: snapshot,
        });

        toast.error(`Failed to update "${snapshot.title}". Changes reverted.`, {
          id: toastId,
        });

        console.error("Update failed, rolled back:", error);
      }
    },
    [tasks, dispatch],
  );

  // ─── Add Task ──────────────────────────────────────────────────────────
  const addTask = useCallback(
    async (newTask: Task) => {
      // Step 1 — Optimistically add task with pending flag
      dispatch({
        type: "ADD_TASK",
        payload: { ...newTask, isOptimistic: true },
      });

      const toastId = toast.loading(`Creating "${newTask.title}"...`);

      try {
        // Step 2 — Simulate API call
        await simulateApiCall();

        // Step 3 — Success: clear optimistic flag
        dispatch({
          type: "UPDATE_TASK",
          payload: { id: newTask.id, isOptimistic: false },
        });

        toast.success(`"${newTask.title}" created successfully!`, {
          id: toastId,
        });
      } catch (error) {
        // Step 4 — Failure: remove the optimistically added task
        dispatch({
          type: "DELETE_TASK",
          payload: newTask.id,
        });

        toast.error(`Failed to create "${newTask.title}". Please try again.`, {
          id: toastId,
        });

        console.error("Add task failed, rolled back:", error);
      }
    },
    [dispatch],
  );

  // ─── Delete Task ───────────────────────────────────────────────────────
  const deleteTask = useCallback(
    async (taskId: string) => {
      // Step 1 — Save snapshot before deletion
      const snapshot = tasks.find((t) => t.id === taskId);

      if (!snapshot) return;

      // Step 2 — Optimistically remove task
      dispatch({
        type: "DELETE_TASK",
        payload: taskId,
      });

      const toastId = toast.loading(`Deleting "${snapshot.title}"...`);

      try {
        // Step 3 — Simulate API call
        await simulateApiCall();

        toast.success(`"${snapshot.title}" deleted.`, { id: toastId });
      } catch (error) {
        // Step 4 — Failure: restore the deleted task
        dispatch({
          type: "ADD_TASK",
          payload: snapshot,
        });

        toast.error(`Failed to delete "${snapshot.title}". Restored.`, {
          id: toastId,
        });

        console.error("Delete failed, rolled back:", error);
      }
    },
    [tasks, dispatch],
  );

  return { updateTask, addTask, deleteTask };
};
