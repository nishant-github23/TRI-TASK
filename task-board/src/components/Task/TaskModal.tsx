import React, { useEffect, useCallback } from "react";
import TaskForm from "./TaskForm";
import type { Task } from "../../types";

// ─── Props ─────────────────────────────────────────────────────────────────

interface TaskModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  task?: Task; // provided in edit mode
  onSubmit: (task: Task) => void;
  onClose: () => void;
}

// ─── TaskModal Component ───────────────────────────────────────────────────
/**
 * Modal wrapper around TaskForm.
 *
 * Features:
 * - Accessible modal with focus trap concept
 * - Close on backdrop click
 * - Close on Escape key
 * - Smooth fade + scale animation
 * - Scroll lock on body when open
 * - Responsive (full screen on mobile)
 */

const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  mode,
  task,
  onSubmit,
  onClose,
}) => {
  // ─── Close on Escape key ─────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent background scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  // ─── Close on backdrop click ─────────────────────────────────────────
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Only close if clicking the backdrop itself, not the modal content
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  // ─── Don't render if closed ──────────────────────────────────────────
  if (!isOpen) return null;

  const title = mode === "create" ? "✨ Create New Task" : "✏️ Edit Task";
  const subtitle =
    mode === "create"
      ? "Fill in the details below to create a new task"
      : `Editing: "${task?.title?.slice(0, 40)}${(task?.title?.length ?? 0) > 40 ? "..." : ""}"`;

  return (
    // ── Backdrop ──
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4
                 bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* ── Modal Panel ── */}
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl
                   w-full max-w-lg max-h-[90vh] overflow-y-auto
                   animate-in fade-in zoom-in-95 duration-200"
      >
        {/* ── Modal Header ── */}
        <div
          className="flex items-start justify-between p-6 pb-4 
                        border-b border-gray-800 sticky top-0 
                        bg-gray-900 z-10 rounded-t-2xl"
        >
          <div>
            <h2 id="modal-title" className="text-lg font-bold text-white">
              {title}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 
                       rounded-lg transition-colors ml-4 flex-shrink-0"
            aria-label="Close modal"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* ── Modal Body ── */}
        <div className="p-6">
          <TaskForm
            initialValues={task}
            onSubmit={onSubmit}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
