import React, { useState } from "react";

const StatsWrapper = ({ children, title = "Statistics" }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const mobileChildren = React.isValidElement(children)
    ? React.cloneElement(children, { mobileMode: true })
    : children;

  return (
    <>
      <div className="md:hidden flex justify-end mb-4 px-2 no-print">
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center px-3 py-2.5 rounded-md transition-all min-h-[40px] text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium group cursor-pointer"
        >
          <span className="mr-3 flex items-center justify-center text-base group-hover:scale-110 transition-transform duration-200">📊</span>
          <span className="text-sm whitespace-nowrap truncate">View Overview</span>
        </button>
      </div>

      {/* Inline Stats section for Tablet / Desktop (md and up) */}
      {/* We apply a scale and padding adjustment on smaller viewports (md to lg) to "reduce the size on all pages" */}
      <div className="hidden md:block w-full transition-all duration-300 transform-gpu md:scale-[0.97] lg:scale-100 origin-center">
        {children}
      </div>

      {/* Full-screen Overlay when Expanded on Mobile/Small Screen */}
      {isExpanded && (
        <div className="fixed inset-0 z-[9999] md:hidden bg-gray-900/50 backdrop-blur-sm overflow-y-auto flex flex-col justify-end no-print animate-fade-in">
          {/* Header */}
          <div className="mobile-sheet overflow-hidden mx-2 mb-2">
            <div className="mobile-sheet-handle" />
            <div className="px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center z-10 border-b border-slate-200">
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                {title}
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">
                Overview of key metrics
              </p>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-2 bg-slate-100 text-slate-900 hover:bg-slate-200 rounded-full transition-all active:scale-95 cursor-pointer"
              title="Close Stats"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Stats Content */}
            <div className="flex-1 p-4 sm:p-6 space-y-4 max-h-[72vh] overflow-y-auto">
            <div className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">
              Metrics Dashboard
            </div>
            <div className="stats-modal-content overflow-x-hidden">
              {mobileChildren}
            </div>
          </div>

          {/* Bottom Sticky Action/Footer */}
          <div className="bg-white border-t border-slate-200 px-4 sm:px-6 py-3 sm:py-4 flex justify-end">
            <button
              onClick={() => setIsExpanded(false)}
              className="w-full px-6 py-3 bg-slate-900 text-white rounded-md hover:bg-slate-800 active:bg-slate-900 transition-all font-semibold text-sm uppercase tracking-wider text-center cursor-pointer"
            >
              Close Overview
            </button>
          </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StatsWrapper;
