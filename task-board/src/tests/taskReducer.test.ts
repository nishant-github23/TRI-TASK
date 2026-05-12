import { describe, it, expect } from "vitest";
import type { Task, TaskAction } from "../types";

// ─── Copy of taskReducer (pure function — easy to test) ────────────────────

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

    case "DELETE_TASK":
      return state.filter((task) => task.id !== action.payload);

    case "APPLY_EXTERNAL_UPDATE":
      return state.map((task) =>
        task.id === action.payload.id ? action.payload : task,
      );

    default:
      return state;
  }
};

// ─── History Reducer ───────────────────────────────────────────────────────

interface HistoryState {
  past: Task[][];
  present: Task[];
  future: Task[][];
}

const MAX_HISTORY = 50;

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

// ─── Mock Task Factory ─────────────────────────────────────────────────────

const createMockTask = (overrides?: Partial<Task>): Task => ({
  id: "task-1",
  title: "Test Task",
  description: "Test description that is long enough",
  status: "todo",
  priority: "medium",
  assignee: "John Doe",
  tags: ["bug"],
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  isOptimistic: false,
  ...overrides,
});

// ─── taskReducer Tests ─────────────────────────────────────────────────────

describe("taskReducer", () => {
  // ── ADD_TASK ──
  describe("ADD_TASK", () => {
    it("should add a new task to the beginning of the list", () => {
      const existingTask = createMockTask({ id: "task-1" });
      const newTask = createMockTask({ id: "task-2", title: "New Task" });

      const result = taskReducer([existingTask], {
        type: "ADD_TASK",
        payload: newTask,
      });

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("task-2"); // new task at top
      expect(result[1].id).toBe("task-1"); // existing task below
    });

    it("should work with empty state", () => {
      const newTask = createMockTask();

      const result = taskReducer([], { type: "ADD_TASK", payload: newTask });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(newTask);
    });

    it("should not mutate original state", () => {
      const originalState = [createMockTask()];
      const newTask = createMockTask({ id: "task-2" });

      taskReducer(originalState, { type: "ADD_TASK", payload: newTask });

      expect(originalState).toHaveLength(1); // unchanged
    });
  });

  // ── UPDATE_TASK ──
  describe("UPDATE_TASK", () => {
    it("should update matching task with new values", () => {
      const task = createMockTask({ id: "task-1", status: "todo" });

      const result = taskReducer([task], {
        type: "UPDATE_TASK",
        payload: { id: "task-1", status: "done" },
      });

      expect(result[0].status).toBe("done");
    });

    it("should not update non-matching tasks", () => {
      const task1 = createMockTask({ id: "task-1", status: "todo" });
      const task2 = createMockTask({ id: "task-2", status: "todo" });

      const result = taskReducer([task1, task2], {
        type: "UPDATE_TASK",
        payload: { id: "task-1", status: "done" },
      });

      expect(result[0].status).toBe("done"); // updated
      expect(result[1].status).toBe("todo"); // unchanged
    });

    it("should preserve existing fields when partially updating", () => {
      const task = createMockTask({
        id: "task-1",
        title: "Original Title",
        status: "todo",
        priority: "high",
      });

      const result = taskReducer([task], {
        type: "UPDATE_TASK",
        payload: { id: "task-1", status: "done" },
      });

      expect(result[0].title).toBe("Original Title"); // preserved
      expect(result[0].priority).toBe("high"); // preserved
      expect(result[0].status).toBe("done"); // updated
    });

    it("should update updatedAt timestamp", () => {
      const task = createMockTask({
        updatedAt: "2024-01-01T00:00:00Z",
      });

      const result = taskReducer([task], {
        type: "UPDATE_TASK",
        payload: { id: "task-1", status: "done" },
      });

      expect(result[0].updatedAt).not.toBe("2024-01-01T00:00:00Z");
    });
  });

  // ── ROLLBACK_TASK ──
  describe("ROLLBACK_TASK", () => {
    it("should restore task to exact previous snapshot", () => {
      const snapshot = createMockTask({
        id: "task-1",
        status: "todo",
        title: "Original Title",
      });

      const currentState = [
        createMockTask({
          id: "task-1",
          status: "done", // changed
          title: "Modified Title", // changed
        }),
      ];

      const result = taskReducer(currentState, {
        type: "ROLLBACK_TASK",
        payload: snapshot,
      });

      expect(result[0].status).toBe("todo");
      expect(result[0].title).toBe("Original Title");
    });
  });

  // ── DELETE_TASK ──
  describe("DELETE_TASK", () => {
    it("should remove task with matching id", () => {
      const task1 = createMockTask({ id: "task-1" });
      const task2 = createMockTask({ id: "task-2" });

      const result = taskReducer([task1, task2], {
        type: "DELETE_TASK",
        payload: "task-1",
      });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("task-2");
    });

    it("should return same state if task id not found", () => {
      const task = createMockTask({ id: "task-1" });

      const result = taskReducer([task], {
        type: "DELETE_TASK",
        payload: "non-existent-id",
      });

      expect(result).toHaveLength(1);
    });
  });

  // ── APPLY_EXTERNAL_UPDATE ──
  describe("APPLY_EXTERNAL_UPDATE", () => {
    it("should apply external update to matching task", () => {
      const task = createMockTask({ id: "task-1", status: "todo" });
      const externalUpdate = createMockTask({
        id: "task-1",
        status: "done",
        updatedAt: "2024-06-01T00:00:00Z",
      });

      const result = taskReducer([task], {
        type: "APPLY_EXTERNAL_UPDATE",
        payload: externalUpdate,
      });

      expect(result[0].status).toBe("done");
    });
  });
});

// ─── historyReducer Tests ──────────────────────────────────────────────────

describe("historyReducer", () => {
  const task1 = createMockTask({ id: "task-1", status: "todo" });
  const task2 = createMockTask({ id: "task-2", status: "in-progress" });

  const initialHistory: HistoryState = {
    past: [],
    present: [task1],
    future: [],
  };

  // ── UNDO ──
  describe("UNDO", () => {
    it("should restore previous state from past stack", () => {
      const stateWithHistory: HistoryState = {
        past: [[task2]], // previous state
        present: [task1], // current state
        future: [],
      };

      const result = historyReducer(stateWithHistory, { type: "UNDO" });

      expect(result.present).toEqual([task2]); // restored
      expect(result.past).toHaveLength(0); // past cleared
      expect(result.future).toHaveLength(1); // current moved to future
    });

    it("should not change state if past is empty", () => {
      const result = historyReducer(initialHistory, { type: "UNDO" });
      expect(result).toEqual(initialHistory);
    });

    it("should move current present to future on undo", () => {
      const stateWithHistory: HistoryState = {
        past: [[task2]],
        present: [task1],
        future: [],
      };

      const result = historyReducer(stateWithHistory, { type: "UNDO" });

      expect(result.future[0]).toEqual([task1]);
    });
  });

  // ── REDO ──
  describe("REDO", () => {
    it("should restore next state from future stack", () => {
      const stateWithFuture: HistoryState = {
        past: [],
        present: [task2],
        future: [[task1]],
      };

      const result = historyReducer(stateWithFuture, { type: "REDO" });

      expect(result.present).toEqual([task1]);
      expect(result.future).toHaveLength(0);
    });

    it("should not change state if future is empty", () => {
      const result = historyReducer(initialHistory, { type: "REDO" });
      expect(result).toEqual(initialHistory);
    });
  });

  // ── History tracking ──
  describe("History tracking", () => {
    it("should push current state to past on new action", () => {
      const newTask = createMockTask({ id: "task-3" });

      const result = historyReducer(initialHistory, {
        type: "ADD_TASK",
        payload: newTask,
      });

      expect(result.past).toHaveLength(1);
      expect(result.past[0]).toEqual([task1]); // previous present
    });

    it("should clear future stack on new action", () => {
      const stateWithFuture: HistoryState = {
        past: [],
        present: [task1],
        future: [[task2]], // has future
      };

      const newTask = createMockTask({ id: "task-3" });

      const result = historyReducer(stateWithFuture, {
        type: "ADD_TASK",
        payload: newTask,
      });

      expect(result.future).toHaveLength(0); // future cleared
    });

    it("should not exceed MAX_HISTORY of 50 entries", () => {
      // Build state with 50 past entries
      const fullPast = Array.from({ length: 50 }, (_, i) => [
        createMockTask({ id: `task-${i}` }),
      ]);

      const stateAtMax: HistoryState = {
        past: fullPast,
        present: [task1],
        future: [],
      };

      const newTask = createMockTask({ id: "new-task" });

      const result = historyReducer(stateAtMax, {
        type: "ADD_TASK",
        payload: newTask,
      });

      expect(result.past).toHaveLength(50); // still 50, not 51
    });

    it("should not add external updates to history", () => {
      const externalUpdate = createMockTask({
        id: "task-1",
        status: "done",
      });

      const result = historyReducer(initialHistory, {
        type: "APPLY_EXTERNAL_UPDATE",
        payload: externalUpdate,
      });

      expect(result.past).toHaveLength(0);
      expect(result.present[0].status).toBe("done");
    });
  });
});
