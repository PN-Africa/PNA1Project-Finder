import React, { useEffect, useRef, useState } from "react";
import { FiMoreHorizontal } from "react-icons/fi";

const formatSize = (bytes) =>
  bytes >= 1024 * 1024
    ? (bytes / (1024 * 1024)).toFixed(1) + " MB"
    : Math.max(1, Math.round(bytes / 1024)) + " KB";

const FileMenu = ({ file, submitted, onReplace, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const ext = file.name.split(".").pop().toUpperCase();

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const view = () => {
    const url = URL.createObjectURL(file);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    setOpen(false);
  };

  const download = () => {
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
    setOpen(false);
  };

  const itemClass =
    "block w-full py-1.5 text-left text-xs text-slate-700 hover:text-[#2563EB]";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={`Options for ${file.name}`}
        aria-expanded={open}
        className="p-1 text-slate-500 hover:text-[#2563EB]"
      >
        <FiMoreHorizontal />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-md border border-slate-200 bg-white p-3 shadow-lg">
          <p className="truncate text-xs font-semibold text-[#17324D]">{file.name}</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {ext} • {formatSize(file.size)}
          </p>

          <div className="mt-2 border-t border-slate-100 pt-1">
            <button type="button" className={itemClass} onClick={view}>
              View
            </button>
            <button type="button" className={itemClass} onClick={download}>
              Download
            </button>
            {!submitted && (
              <>
                <button
                  type="button"
                  className={itemClass}
                  onClick={() => {
                    setOpen(false);
                    onReplace();
                  }}
                >
                  Replace
                </button>
                <button
                  type="button"
                  className={`${itemClass} hover:!text-red-600`}
                  onClick={() => {
                    setOpen(false);
                    onDelete();
                  }}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileMenu;