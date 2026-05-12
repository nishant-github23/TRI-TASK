import React, { useState, useCallback, useEffect, lazy, Suspense } from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragOverlay,
} from "@dnd-kit/core";
import type {
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import useTaskContext from "../../context/useTaskContext";
import { useOptimisticUpdate } from "../../hooks/useOptimisticUpdate";
import { useRealTimeSimulation } from "../../hooks/useRealTimeSimulation";
import BoardColumn from "./BoardColumn";
import TaskCard from "../Task/TaskCard";
import type { Task, Status } from "../../types";

// ─── Lazy Loaded Components ────────────────────────────────────────────────
/**
 * TaskModal is lazy loaded because:
 * - It pulls in TaskForm (43.44 KiB) which is only needed when user clicks
 *   "New Task" or "Edit" — never on initial render
 */
const TaskModal = lazy(() => import("../Task/TaskModal"));

// ─── Column Definitions ────────────────────────────────────────────────────

const COLUMNS = [
  {
    id: "todo" as Status,
    label: "To Do",
    color: "text-gray-300",
    accentColor: "bg-gray-700 text-gray-300",
  },
  {
    id: "in-progress" as Status,
    label: "In Progress",
    color: "text-blue-300",
    accentColor: "bg-blue-500/10 text-blue-400",
  },
  {
    id: "done" as Status,
    label: "Done",
    color: "text-green-300",
    accentColor: "bg-green-500/10 text-green-400",
  },
];

// ─── Valid column status ids ───────────────────────────────────────────────

const COLUMN_IDS = ["todo", "in-progress", "done"];

// ─── Modal State Type ──────────────────────────────────────────────────────

interface ModalState {
  isOpen: boolean;
  mode: "create" | "edit";
  task?: Task;
}

// ─── Board Component ───────────────────────────────────────────────────────

const Board: React.FC = () => {
  const { tasks, dispatch, canUndo, canRedo } = useTaskContext();
  const { updateTask, addTask, deleteTask } = useOptimisticUpdate();

  // ─── Start real-time simulation ──────────────────────────────────────
  useRealTimeSimulation(true);

  // ─── Modal state ──────────────────────────────────────────────────────
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    mode: "create",
    task: undefined,
  });

  // ─── Track whether modal has ever been opened ─────────────────────────
  /**
   * We only mount TaskModal after the first open — this prevents Suspense
   * from triggering on initial render while still lazy loading the chunk.
   * Once mounted it stays in the DOM (isOpen controls visibility inside
   * TaskModal itself) so re-opening is instant.
   */
  const [hasModalBeenOpened, setHasModalBeenOpened] = useState(false);

  // ─── Active drag task for DragOverlay ─────────────────────────────────
  const [activeDragTask, setActiveDragTask] = useState<Task | null>(null);

  // ─── DnD Sensors ──────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // ─── Keyboard shortcuts ───────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      // Undo: Ctrl+Z
      if (modifier && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) dispatch({ type: "UNDO" });
      }

      // Redo: Ctrl+Shift+Z or Ctrl+Y
      if (
        (modifier && e.shiftKey && e.key === "z") ||
        (modifier && e.key === "y")
      ) {
        e.preventDefault();
        if (canRedo) dispatch({ type: "REDO" });
      }

      // New task: Alt+N
      if (e.altKey && e.key === "n") {
        e.preventDefault();
        setHasModalBeenOpened(true);
        setModalState({ isOpen: true, mode: "create", task: undefined });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canUndo, canRedo, dispatch]);

  // ─── Drag Start ───────────────────────────────────────────────────────
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const activeTask = tasks.find((t) => t.id === event.active.id);
      if (activeTask) setActiveDragTask(activeTask);
    },
    [tasks],
  );

  // ─── Drag Over ────────────────────────────────────────────────────────
  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeTask = tasks.find((t) => t.id === active.id);
      if (!activeTask) return;

      const overId = String(over.id);
      const overIsColumn = COLUMN_IDS.includes(overId);

      let newStatus: Status;

      if (overIsColumn) {
        newStatus = overId as Status;
      } else {
        const overTask = tasks.find((t) => t.id === overId);
        if (!overTask) return;
        newStatus = overTask.status;
      }

      if (activeTask.status !== newStatus) {
        dispatch({
          type: "UPDATE_TASK",
          payload: { id: activeTask.id, status: newStatus },
        });
      }
    },
    [tasks, dispatch],
  );

  // ─── Drag End ─────────────────────────────────────────────────────────
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveDragTask(null);

      if (!over) return;

      const activeTask = tasks.find((t) => t.id === active.id);
      if (!activeTask) return;

      const overId = String(over.id);
      const overIsColumn = COLUMN_IDS.includes(overId);

      let newStatus: Status;

      if (overIsColumn) {
        newStatus = overId as Status;
      } else {
        const overTask = tasks.find((t) => t.id === overId);
        if (!overTask) return;
        newStatus = overTask.status;
      }

      if (activeTask.status !== newStatus) {
        updateTask(activeTask.id, { status: newStatus });
      }
    },
    [tasks, updateTask],
  );

  // ─── Modal Handlers ───────────────────────────────────────────────────
  const handleOpenCreateModal = useCallback(() => {
    setHasModalBeenOpened(true);
    setModalState({ isOpen: true, mode: "create", task: undefined });
  }, []);

  const handleOpenEditModal = useCallback((task: Task) => {
    setHasModalBeenOpened(true);
    setModalState({ isOpen: true, mode: "edit", task });
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleModalSubmit = useCallback(
    (task: Task) => {
      if (modalState.mode === "create") {
        addTask(task);
      } else {
        updateTask(task.id, task);
      }
      handleCloseModal();
    },
    [modalState.mode, addTask, updateTask, handleCloseModal],
  );

  const handleDeleteTask = useCallback(
    (taskId: string) => {
      if (window.confirm("Are you sure you want to delete this task?")) {
        deleteTask(taskId);
      }
    },
    [deleteTask],
  );

  return (
    <div className="flex flex-col h-full">
      {/* ── Board Toolbar ── */}
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-xl font-bold text-white">🗂️ Task Board</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {tasks.length} tasks · Drag cards to update status
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:block text-xs text-gray-600">
            Press{" "}
            <kbd className="bg-gray-800 border border-gray-700 text-gray-400 px-1.5 py-0.5 rounded text-xs">
              Alt+N
            </kbd>{" "}
            to create
          </span>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500
                       text-white text-sm font-medium px-4 py-2.5 rounded-xl
                       transition-colors shadow-lg shadow-blue-500/20
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       focus:ring-offset-2 focus:ring-offset-gray-950"
            aria-label="Create new task"
          >
            <span className="text-base">+</span>
            New Task
          </button>
        </div>
      </div>

      {/* ── Kanban Columns ── */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 px-6 pb-6 overflow-x-auto flex-1">
          {COLUMNS.map((column) => (
            <BoardColumn
              key={column.id}
              status={column.id}
              label={column.label}
              color={column.color}
              accentColor={column.accentColor}
              onEditTask={handleOpenEditModal}
              onDeleteTask={handleDeleteTask}
            />
          ))}
        </div>

        {/* ── Drag Overlay ── */}
        <DragOverlay dropAnimation={null}>
          {activeDragTask ? (
            <div className="rotate-2 scale-105 opacity-90 shadow-2xl">
              <TaskCard
                task={activeDragTask}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* ── Task Modal (lazy — only mounted after first open) ── */}
      {hasModalBeenOpened && (
        <Suspense fallback={null}>
          <TaskModal
            isOpen={modalState.isOpen}
            mode={modalState.mode}
            task={modalState.task}
            onSubmit={handleModalSubmit}
            onClose={handleCloseModal}
          />
        </Suspense>
      )}
    </div>
  );
};

export default Board;
