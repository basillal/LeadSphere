import React from "react";

const ActivityStats = ({ stats = {}, onStatClick, mobileMode = false }) => {
  const channels = [
    {
      id: "all",
      title: "Total Touchpoints",
      value: stats?.total || 0,
      sublabel: `${stats?.recentActivities || 0} in last 7 days`,
      iconBg: "bg-[#FFF1EB]",
      iconColor: "text-[var(--primary)]",
      filter: null,
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      id: "Call",
      title: "Phone Calls",
      value: stats?.callLogs || 0,
      sublabel: "Outreach & logs",
      iconBg: "bg-[#EFF6FF]",
      iconColor: "text-[#2563EB]",
      filter: "Call",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
    },
    {
      id: "Meeting",
      title: "Meetings & Demos",
      value: stats?.meetings || 0,
      sublabel: "Client discussions",
      iconBg: "bg-[#F3E8FF]",
      iconColor: "text-[#7E22CE]",
      filter: "Meeting",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      id: "Email",
      title: "Emails Sent",
      value: stats?.emails || 0,
      sublabel: "Written outreach",
      iconBg: "bg-[#DCFCE7]",
      iconColor: "text-[#16A34A]",
      filter: "Email",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: "overdue",
      title: "Action Required",
      value: stats?.overdueActivities || 0,
      sublabel: "Overdue activities",
      iconBg: "bg-[#FEE2E2]",
      iconColor: "text-[#DC2626]",
      filter: "overdue",
      isAlert: (stats?.overdueActivities || 0) > 0,
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
  ];

  return (
    <div
      className={
        mobileMode
          ? "grid grid-cols-2 gap-2 mb-3 font-inter"
          : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-4 font-inter"
      }
    >
      {channels.map((card, idx) => (
        <div
          key={idx}
          onClick={() => card.filter && onStatClick && onStatClick(card.filter)}
          className={`bg-white p-3 rounded-[18px] border transition-all ${
            card.isAlert
              ? "border-[#FECACA] bg-[#FEF2F2]/40 shadow-sm"
              : "border-gray-100 hover:border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
          } ${card.filter ? "cursor-pointer hover:-translate-y-0.5" : ""}`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider truncate">
              {card.title}
            </span>
            <div
              className={`w-6 h-6 rounded-lg ${card.iconBg} ${card.iconColor} flex items-center justify-center shrink-0`}
            >
              {card.icon}
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-1">
            <span
              className={`text-[17px] font-bold leading-tight ${
                card.isAlert ? "text-[#DC2626]" : "text-gray-900"
              }`}
            >
              {card.value}
            </span>
            <span className="text-[9.5px] text-gray-400 truncate font-medium">
              {card.sublabel}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityStats;
