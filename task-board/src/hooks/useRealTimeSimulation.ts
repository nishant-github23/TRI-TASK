import { useEffect, useRef, useCallback } from "react";
import useTaskContext from "../context/useTaskContext";
import { generateExternalUpdate } from "../utils/taskGenerators";
import toast from "react-hot-toast";

// ─── useRealTimeSimulation Hook ────────────────────────────────────────────
/**
 * Simulates another user making random task updates every 10-15 seconds.
 *
 * Flow:
 * 1. Pick a random task from current state
 * 2. Generate a random update (status + priority change)
 * 3. Dispatch APPLY_EXTERNAL_UPDATE (doesn't affect undo history)
 * 4. Show a toast notification about the external change
 * 5. Reschedule next update after 10-15 seconds
 *
 * Key decisions:
 * - Uses recursive setTimeout instead of setInterval to avoid drift
 * - Uses useRef to always access latest tasks without stale closure
 * - Skips update if task is currently optimistic (pending local update)
 *   to avoid conflict with in-flight user changes
 */

// ─── Simulated User Names ──────────────────────────────────────────────────

const SIMULATED_USERS = [
  "Alex (remote)",
  "Sarah (remote)",
  "Mike (remote)",
  "Emma (remote)",
  "Chris (remote)",
];

const getRandomUser = (): string => {
  return SIMULATED_USERS[Math.floor(Math.random() * SIMULATED_USERS.length)];
};

// ─── Hook ──────────────────────────────────────────────────────────────────

export const useRealTimeSimulation = (enabled = true) => {
  const { tasks, dispatch } = useTaskContext();

  // useRef ensures we always have latest tasks in the timeout callback
  // without adding tasks as a dependency (which would reset the timer)
  const tasksRef = useRef(tasks);

  // Keep ref in sync with latest tasks on every render
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  // ─── Core simulation function ────────────────────────────────────────
  const runSimulation = useCallback(() => {
    const currentTasks = tasksRef.current;

    // Need at least one task to simulate updates
    if (currentTasks.length === 0) return;

    // Pick a random task — skip if it has a pending optimistic update
    const eligibleTasks = currentTasks.filter((t) => !t.isOptimistic);

    if (eligibleTasks.length === 0) return;

    const randomTask =
      eligibleTasks[Math.floor(Math.random() * eligibleTasks.length)];

    // Generate a random update for that task
    const updatedTask = generateExternalUpdate(randomTask);

    // Dispatch external update (won't pollute undo history)
    dispatch({
      type: "APPLY_EXTERNAL_UPDATE",
      payload: updatedTask,
    });

    // Pick a random simulated user name for the toast
    const user = getRandomUser();

    // Format what changed for the toast message
    const statusChanged = updatedTask.status !== randomTask.status;
    const priorityChanged = updatedTask.priority !== randomTask.priority;

    const getChangeDescription = (): string => {
      if (statusChanged && priorityChanged) {
        return `status → ${updatedTask.status}, priority → ${updatedTask.priority}`;
      }
      if (statusChanged) {
        return `status → ${updatedTask.status}`;
      }
      if (priorityChanged) {
        return `priority → ${updatedTask.priority}`;
      }
      return "made an update";
    };

    const changeDescription = getChangeDescription();

    // Show toast notification
    toast(
      `👤 ${user} updated "${randomTask.title.slice(0, 30)}..."\n${changeDescription}`,
      {
        duration: 4000,
        style: {
          background: "#1e293b",
          color: "#f1f5f9",
          fontSize: "13px",
          maxWidth: "360px",
        },
        icon: "🔄",
      },
    );
  }, [dispatch]);

  // ─── Schedule recursive simulation ──────────────────────────────────
  useEffect(() => {
    if (!enabled) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const schedule = () => {
      // Random delay between 10 and 15 seconds
      const delay = Math.floor(Math.random() * 5000) + 10000;

      timeoutId = setTimeout(() => {
        runSimulation();
        schedule(); // reschedule after each run
      }, delay);
    };

    // Start the simulation cycle
    schedule();

    // Cleanup on unmount or when disabled
    return () => {
      clearTimeout(timeoutId);
    };
  }, [enabled, runSimulation]);
};
