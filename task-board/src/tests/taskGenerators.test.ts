import { describe, it, expect } from "vitest";
import {
  mockTasks,
  generateTask,
  generateTasks,
  generateExternalUpdate,
  ASSIGNEE_LIST,
  TAGS_LIST,
  STATUSES,
  PRIORITIES,
} from "../utils/taskGenerators";

describe("taskGenerators", () => {
  // ── mockTasks ──
  describe("mockTasks", () => {
    it("should have at least 20 tasks", () => {
      expect(mockTasks.length).toBeGreaterThanOrEqual(20);
    });

    it("should have all required fields on every task", () => {
      mockTasks.forEach((task) => {
        expect(task).toHaveProperty("id");
        expect(task).toHaveProperty("title");
        expect(task).toHaveProperty("description");
        expect(task).toHaveProperty("status");
        expect(task).toHaveProperty("priority");
        expect(task).toHaveProperty("assignee");
        expect(task).toHaveProperty("tags");
        expect(task).toHaveProperty("createdAt");
        expect(task).toHaveProperty("updatedAt");
      });
    });

    it("should have valid status values on all tasks", () => {
      mockTasks.forEach((task) => {
        expect(STATUSES).toContain(task.status);
      });
    });

    it("should have valid priority values on all tasks", () => {
      mockTasks.forEach((task) => {
        expect(PRIORITIES).toContain(task.priority);
      });
    });

    it("should have unique ids", () => {
      const ids = mockTasks.map((t) => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(mockTasks.length);
    });

    it("should have tasks spread across all three statuses", () => {
      const statuses = mockTasks.map((t) => t.status);
      expect(statuses).toContain("todo");
      expect(statuses).toContain("in-progress");
      expect(statuses).toContain("done");
    });

    it("should have isOptimistic set to false by default", () => {
      mockTasks.forEach((task) => {
        expect(task.isOptimistic).toBe(false);
      });
    });
  });

  // ── generateTask ──
  describe("generateTask", () => {
    it("should generate a task with all required fields", () => {
      const task = generateTask();

      expect(task.id).toBeTruthy();
      expect(task.title).toBeTruthy();
      expect(task.description).toBeTruthy();
      expect(task.status).toBeTruthy();
      expect(task.priority).toBeTruthy();
      expect(task.assignee).toBeTruthy();
      expect(Array.isArray(task.tags)).toBe(true);
    });

    it("should generate task with valid status", () => {
      const task = generateTask();
      expect(STATUSES).toContain(task.status);
    });

    it("should generate task with valid priority", () => {
      const task = generateTask();
      expect(PRIORITIES).toContain(task.priority);
    });

    it("should generate task with valid assignee", () => {
      const task = generateTask();
      expect(ASSIGNEE_LIST).toContain(task.assignee);
    });

    it("should generate task with tags from TAGS_LIST", () => {
      const task = generateTask();
      task.tags.forEach((tag) => {
        expect(TAGS_LIST).toContain(tag);
      });
    });

    it("should respect overrides", () => {
      const task = generateTask({
        title: "Custom Title",
        status: "done",
        priority: "high",
        assignee: "John Doe",
      });

      expect(task.title).toBe("Custom Title");
      expect(task.status).toBe("done");
      expect(task.priority).toBe("high");
      expect(task.assignee).toBe("John Doe");
    });

    it("should generate unique ids each time", () => {
      const task1 = generateTask();
      const task2 = generateTask();
      expect(task1.id).not.toBe(task2.id);
    });

    it("should set isOptimistic to false by default", () => {
      const task = generateTask();
      expect(task.isOptimistic).toBe(false);
    });
  });

  // ── generateTasks ──
  describe("generateTasks", () => {
    it("should generate exact number of tasks requested", () => {
      expect(generateTasks(10)).toHaveLength(10);
      expect(generateTasks(100)).toHaveLength(100);
      expect(generateTasks(1000)).toHaveLength(1000);
    });

    it("should generate tasks with unique ids", () => {
      const tasks = generateTasks(100);
      const ids = tasks.map((t) => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(100);
    });

    it("should return empty array for count of 0", () => {
      expect(generateTasks(0)).toHaveLength(0);
    });

    it("should generate 1000 tasks efficiently", () => {
      const start = performance.now();
      generateTasks(1000);
      const end = performance.now();

      // Should complete in under 1 second
      expect(end - start).toBeLessThan(1000);
    });
  });

  // ── generateExternalUpdate ──
  describe("generateExternalUpdate", () => {
    it("should return task with same id", () => {
      const original = generateTask({ id: "test-id-123" });
      const updated = generateExternalUpdate(original);
      expect(updated.id).toBe("test-id-123");
    });

    it("should have valid status after update", () => {
      const original = generateTask();
      const updated = generateExternalUpdate(original);
      expect(STATUSES).toContain(updated.status);
    });

    it("should have valid priority after update", () => {
      const original = generateTask();
      const updated = generateExternalUpdate(original);
      expect(PRIORITIES).toContain(updated.priority);
    });

    it("should update the updatedAt timestamp", () => {
      const original = generateTask({
        updatedAt: "2024-01-01T00:00:00Z",
      });
      const updated = generateExternalUpdate(original);
      expect(updated.updatedAt).not.toBe("2024-01-01T00:00:00Z");
    });

    it("should set isOptimistic to false", () => {
      const original = generateTask({ isOptimistic: true });
      const updated = generateExternalUpdate(original);
      expect(updated.isOptimistic).toBe(false);
    });

    it("should preserve other fields like title and assignee", () => {
      const original = generateTask({
        title: "Keep This Title",
        assignee: "John Doe",
        tags: ["bug", "urgent"],
      });
      const updated = generateExternalUpdate(original);

      expect(updated.title).toBe("Keep This Title");
      expect(updated.assignee).toBe("John Doe");
      expect(updated.tags).toEqual(["bug", "urgent"]);
    });
  });

  // ── Constants ──
  describe("Constants", () => {
    it("ASSIGNEE_LIST should have at least 5 members", () => {
      expect(ASSIGNEE_LIST.length).toBeGreaterThanOrEqual(5);
    });

    it("TAGS_LIST should have at least 5 tags", () => {
      expect(TAGS_LIST.length).toBeGreaterThanOrEqual(5);
    });

    it("STATUSES should contain exactly todo, in-progress, done", () => {
      expect(STATUSES).toContain("todo");
      expect(STATUSES).toContain("in-progress");
      expect(STATUSES).toContain("done");
      expect(STATUSES).toHaveLength(3);
    });

    it("PRIORITIES should contain exactly low, medium, high", () => {
      expect(PRIORITIES).toContain("low");
      expect(PRIORITIES).toContain("medium");
      expect(PRIORITIES).toContain("high");
      expect(PRIORITIES).toHaveLength(3);
    });
  });
});
