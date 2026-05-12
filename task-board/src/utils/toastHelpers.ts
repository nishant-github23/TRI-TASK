import toast from "react-hot-toast";

export const toastExternalUpdate = (
  taskTitle: string,
  userName: string,
  change: string,
) => {
  toast(
    `👤 ${userName} updated "${taskTitle.slice(0, 25)}${taskTitle.length > 25 ? "..." : ""}"\n${change}`,
    {
      duration: 4500,
      icon: "🔄",
      style: {
        background: "#1e1b4b",
        color: "#c7d2fe",
        border: "1px solid #3730a3",
        borderRadius: "12px",
        fontSize: "13px",
        maxWidth: "380px",
      },
    },
  );
};

export const toastUndo = (actionDescription: string) => {
  toast(`↩️ Undid: ${actionDescription}`, {
    duration: 2500,
    style: {
      background: "#1c1917",
      color: "#d6d3d1",
      border: "1px solid #44403c",
      borderRadius: "12px",
      fontSize: "13px",
    },
  });
};

// Show when redo is performed
export const toastRedo = (actionDescription: string) => {
  toast(`↪️ Redid: ${actionDescription}`, {
    duration: 2500,
    style: {
      background: "#1c1917",
      color: "#d6d3d1",
      border: "1px solid #44403c",
      borderRadius: "12px",
      fontSize: "13px",
    },
  });
};

// Show when drag and drop status change occurs
export const toastStatusChange = (taskTitle: string, newStatus: string) => {
  const statusEmoji: Record<string, string> = {
    todo: "📋",
    "in-progress": "⚙️",
    done: "✅",
  };

  toast.success(
    `${statusEmoji[newStatus] ?? "📌"} "${taskTitle.slice(0, 25)}${taskTitle.length > 25 ? "..." : ""}" moved to ${newStatus}`,
    { duration: 2500 },
  );
};

// Show conflict warning
export const toastConflict = (taskTitle: string) => {
  toast(
    `⚠️ Conflict detected on "${taskTitle.slice(0, 25)}${taskTitle.length > 25 ? "..." : ""}". External changes were applied.`,
    {
      duration: 5000,
      icon: "⚠️",
      style: {
        background: "#2d1f0f",
        color: "#fcd34d",
        border: "1px solid #92400e",
        borderRadius: "12px",
        fontSize: "13px",
        maxWidth: "380px",
      },
    },
  );
};
