import React from "react";

const ConfirmModal = ({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-xl">
        {title && (
          <h2 className="mb-1 text-lg font-semibold text-slate-900">{title}</h2>
        )}
        <p className="mb-6 text-sm text-slate-600">{message}</p>

        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="w-28 rounded-lg border border-[#2563EB] py-2 text-sm font-semibold text-[#2563EB] transition hover:bg-blue-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="w-28 rounded-lg bg-[#2563EB] py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;