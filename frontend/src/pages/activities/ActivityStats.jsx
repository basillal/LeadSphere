import React from "react";

const ActivityStats = ({ stats = {}, onStatClick, mobileMode = false }) => {
  const statCards = [
    {
      title: "Total Activities",
      value: stats?.total || 0,
      iconBg: "bg-[#FFF1EB]",
      iconColor: "text-[var(--primary)]",
      filter: null,
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      title: "Today's",
      value: stats?.todaysActivities || 0,
      iconBg: "bg-[#DCFCE7]",
      iconColor: "text-[#16A34A]",
      filter: "today",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: "Overdue",
      value: stats?.overdueActivities || 0,
      iconBg: "bg-[#FEE2E2]",
      iconColor: "text-[#DC2626]",
      filter: "overdue",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    {
      title: "Call Logs",
      value: stats?.callLogs || 0,
      iconBg: "bg-[#EFF6FF]",
      iconColor: "text-[#2563EB]",
      filter: null,
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
    },
    {
      title: "Meetings",
      value: stats?.meetings || 0,
      iconBg: "bg-[#F3E8FF]",
      iconColor: "text-[#7E22CE]",
      filter: null,
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      title: "Notes",
      value: stats?.notes || 0,
      iconBg: "bg-[#FEF3C7]",
      iconColor: "text-[#D97706]",
      filter: null,
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
    {
      title: "Emails",
      value: stats?.emails || 0,
      iconBg: "bg-[#ECFDF5]",
      iconColor: "text-[#059669]",
      filter: null,
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: "Recent 7d",
      value: stats?.recentActivities || 0,
      iconBg: "bg-[#F1F5F9]",
      iconColor: "text-[#475569]",
      filter: null,
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div
      className={
        mobileMode
          ? "grid grid-cols-2 gap-2 mb-4"
          : "grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 mb-5 font-inter"
      }
    >
      {statCards.map((card, idx) => (
        <div
          key={idx}
          onClick={() => card.filter && onStatClick?.(card.filter)}
          className={`bg-white border border-[#F0F0F0] rounded-[18px] p-3 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-sm transition-all flex flex-col justify-between ${
            card.filter ? "cursor-pointer hover:border-gray-300" : ""
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-semibold tracking-[0.08em] uppercase text-[#8B92A5] truncate">
              {card.title}
            </span>
            <div
              className={`w-6 h-6 rounded-full ${card.iconBg} ${card.iconColor} flex items-center justify-center flex-shrink-0`}
            >
              {card.icon}
            </div>
          </div>
          <span className="text-[17px] font-bold text-[#111827] leading-none">
            {card.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ActivityStats;
