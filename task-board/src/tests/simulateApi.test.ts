import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  simulateApiCall,
  simulateFastApiCall,
  sleep,
} from "../utils/simulateApi";

describe("simulateApi", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── simulateApiCall ──
  describe("simulateApiCall", () => {
    it("should resolve after 2 seconds", async () => {
      // Mock Math.random to always succeed
      vi.spyOn(Math, "random").mockReturnValue(0.5);

      const promise = simulateApiCall();
      vi.advanceTimersByTime(2000);

      await expect(promise).resolves.toBeUndefined();
    });

    it("should reject when random value is below failure rate", async () => {
      // Force failure — random returns 0.05 which is below 0.1 failureRate
      vi.spyOn(Math, "random").mockReturnValue(0.05);

      const promise = simulateApiCall();
      vi.advanceTimersByTime(2000);

      await expect(promise).rejects.toThrow("Simulated API failure");
    });

    it("should succeed when random value is above failure rate", async () => {
      // Force success — random returns 0.5 which is above 0.1 failureRate
      vi.spyOn(Math, "random").mockReturnValue(0.5);

      const promise = simulateApiCall();
      vi.advanceTimersByTime(2000);

      await expect(promise).resolves.toBeUndefined();
    });

    it("should not resolve before 2 seconds", async () => {
      vi.spyOn(Math, "random").mockReturnValue(0.5);

      let resolved = false;
      simulateApiCall().then(() => {
        resolved = true;
      });

      vi.advanceTimersByTime(1999);
      expect(resolved).toBe(false); // not yet

      vi.advanceTimersByTime(1);
      await Promise.resolve();
      expect(resolved).toBe(true); // now resolved
    });

    it("should accept custom failure rate", async () => {
      // With 100% failure rate it should always reject
      vi.spyOn(Math, "random").mockReturnValue(0.5);

      const promise = simulateApiCall(1.0); // 100% failure
      vi.advanceTimersByTime(2000);

      await expect(promise).rejects.toThrow();
    });
  });

  // ── simulateFastApiCall ──
  describe("simulateFastApiCall", () => {
    it("should resolve after 500ms", async () => {
      vi.spyOn(Math, "random").mockReturnValue(0.5);

      const promise = simulateFastApiCall();
      vi.advanceTimersByTime(500);

      await expect(promise).resolves.toBeUndefined();
    });

    it("should not resolve before 500ms", async () => {
      vi.spyOn(Math, "random").mockReturnValue(0.5);

      let resolved = false;
      simulateFastApiCall().then(() => {
        resolved = true;
      });

      vi.advanceTimersByTime(499);
      expect(resolved).toBe(false);
    });
  });

  // ── sleep ──
  describe("sleep", () => {
    it("should resolve after given milliseconds", async () => {
      let resolved = false;
      sleep(1000).then(() => {
        resolved = true;
      });

      vi.advanceTimersByTime(999);
      expect(resolved).toBe(false);

      vi.advanceTimersByTime(1);
      await Promise.resolve();
      expect(resolved).toBe(true);
    });

    it("should resolve immediately with 0ms", async () => {
      const promise = sleep(0);
      vi.advanceTimersByTime(0);
      await expect(promise).resolves.toBeUndefined();
    });
  });
});
