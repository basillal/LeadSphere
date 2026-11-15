import React from "react";

const FollowUpStats = ({ stats, mobileMode = false }) => {
  const totalTasks = stats?.total || 0;
  const pendingPercentage =
    totalTasks > 0 ? Math.round(((stats?.pending || 0) / totalTasks) * 100) : 0;
  const completedPercentage =
    totalTasks > 0 ? Math.round(((stats?.completed || 0) / totalTasks) * 100) : 0;

  const cards = [
    {
      title: "Total Follow-ups",
      value: stats?.total || 0,
      meta: "All time records",
      iconBg: "bg-[#FFF1EB]",
      iconColor: "text-[var(--primary)]",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
    {
      title: "Pending Actions",
      value: stats?.pending || 0,
      meta: `${pendingPercentage}% of total`,
      iconBg: "bg-[#FEF3C7]",
      iconColor: "text-[#D97706]",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Completed",
      value: stats?.completed || 0,
      meta: `${completedPercentage}% resolved`,
      iconBg: "bg-[#DCFCE7]",
      iconColor: "text-[#16A34A]",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    {
      title: "Missed / Overdue",
      value: stats?.missed || 0,
      meta: (stats?.missed || 0) > 0 ? "Requires follow-up" : "All up to date",
      iconBg: "bg-[#FEE2E2]",
      iconColor: "text-[#DC2626]",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
  ];

  return (
    <div
      className={
        mobileMode
          ? "grid grid-cols-2 gap-2.5 mb-4"
          : "grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5"
      }
    >
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="bg-white border border-[#F0F0F0] rounded-[20px] p-3.5 sm:p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-semibold tracking-[0.08em] uppercase text-[#8B92A5]">
              {card.title}
            </span>
            <div className={`w-8 h-8 rounded-full ${card.iconBg} ${card.iconColor} flex items-center justify-center flex-shrink-0`}>
              {card.icon}
            </div>
          </div>
          <div>
            <div className="text-[18px] sm:text-[20px] font-bold text-[#111827] leading-none mb-1">
              {card.value}
            </div>
            <p className="text-[9.5px] font-medium text-[#64748B] m-0">
              {card.meta}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FollowUpStats;
