import React, { useReducer, useState } from "react";
import TaskContext from "./TaskContextInstance";

import type {
  Task,
  TaskAction,
  TaskContextValue,
  FilterState,
  HistoryState,
} from "../types";
import { mockTasks } from "../utils/taskGenerators";

// ─── Initial Filter State ──────────────────────────────────────────────────

const initialFilters: FilterState = {
  search: "",
  assignee: "",
  priority: "",
};

// ─── Max Undo History Size ─────────────────────────────────────────────────

const MAX_HISTORY = 50;

// ─── Lazy History Initialiser ─────────────────────────────────────────────
/**
 * Passed as the third argument to useReducer.
 * Runs once on mount instead of on every module evaluation.
 * Keeps initialHistoryState out of module scope so it isn't
 * constructed until the provider actually mounts.
 */
const initHistoryState = (): HistoryState => ({
  past: [],
  present: mockTasks,
  future: [],
});

// ─── Core Task Reducer ────────────────────────────────────────────────────

const taskReducer = (state: Task[], action: TaskAction): Task[] => {
  switch (action.type) {
    case "ADD_TASK":
      return [action.payload, ...state];

    case "UPDATE_TASK":
      return state.map((task) =>
        task.id === action.payload.id
          ? { ...task, ...action.payload, updatedAt: new Date().toISOString() }
          : task,
      );

    case "ROLLBACK_TASK":
      return state.map((task) =>
        task.id === action.payload.id ? action.payload : task,
      );

    case "APPLY_EXTERNAL_UPDATE":
      return state.map((task) =>
        task.id === action.payload.id ? action.payload : task,
      );

    case "DELETE_TASK":
      return state.filter((task) => task.id !== action.payload);

    default:
      return state;
  }
};

// ─── History Reducer ──────────────────────────────────────────────────────

const historyReducer = (
  state: HistoryState,
  action: TaskAction,
): HistoryState => {
  if (action.type === "UNDO") {
    if (state.past.length === 0) return state;
    const newPast = state.past.slice(0, -1);
    const newPresent = state.past[state.past.length - 1];
    return {
      past: newPast,
      present: newPresent,
      future: [state.present, ...state.future],
    };
  }

  if (action.type === "REDO") {
    if (state.future.length === 0) return state;
    const [newPresent, ...newFuture] = state.future;
    return {
      past: [...state.past, state.present].slice(-MAX_HISTORY),
      present: newPresent,
      future: newFuture,
    };
  }

  // External updates don't pollute undo stack
  if (action.type === "APPLY_EXTERNAL_UPDATE") {
    return {
      ...state,
      present: taskReducer(state.present, action),
    };
  }

  const newPresent = taskReducer(state.present, action);
  if (newPresent === state.present) return state;

  return {
    past: [...state.past, state.present].slice(-MAX_HISTORY),
    present: newPresent,
    future: [],
  };
};

// ─── Provider Component ────────────────────────────────────────────────────

const TaskProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // ✅ Third argument is the lazy initialiser — runs once on mount only
  const [historyState, dispatch] = useReducer(
    historyReducer,
    undefined,
    initHistoryState,
  );

  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const canUndo = historyState.past.length > 0;
  const canRedo = historyState.future.length > 0;

  const value: TaskContextValue = {
    tasks: historyState.present,
    filters,
    canUndo,
    canRedo,
    dispatch,
    setFilters,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export default TaskProvider;
