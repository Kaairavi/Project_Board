"use client";
import { useState } from "react";
import { createPortal } from "react-dom";

import { useEffect } from "react";
import { AlertTriangle, CheckCircle, X } from "lucide-react";

type ConfirmDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "success";
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
}: ConfirmDialogProps) {
  const [show, setShow] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      const timer = setTimeout(() => setShow(false), 300); // match duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);


  if (!show) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4
    transition-all duration-300 ease-out
    ${isOpen
          ? "bg-black/60 backdrop-blur-sm opacity-100"
          : "bg-black/0 backdrop-blur-0 opacity-0"
        }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`relative w-full max-w-md rounded-2xl bg-white shadow-xl border border-slate-200
  transform transition-all duration-300 ease-out
  ${isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4"
          }`}
      >  {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>

        <div className="p-6">
          {/* Icon and title */}
          <div className="flex items-start gap-4 mb-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${variant === "danger"
                  ? "bg-red-100 text-red-600"
                  : variant === "warning"
                    ? "bg-amber-100 text-amber-600"
                    : "bg-emerald-100 text-emerald-600"
                }`}
            >
              {variant === "success" ? (
                <CheckCircle className="h-6 w-6" strokeWidth={2} />
              ) : (
                <AlertTriangle className="h-6 w-6" strokeWidth={2} />
              )}
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <h3
                id="confirm-title"
                className="text-lg font-semibold text-slate-900"
              >
                {title}
              </h3>
            </div>
          </div>

          {/* Description */}
          <p
            id="confirm-description"
            className="text-sm text-slate-600 mb-6 ml-16"
          >
            {description}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 ml-16">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            >
              {cancelLabel}
            </button>
            <button
              onClick={handleConfirm}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${variant === "danger"
                  ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                  : variant === "warning"
                    ? "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500"
                    : "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
                }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
    , document.body);
}
