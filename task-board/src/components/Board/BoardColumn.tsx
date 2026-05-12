import React, { useRef, useCallback, memo } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useVirtualizer } from "@tanstack/react-virtual";
import TaskCard from "../Task/TaskCard";
import { useFilteredTasks } from "../../hooks/useFilteredTasks";
import type { Status, Task } from "../../types";

interface BoardColumnProps {
  status: Status;
  label: string;
  color: string;
  accentColor: string;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const COLUMN_ICONS: Record<Status, string> = {
  todo: "📋",
  "in-progress": "⚙️",
  done: "✅",
};

const BoardColumn: React.FC<BoardColumnProps> = ({
  status,
  label,
  color,
  accentColor,
  onEditTask,
  onDeleteTask,
}) => {
  const tasks = useFilteredTasks(status);

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({ id: status });

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // ✅ Stable ref — merged scroll container + droppable
  const setScrollAndDropRef = useCallback(
    (node: HTMLDivElement | null) => {
      scrollContainerRef.current = node;
      setDroppableRef(node);
    },
    [setDroppableRef],
  );

  // ✅ Stable callbacks
  const estimateSize = useCallback(() => 180, []);
  const getScrollElement = useCallback(() => scrollContainerRef.current, []);

  const virtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement,
    estimateSize,
    overscan: 3,
    gap: 10,
  });

  const handleEdit = useCallback(
    (task: Task) => onEditTask(task),
    [onEditTask],
  );
  const handleDelete = useCallback(
    (taskId: string) => onDeleteTask(taskId),
    [onDeleteTask],
  );

  return (
    <div
      className="flex flex-col bg-gray-900 rounded-2xl border border-gray-800 
                 min-w-[300px] max-w-[360px] flex-1 h-[calc(100vh-180px)]"
    >
      {/* ── Column Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <span className="text-base">{COLUMN_ICONS[status]}</span>
          <h2 className={`text-sm font-bold ${color}`}>{label}</h2>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${accentColor}`}
        >
          {tasks.length}
        </span>
      </div>

      {/* ── Droppable + Scrollable area ── */}
      <div
        ref={setScrollAndDropRef}
        style={{
          height: "100%",
          contain: "strict",
          willChange: "scroll-position",
        }}
        className={`overflow-y-auto overflow-x-hidden p-3
                   transition-colors duration-200 rounded-b-2xl
                   ${
                     isOver
                       ? "bg-blue-500/5 border-2 border-blue-500/30 border-dashed"
                       : "border-2 border-transparent"
                   }`}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.length === 0 && (
            <div
              className="flex flex-col items-center justify-center h-40 
                           text-gray-600 text-sm gap-2"
            >
              <span className="text-3xl opacity-30">
                {COLUMN_ICONS[status]}
              </span>
              <p>No tasks here</p>
              <p className="text-xs text-gray-700">
                Drag tasks here or create one
              </p>
            </div>
          )}

          {tasks.length > 0 && (
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                position: "relative",
              }}
            >
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const task = tasks[virtualItem.index];
                return (
                  <div
                    key={task.id}
                    style={{
                      position: "absolute",
                      top: virtualItem.start,
                      left: 0,
                      right: 0,
                      height: `${virtualItem.size}px`,
                      paddingBottom: "10px",
                      transform: "translateZ(0)",
                    }}
                  >
                    <TaskCard
                      task={task}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
};

export default memo(BoardColumn);
