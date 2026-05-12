import React, { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { ASSIGNEE_LIST, TAGS_LIST } from "../../utils/taskGenerators";
import type { Task, Priority, Status } from "../../types";

// ─── Props ─────────────────────────────────────────────────────────────────

interface TaskFormProps {
  initialValues?: Task; // if provided, form is in edit mode
  onSubmit: (task: Task) => void;
  onCancel: () => void;
}

// ─── Form State ────────────────────────────────────────────────────────────

interface FormState {
  title: string;
  description: string;
  assignee: string;
  priority: Priority;
  status: Status;
  tags: string[];
}

// ─── Validation Errors ─────────────────────────────────────────────────────

interface FormErrors {
  title?: string;
  description?: string;
  assignee?: string;
}

// ─── TaskForm Component ────────────────────────────────────────────────────

const TaskForm: React.FC<TaskFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
}) => {
  const isEditMode = !!initialValues;

  // ─── Form State ──────────────────────────────────────────────────────
  const [form, setForm] = useState<FormState>({
    title: initialValues?.title ?? "",
    description: initialValues?.description ?? "",
    assignee: initialValues?.assignee ?? "",
    priority: initialValues?.priority ?? "medium",
    status: initialValues?.status ?? "todo",
    tags: initialValues?.tags ?? [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [tagInput, setTagInput] = useState("");

  // ─── Validation ───────────────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.title.trim()) {
      newErrors.title = "Title is required";
    } else if (form.title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    } else if (form.title.trim().length > 100) {
      newErrors.title = "Title must be less than 100 characters";
    }

    if (!form.description.trim()) {
      newErrors.description = "Description is required";
    } else if (form.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    if (!form.assignee) {
      newErrors.assignee = "Please select an assignee";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Handle field change ──────────────────────────────────────────────
  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));

      // Clear error on change
      if (errors[name as keyof FormErrors]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    },
    [errors],
  );

  // ─── Handle tag addition ──────────────────────────────────────────────
  const handleAddTag = useCallback(
    (tag: string) => {
      const trimmed = tag.trim().toLowerCase();
      if (trimmed && !form.tags.includes(trimmed) && form.tags.length < 5) {
        setForm((prev) => ({ ...prev, tags: [...prev.tags, trimmed] }));
      }
      setTagInput("");
    },
    [form.tags],
  );

  // ─── Handle tag input keydown ─────────────────────────────────────────
  const handleTagKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        handleAddTag(tagInput);
      }
    },
    [tagInput, handleAddTag],
  );

  // ─── Remove tag ───────────────────────────────────────────────────────
  const handleRemoveTag = useCallback((tag: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  }, []);

  // ─── Handle form submit ───────────────────────────────────────────────
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!validate()) return;

      const now = new Date().toISOString();

      const task: Task = {
        id: initialValues?.id ?? uuidv4(),
        title: form.title.trim(),
        description: form.description.trim(),
        assignee: form.assignee,
        priority: form.priority,
        status: form.status,
        tags: form.tags,
        createdAt: initialValues?.createdAt ?? now,
        updatedAt: now,
        isOptimistic: false,
      };

      onSubmit(task);
    },
    [form, initialValues, onSubmit, validate],
  );

  // ─── Input class helper ───────────────────────────────────────────────
  const inputClass = (hasError: boolean) => `
    w-full bg-gray-800 border ${hasError ? "border-red-500" : "border-gray-700"}
    text-gray-100 placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm
    focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
    transition-colors
  `;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* ── Title ── */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-300 mb-1.5"
        >
          Title <span className="text-red-400">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={form.title}
          onChange={handleChange}
          placeholder="Enter task title..."
          className={inputClass(!!errors.title)}
          aria-describedby={errors.title ? "title-error" : undefined}
          aria-required="true"
          autoFocus
        />
        {errors.title && (
          <p id="title-error" className="mt-1 text-xs text-red-400">
            {errors.title}
          </p>
        )}
      </div>

      {/* ── Description ── */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-300 mb-1.5"
        >
          Description <span className="text-red-400">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Describe the task in detail..."
          rows={3}
          className={`${inputClass(!!errors.description)} resize-none`}
          aria-describedby={errors.description ? "desc-error" : undefined}
          aria-required="true"
        />
        {errors.description && (
          <p id="desc-error" className="mt-1 text-xs text-red-400">
            {errors.description}
          </p>
        )}
      </div>

      {/* ── Assignee ── */}
      <div>
        <label
          htmlFor="assignee"
          className="block text-sm font-medium text-gray-300 mb-1.5"
        >
          Assignee <span className="text-red-400">*</span>
        </label>
        <select
          id="assignee"
          name="assignee"
          value={form.assignee}
          onChange={handleChange}
          className={inputClass(!!errors.assignee)}
          aria-describedby={errors.assignee ? "assignee-error" : undefined}
          aria-required="true"
        >
          <option value="">Select assignee...</option>
          {ASSIGNEE_LIST.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        {errors.assignee && (
          <p id="assignee-error" className="mt-1 text-xs text-red-400">
            {errors.assignee}
          </p>
        )}
      </div>

      {/* ── Priority + Status Row ── */}
      <div className="grid grid-cols-2 gap-4">
        {/* Priority */}
        <div>
          <label
            htmlFor="priority"
            className="block text-sm font-medium text-gray-300 mb-1.5"
          >
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className={inputClass(false)}
          >
            <option value="low">🟢 Low</option>
            <option value="medium">🟡 Medium</option>
            <option value="high">🔴 High</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-300 mb-1.5"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            value={form.status}
            onChange={handleChange}
            className={inputClass(false)}
          >
            <option value="todo">📋 Todo</option>
            <option value="in-progress">⚙️ In Progress</option>
            <option value="done">✅ Done</option>
          </select>
        </div>
      </div>

      {/* ── Tags ── */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Tags{" "}
          <span className="text-gray-500 font-normal">(optional, max 5)</span>
        </label>

        {/* Selected tags */}
        {form.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {form.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 bg-blue-500/10 
                           border border-blue-500/30 text-blue-400 text-xs 
                           px-2.5 py-1 rounded-full"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-blue-200 transition-colors ml-0.5"
                  aria-label={`Remove tag ${tag}`}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Tag input */}
        {form.tags.length < 5 && (
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="Type a tag and press Enter or comma..."
            className={inputClass(false)}
            aria-label="Add tag"
          />
        )}

        {/* Quick tag suggestions */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {TAGS_LIST.filter((tag) => !form.tags.includes(tag))
            .slice(0, 6)
            .map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleAddTag(tag)}
                className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-400 
                         hover:text-gray-200 px-2 py-0.5 rounded-md 
                         transition-colors"
                aria-label={`Add tag ${tag}`}
              >
                +{tag}
              </button>
            ))}
        </div>
      </div>

      {/* ── Form Actions ── */}
      <div className="flex gap-3 pt-2 border-t border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 
                     hover:text-white text-sm font-medium py-2.5 px-4 
                     rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm 
                     font-medium py-2.5 px-4 rounded-lg transition-colors
                     focus:outline-none focus:ring-2 focus:ring-blue-500 
                     focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          {isEditMode ? "💾 Save Changes" : "✨ Create Task"}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
