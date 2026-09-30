"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, Info, AlertTriangle, AlertCircle, X, Sparkles } from "lucide-react";

export type ToastType = "success" | "info" | "warning" | "error";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

// Global dispatcher using CustomEvent for instant access across the entire app
export const toast = {
  success(titleOrMessage: string, detailOrSubtitle?: string, duration = 3400) {
    dispatchToast("success", titleOrMessage, detailOrSubtitle, duration);
  },
  info(titleOrMessage: string, detailOrSubtitle?: string, duration = 3400) {
    dispatchToast("info", titleOrMessage, detailOrSubtitle, duration);
  },
  warning(titleOrMessage: string, detailOrSubtitle?: string, duration = 4000) {
    dispatchToast("warning", titleOrMessage, detailOrSubtitle, duration);
  },
  error(titleOrMessage: string, detailOrSubtitle?: string, duration = 4500) {
    dispatchToast("error", titleOrMessage, detailOrSubtitle, duration);
  },
};

function dispatchToast(type: ToastType, titleOrMessage: string, detailOrSubtitle?: string, duration = 3400) {
  if (typeof window === "undefined") return;

  const title = detailOrSubtitle ? titleOrMessage : (type === "success" ? "Updated Successfully" : "Notice");
  const message = detailOrSubtitle ? detailOrSubtitle : titleOrMessage;

  const item: ToastItem = {
    id: "toast-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
    type,
    title,
    message,
    duration,
  };

  window.dispatchEvent(new CustomEvent("eml-toast", { detail: item }));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    function onToast(e: Event) {
      const customEvent = e as CustomEvent<ToastItem>;
      if (!customEvent.detail) return;

      const newToast = customEvent.detail;
      setToasts(prev => [newToast, ...prev.slice(0, 4)]); // Keep max 5

      if (newToast.duration && newToast.duration > 0) {
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== newToast.id));
        }, newToast.duration);
      }
    }

    window.addEventListener("eml-toast", onToast);
    return () => window.removeEventListener("eml-toast", onToast);
  }, []);

  function handleDismiss(id: string) {
    setToasts(prev => prev.filter(t => t.id !== id));
  }

  if (toasts.length === 0) return null;

  return (
    <div className="toast-viewport" role="region" aria-label="Notifications">
      {toasts.map(t => {
        const isSuccess = t.type === "success";
        const isInfo = t.type === "info";
        const isWarning = t.type === "warning";
        const isError = t.type === "error";

        return (
          <div
            key={t.id}
            className={`toast-card toast-${t.type}`}
            onClick={() => handleDismiss(t.id)}
            role="alert"
          >
            <div className="toast-icon">
              {isSuccess && <CheckCircle2 size={18} style={{ color: "#10B981" }} />}
              {isInfo && <Info size={18} style={{ color: "#38BDF8" }} />}
              {isWarning && <AlertTriangle size={18} style={{ color: "#F59E0B" }} />}
              {isError && <AlertCircle size={18} style={{ color: "#EF4444" }} />}
            </div>

            <div className="toast-content">
              <div className="toast-title">{t.title}</div>
              {t.message && <div className="toast-message">{t.message}</div>}
            </div>

            <button
              className="toast-close-btn"
              onClick={e => {
                e.stopPropagation();
                handleDismiss(t.id);
              }}
              title="Dismiss"
            >
              <X size={14} />
            </button>

            <div
              className="toast-progress"
              style={{ animationDuration: `${(t.duration || 3400) / 1000}s` }}
            />
          </div>
        );
      })}
    </div>
  );
}
