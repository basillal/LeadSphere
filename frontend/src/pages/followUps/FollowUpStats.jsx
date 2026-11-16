import React from "react";

const FollowUpStats = ({ stats, mobileMode = false }) => {
  const totalTasks = stats?.total || 0;
  const missedCount = stats?.missed || 0;
  const pendingCount = stats?.pending || 0;
  const completedCount = stats?.completed || 0;

  return (
    <div
      className={
        mobileMode
          ? "grid grid-cols-2 gap-2 mb-2"
          : "grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-2"
      }
    >
      {/* 1. Urgency / Overdue Card */}
      <div
        className={`rounded-[16px] p-2.5 sm:p-3 border transition-all flex flex-col justify-between ${missedCount > 0
            ? "bg-[#FEF2F2] border-[#FECACA] shadow-sm"
            : "bg-white border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
          }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span
            className={`text-[8.5px] font-semibold tracking-[0.08em] uppercase ${missedCount > 0 ? "text-[#DC2626]" : "text-[#8B92A5]"
              }`}
          >
            Overdue Attention
          </span>
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${missedCount > 0
                ? "bg-[#FEE2E2] text-[#DC2626]"
                : "bg-gray-100 text-gray-500"
              }`}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-[16px] sm:text-[18px] font-bold leading-none ${missedCount > 0 ? "text-[#B91C1C]" : "text-gray-900"
                }`}
            >
              {missedCount}
            </span>
            <span
              className={`text-[9px] font-medium ${missedCount > 0 ? "text-[#DC2626]" : "text-gray-500"
                }`}
            >
              {missedCount > 0 ? "urgent" : "up to date"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Pending Follow-ups */}
      <div className="bg-white border border-gray-100 rounded-[16px] p-2.5 sm:p-3 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[8.5px] font-semibold tracking-[0.08em] uppercase text-[#8B92A5]">
            Open Agenda
          </span>
          <div className="w-6 h-6 rounded-full bg-[#FFF1EB] text-[var(--primary)] flex items-center justify-center shrink-0">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[16px] sm:text-[18px] font-bold text-gray-900 leading-none">
              {pendingCount}
            </span>
            <span className="text-[9px] font-medium text-gray-500">
              pending tasks
            </span>
          </div>
        </div>
      </div>

      {/* 3. Completed / Resolved */}
      <div className="bg-white border border-gray-100 rounded-[16px] p-2.5 sm:p-3 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[8.5px] font-semibold tracking-[0.08em] uppercase text-[#8B92A5]">
            Resolved Tasks
          </span>
          <div className="w-6 h-6 rounded-full bg-[#DCFCE7] text-[#15803D] flex items-center justify-center shrink-0">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[16px] sm:text-[18px] font-bold text-[#15803D] leading-none">
              {completedCount}
            </span>
            <span className="text-[9px] font-medium text-gray-500">
              interactions closed
            </span>
          </div>
        </div>
      </div>

      {/* 4. Total Schedule Scope */}
      <div className="bg-white border border-gray-100 rounded-[16px] p-2.5 sm:p-3 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[8.5px] font-semibold tracking-[0.08em] uppercase text-[#8B92A5]">
            Total Interactions
          </span>
          <div className="w-6 h-6 rounded-full bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center shrink-0">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[16px] sm:text-[18px] font-bold text-gray-900 leading-none">
              {totalTasks}
            </span>
            <span className="text-[9px] font-medium text-gray-500">
              scheduled records
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FollowUpStats;
