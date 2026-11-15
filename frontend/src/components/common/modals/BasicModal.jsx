import React, { useEffect } from "react";
import { createPortal } from "react-dom";

const BasicModal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "max-w-md",
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-sm transition-opacity font-inter">
      {/* Backdrop click to close */}
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        className={`relative bg-white border border-gray-100 rounded-[24px] shadow-2xl w-full ${maxWidth} flex flex-col max-h-[85vh] max-h-[85dvh] overflow-hidden animate-in fade-in zoom-in-95 duration-200`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 py-4 border-b border-gray-100 bg-white">
          <div>
            <h3 className="text-[14px] font-semibold text-gray-900 m-0" id="modal-title">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[10px] text-gray-500 m-0 mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div
          className="flex-1 px-6 py-4 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default BasicModal;
