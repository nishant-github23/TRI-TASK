export const simulateApiCall = (failureRate = 0.1): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Generate a random number — if below failureRate, reject
      if (Math.random() < failureRate) {
        reject(new Error("Simulated API failure — please try again"));
      } else {
        resolve();
      }
    }, 2000); // 2 second delay
  });
};

// ─── Simulate a Faster API Call (for non-critical updates) ────────────────

/**
 * Faster version with 500ms delay
 * Used for search/filter operations that don't need full delay
 */

export const simulateFastApiCall = (failureRate = 0.05): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < failureRate) {
        reject(new Error("Simulated API failure"));
      } else {
        resolve();
      }
    }, 500);
  });
};

// ─── Sleep Utility ─────────────────────────────────────────────────────────

/**
 * Simple sleep/delay utility
 * Usage: await sleep(1000) — waits 1 second
 */

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
