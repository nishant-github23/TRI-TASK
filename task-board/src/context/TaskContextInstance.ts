import { createContext } from "react";
import type { TaskContextValue } from "../types";

const TaskContext = createContext<TaskContextValue | null>(null);

export default TaskContext;
