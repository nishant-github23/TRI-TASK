import React, { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task, Priority, Status } from "../../types";

// ─── Props ─────────────────────────────────────────────────────────────────

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

// ─── Priority Config ───────────────────────────────────────────────────────

const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; color: string; dot: string }
> = {
  high: {
    label: "High",
    color: "bg-red-500/10 text-red-400 border-red-500/30",
    dot: "bg-red-400",
  },
  medium: {
    label: "Medium",
    color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    dot: "bg-yellow-400",
  },
  low: {
    label: "Low",
    color: "bg-green-500/10 text-green-400 border-green-500/30",
    dot: "bg-green-400",
  },
};

// ─── Status Config ─────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<Status, { color: string }> = {
  todo: { color: "border-l-gray-500" },
  "in-progress": { color: "border-l-blue-500" },
  done: { color: "border-l-green-500" },
};

// ─── Format Date Helper ────────────────────────────────────────────────────

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// ─── Get Initials Helper ───────────────────────────────────────────────────

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// ─── Avatar Color based on name ───────────────────────────────────────────

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-orange-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-indigo-500",
  "bg-rose-500",
];

const getAvatarColor = (name: string): string => {
  const index =
    name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

// ─── TaskCard Component ────────────────────────────────────────────────────
/**
 * Individual task card rendered inside each board column.
 *
 * Performance:
 * - Wrapped in React.memo with custom comparison
 * - Only re-renders when task.updatedAt changes
 * - This prevents all cards from re-rendering when
 *   an unrelated task is updated
 */

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
  // ─── DnD Kit sortable hook ───────────────────────────────────────────
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const statusConfig = STATUS_CONFIG[task.status];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative bg-gray-800 border border-gray-700 rounded-xl p-4
        border-l-4 ${statusConfig.color}
        ${
          isDragging
            ? "opacity-50 shadow-2xl scale-105 z-50 cursor-grabbing"
            : "hover:border-gray-600 hover:shadow-lg cursor-grab"
        }
        ${task.isOptimistic ? "opacity-70 animate-pulse" : ""}
        transition-all duration-200
      `}
      {...attributes}
      {...listeners}
      aria-label={`Task: ${task.title}`}
      role="article"
    >
      {/* ── Optimistic loading overlay ── */}
      {task.isOptimistic && (
        <div className="absolute top-2 right-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping" />
        </div>
      )}

      {/* ── Priority Badge ── */}
      <div className="flex items-center justify-between mb-3">
        <span
          className={`
            inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 
            rounded-full border ${priorityConfig.color}
          `}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig.dot}`} />
          {priorityConfig.label}
        </span>

        {/* Action buttons — visible on hover */}
        <div
          className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          // Stop drag from triggering when clicking buttons
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 
                       rounded-lg transition-colors"
            aria-label={`Edit task: ${task.title}`}
            title="Edit task"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 
                       rounded-lg transition-colors"
            aria-label={`Delete task: ${task.title}`}
            title="Delete task"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* ── Title ── */}
      <h3
        className={`
          text-sm font-semibold text-gray-100 mb-1.5 leading-snug
          ${task.status === "done" ? "line-through text-gray-400" : ""}
        `}
      >
        {task.title}
      </h3>

      {/* ── Description ── */}
      <p className="text-xs text-gray-400 mb-3 leading-relaxed line-clamp-2">
        {task.description}
      </p>

      {/* ── Tags ── */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-md"
            >
              #{tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="text-xs text-gray-500">
              +{task.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* ── Footer: Assignee + Date ── */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-700/50">
        {/* Assignee Avatar */}
        <div className="flex items-center gap-2">
          <div
            className={`
              w-6 h-6 rounded-full flex items-center justify-center 
              text-white text-xs font-bold ${getAvatarColor(task.assignee)}
            `}
            title={task.assignee}
            aria-label={`Assigned to ${task.assignee}`}
          >
            {getInitials(task.assignee)}
          </div>
          <span className="text-xs text-gray-400 truncate max-w-[100px]">
            {task.assignee}
          </span>
        </div>

        {/* Created Date */}
        <span className="text-xs text-gray-500">
          {formatDate(task.createdAt)}
        </span>
      </div>
    </div>
  );
};

// ─── Memoization ───────────────────────────────────────────────────────────
/**
 * Custom comparison — only re-render if task data actually changed.
 * Comparing updatedAt is sufficient since we always update it on changes.
 * This prevents 999 cards from re-rendering when 1 task is updated.
 */

export default memo(TaskCard, (prev, next) => {
  return (
    prev.task.updatedAt === next.task.updatedAt &&
    prev.task.isOptimistic === next.task.isOptimistic &&
    prev.onEdit === next.onEdit &&
    prev.onDelete === next.onDelete
  );
});
