import React, { useState } from "react";

const StatsWrapper = ({ children, title = "Statistics" }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const mobileChildren = React.isValidElement(children)
    ? React.cloneElement(children, { mobileMode: true })
    : children;

  return (
    <>
      {/* Mobile/Small Screen Collapse/Expand Trigger Button */}
      <div className="md:hidden flex justify-end mb-4 px-2 no-print">
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black border border-gray-200 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-all font-light text-sm shadow-sm hover:shadow-md cursor-pointer group"
        >
          <span className="text-base group-hover:scale-110 transition-transform duration-200">📊</span>
          <span>View Overview</span>
        </button>
      </div>

      {/* Inline Stats section for Tablet / Desktop (md and up) */}
      {/* We apply a scale and padding adjustment on smaller viewports (md to lg) to "reduce the size on all pages" */}
      <div className="hidden md:block w-full transition-all duration-300 transform-gpu md:scale-[0.97] lg:scale-100 origin-center">
        {children}
      </div>

      {/* Full-screen Overlay when Expanded on Mobile/Small Screen */}
      {isExpanded && (
        <div className="fixed inset-0 z-[9999] md:hidden bg-slate-50 overflow-y-auto flex flex-col no-print animate-fade-in">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center z-10 shadow-sm">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-black uppercase tracking-wider">
                {title}
              </h3>
              <p className="text-[10px] sm:text-xs text-gray-500 font-light mt-0.5">
                Overview of key metrics
              </p>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-2 bg-gray-100 text-black hover:bg-gray-200 rounded-full transition-all active:scale-95 cursor-pointer"
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
          <div className="flex-1 p-4 sm:p-6 space-y-4">
            <div className="text-[10px] sm:text-xs text-gray-400 font-light uppercase tracking-wider mb-2">
              Metrics Dashboard
            </div>
            <div className="stats-modal-content overflow-x-hidden">
              {mobileChildren}
            </div>
          </div>

          {/* Bottom Sticky Action/Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex justify-end">
            <button
              onClick={() => setIsExpanded(false)}
              className="w-full px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 active:bg-black transition-all font-light text-sm uppercase tracking-wider text-center cursor-pointer"
            >
              Close Overview
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default StatsWrapper;
