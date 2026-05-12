import { Toaster } from "react-hot-toast";

// ─── Toast Container Component ─────────────────────────────────────────────
/**
 * Global toast container — render this once in App.tsx.
 * All helper functions moved to src/utils/toastHelpers.ts
 */

const ToastContainer: React.FC = () => {
  return (
    <Toaster
      position="bottom-right"
      reverseOrder={false}
      gutter={8}
      containerStyle={{
        bottom: 24,
        right: 24,
      }}
      toastOptions={{
        duration: 3000,
        style: {
          background: "#1e293b",
          color: "#f1f5f9",
          border: "1px solid #334155",
          borderRadius: "12px",
          fontSize: "13px",
          fontWeight: "500",
          padding: "12px 16px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          maxWidth: "380px",
        },
        success: {
          duration: 3000,
          style: {
            background: "#0f2d1f",
            color: "#86efac",
            border: "1px solid #166534",
          },
          iconTheme: {
            primary: "#22c55e",
            secondary: "#0f2d1f",
          },
        },
        error: {
          duration: 5000,
          style: {
            background: "#2d0f0f",
            color: "#fca5a5",
            border: "1px solid #991b1b",
          },
          iconTheme: {
            primary: "#ef4444",
            secondary: "#2d0f0f",
          },
        },
        loading: {
          duration: Infinity,
          style: {
            background: "#1e293b",
            color: "#94a3b8",
            border: "1px solid #334155",
          },
          iconTheme: {
            primary: "#3b82f6",
            secondary: "#1e293b",
          },
        },
      }}
    />
  );
};

export default ToastContainer;
