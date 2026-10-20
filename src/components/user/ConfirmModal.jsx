import React, { useEffect } from "react";

const ConfirmModal = ({ open, title, message, confirmLabel, onConfirm, onCancel }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title || message}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-lg bg-white p-6 text-center shadow-xl"
      >
        {title && <h2 className="text-sm font-bold text-[#17324D]">{title}</h2>}
        <p className={`text-sm text-slate-600 ${title ? "mt-2" : ""}`}>{message}</p>

        <div className="mt-5 flex justify-center gap-3">
          <button
            type="button"
            autoFocus
            onClick={onCancel}
            className="rounded-md border border-[#2563EB] bg-white px-5 py-1.5 text-sm font-semibold text-[#2563EB] hover:bg-blue-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md bg-[#2563EB] px-5 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;