import { createContext, useContext, useMemo, useState } from "react";
import { ToastViewport } from "../components/ui/ToastViewport";

const ToastContext = createContext(null);

function createToastId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = (id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const pushToast = ({ title, description, tone = "info" }) => {
    const id = createToastId();
    setToasts((current) => [...current, { id, title, description, tone }]);
    window.setTimeout(() => removeToast(id), 4200);
  };

  const value = useMemo(
    () => ({
      pushToast,
      removeToast,
    }),
    [],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
