import React, { useEffect } from "react";

// Toast Component replacement for Snackbar
const Toast = ({ open, message, severity, onClose }) => {
  if (!open) return null;
  const bgClass =
    severity === "error"
      ? "bg-red-50 text-red-800 border-red-200"
      : "bg-green-50 text-green-800 border-green-200";

  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg border ${bgClass} z-50 flex items-center gap-3 animate-slide-in`}
    >
      <span>{message}</span>
      <button onClick={onClose} className="hover:opacity-75 font-bold">
        &times;
      </button>
    </div>
  );
};

export default Toast;
