export type Status = "todo" | "in-progress" | "done";
export type Priority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  assignee: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isOptimistic?: boolean;
}

export interface FilterState {
  search: string;
  assignee: string;
  priority: Priority | "";
}

export type TaskAction =
  | { type: "ADD_TASK"; payload: Task }
  | { type: "UPDATE_TASK"; payload: Partial<Task> & { id: string } }
  | { type: "ROLLBACK_TASK"; payload: Task }
  | { type: "APPLY_EXTERNAL_UPDATE"; payload: Task }
  | { type: "DELETE_TASK"; payload: string }
  | { type: "UNDO" }
  | { type: "REDO" };

export interface HistoryState {
  past: Task[][];
  present: Task[];
  future: Task[][];
}

export interface TaskContextValue {
  tasks: Task[];
  filters: FilterState;
  canUndo: boolean;
  canRedo: boolean;
  dispatch: React.Dispatch<TaskAction>;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

export interface Column {
  id: Status;
  label: string;
  color: string;
}
