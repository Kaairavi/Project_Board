"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "./ConfirmDialog";

export type DeleteButtonVariant = "icon" | "button";

type DeleteButtonProps = {
  /** Called when user confirms delete. Return or throw; caller can refresh after. */
  onConfirm: () => Promise<void>;
  /** Short label for the button (e.g. "Delete") when variant is "button" */
  label?: string;
  /** Dialog title (e.g. "Delete project?") */
  confirmTitle?: string;
  /** Dialog message (e.g. "This cannot be undone.") */
  confirmDescription?: string;
  variant?: DeleteButtonVariant;
  className?: string;
  disabled?: boolean;
  /** Accessible name for icon-only button */
  ariaLabel?: string;
};

const defaultConfirmTitle = "Are you sure?";
const defaultConfirmDescription = "This action cannot be undone.";

export function DeleteButton({
  onConfirm,
  label = "Delete",
  confirmTitle = defaultConfirmTitle,
  confirmDescription = defaultConfirmDescription,
  variant = "icon",
  className = "",
  disabled = false,
  ariaLabel = "Delete",
}: DeleteButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setShowDialog(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  const isIcon = variant === "icon";

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || loading}
        aria-label={isIcon ? ariaLabel : undefined}
        title={isIcon ? ariaLabel : undefined}
        className={`
          relative inline-flex items-center justify-center gap-2 rounded-lg
          text-red-600 hover:text-red-700 hover:bg-red-50
          focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
          disabled:opacity-50 disabled:pointer-events-none
          transition-colors
          ${isIcon ? "p-2" : "px-3 py-2 text-sm font-medium"}
          ${className}
        `}
      >
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" aria-hidden />
        ) : (
          <>
            <Trash2 className={isIcon ? "h-4 w-4" : "h-4 w-4 shrink-0"} strokeWidth={2} aria-hidden />
            {!isIcon && <span>{label}</span>}
          </>
        )}
      </button>
      <ConfirmDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onConfirm={handleConfirm}
        title={confirmTitle}
        description={confirmDescription}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
      />
    </>
  );
}
