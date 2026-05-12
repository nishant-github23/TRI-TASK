import React, { lazy, Suspense } from "react";
import TaskProvider from "./context/TaskContext";
import ToastContainer from "./components/UI/Toast";
import ErrorBoundary from "./components/UI/ErrorBoundary";

// ─── Lazy Loaded Components ────────────────────────────────────────────────
/**
 * Board and FilterBar are lazy loaded because:
 * - Board pulls in @dnd-kit, @tanstack/react-virtual, TaskCard, BoardColumn
 * - FilterBar is UI chrome not needed for first paint
 * Neither is needed before the app shell renders
 */
const Board = lazy(() => import("./components/Board"));
const FilterBar = lazy(() => import("./components/Filters/FilterBar"));

// ─── Skeletons ─────────────────────────────────────────────────────────────

const FilterBarSkeleton: React.FC = () => (
  <div className="bg-gray-900 border-b border-gray-800 px-6 py-3">
    <div className="flex items-center gap-3">
      <div className="h-8 w-64 bg-gray-800 rounded-lg animate-pulse" />
      <div className="h-8 w-32 bg-gray-800 rounded-lg animate-pulse" />
      <div className="h-8 w-32 bg-gray-800 rounded-lg animate-pulse" />
    </div>
  </div>
);

const BoardSkeleton: React.FC = () => (
  <div className="flex gap-6 p-6 h-full">
    {[1, 2, 3].map((col) => (
      <div
        key={col}
        className="flex flex-col bg-gray-900 rounded-2xl border border-gray-800
                   min-w-[300px] max-w-[360px] flex-1 h-full animate-pulse"
      >
        {/* Column header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <div className="h-4 w-24 bg-gray-800 rounded" />
          <div className="h-5 w-8 bg-gray-800 rounded-full" />
        </div>
        {/* Fake cards */}
        <div className="flex flex-col gap-3 p-3">
          {[1, 2, 3].map((card) => (
            <div key={card} className="h-[160px] bg-gray-800 rounded-xl" />
          ))}
        </div>
      </div>
    ))}
  </div>
);

// ─── App Component ─────────────────────────────────────────────────────────
/**
 * Root component that sets up:
 * - ErrorBoundary (catches any runtime errors)
 * - TaskProvider (global state)
 * - ToastContainer (global notifications)
 * - FilterBar (lazy — search + filters + undo/redo)
 * - Board (lazy — main kanban board)
 */

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <TaskProvider>
        {/* ── Global toast notifications ── */}
        <ToastContainer />

        {/* ── Main App Shell ── */}
        <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
          {/* ── Top Navigation Bar ── */}
          <header
            className="bg-gray-900 border-b border-gray-800 
                       px-6 py-3 flex items-center justify-between
                       sticky top-0 z-40"
          >
            {/* Logo + App name */}
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 bg-blue-600 rounded-lg flex items-center 
                           justify-center text-white font-bold text-sm shadow-lg
                           shadow-blue-500/30"
              >
                T
              </div>
              <div>
                <h1 className="text-sm font-bold text-white leading-none">
                  TaskBoard
                </h1>
                <p className="text-xs text-gray-500 leading-none mt-0.5">
                  Project Management
                </p>
              </div>
            </div>

            {/* Right side: status indicators */}
            <div className="flex items-center gap-4">
              {/* Live simulation indicator */}
              <div className="flex items-center gap-2">
                <div className="relative flex h-2 w-2">
                  <span
                    className="animate-ping absolute inline-flex h-full 
                               w-full rounded-full bg-green-400 opacity-75"
                  />
                  <span
                    className="relative inline-flex rounded-full h-2 w-2 
                               bg-green-500"
                  />
                </div>
                <span className="text-xs text-gray-400 hidden sm:block">
                  Live simulation active
                </span>
              </div>

              {/* Keyboard shortcuts hint */}
              <div
                className="hidden md:flex items-center gap-2 text-xs 
                           text-gray-600"
              >
                <kbd
                  className="bg-gray-800 border border-gray-700 text-gray-400 
                             px-1.5 py-0.5 rounded"
                >
                  Ctrl+Z
                </kbd>
                <span>Undo</span>
                <kbd
                  className="bg-gray-800 border border-gray-700 text-gray-400 
                             px-1.5 py-0.5 rounded"
                >
                  Ctrl+⇧+Z
                </kbd>
                <span>Redo</span>
              </div>
            </div>
          </header>

          {/* ── Filter Bar (lazy) ── */}
          <Suspense fallback={<FilterBarSkeleton />}>
            <FilterBar />
          </Suspense>

          {/* ── Main Content ── */}
          <main className="flex-1 overflow-hidden">
            <ErrorBoundary
              fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-400 p-8">
                    <p className="text-4xl mb-4">🗂️</p>
                    <p className="text-lg font-semibold text-white mb-2">
                      Board failed to load
                    </p>
                    <p className="text-sm">Try refreshing the page</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-4 bg-blue-600 hover:bg-blue-500 text-white 
                                 text-sm px-4 py-2 rounded-lg transition-colors"
                    >
                      Refresh Page
                    </button>
                  </div>
                </div>
              }
            >
              {/* ── Board (lazy) ── */}
              <Suspense fallback={<BoardSkeleton />}>
                <Board />
              </Suspense>
            </ErrorBoundary>
          </main>

          {/* ── Footer ── */}
          <footer
            className="bg-gray-900 border-t border-gray-800 
                       px-6 py-2 flex items-center justify-between"
          >
            <p className="text-xs text-gray-600">
              TaskBoard · Built with React 18 + TypeScript + Tailwind
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span>🔄 Real-time updates every 10-15s</span>
              <span>⚡ Virtualized for 1000+ tasks</span>
            </div>
          </footer>
        </div>
      </TaskProvider>
    </ErrorBoundary>
  );
};

export default App;
