import { useContext } from "react";
import TaskContext from "./TaskContextInstance";
import type { TaskContextValue } from "../types";

const useTaskContext = (): TaskContextValue => {
  const context = useContext(TaskContext);

  if (!context) {
    throw new Error("useTaskContext must be used inside a <TaskProvider>");
  }

  return context;
};

export default useTaskContext;
