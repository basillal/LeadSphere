import React from "react";

const LeadStats = ({ stats, mobileMode = false }) => {
  const statList = [
    {
      title: "Total",
      value: stats?.total || 0,
      iconBg: "bg-[#FFF1EB]",
      iconColor: "text-[var(--primary)]",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
        </svg>
      ),
    },
    {
      title: "Converted",
      value: stats?.converted || 0,
      iconBg: "bg-[#DCFCE7]",
      iconColor: "text-[#16A34A]",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "New",
      value: stats?.new || 0,
      iconBg: "bg-[#F1F5F9]",
      iconColor: "text-[#334155]",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      title: "Pending",
      value: stats?.pending || 0,
      iconBg: "bg-[#FEF3C7]",
      iconColor: "text-[#D97706]",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "In Progress",
      value: stats?.inProgress || 0,
      iconBg: "bg-[#EFF6FF]",
      iconColor: "text-[#2563EB]",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: "On Hold",
      value: stats?.onHold || 0,
      iconBg: "bg-[#FFF7ED]",
      iconColor: "text-[#EA580C]",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Completed",
      value: stats?.completed || 0,
      iconBg: "bg-[#ECFDF5]",
      iconColor: "text-[#059669]",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    {
      title: "Lost",
      value: stats?.lost || 0,
      iconBg: "bg-[#FEE2E2]",
      iconColor: "text-[#DC2626]",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div
      className={
        mobileMode
          ? "grid grid-cols-2 gap-2 mb-4"
          : "grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 mb-5"
      }
    >
      {statList.map((item, idx) => (
        <div
          key={idx}
          className="bg-white border border-[#F0F0F0] rounded-[18px] p-3 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-sm transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-semibold tracking-[0.08em] uppercase text-[#8B92A5] truncate">
              {item.title}
            </span>
            <div
              className={`w-6 h-6 rounded-full ${item.iconBg} ${item.iconColor} flex items-center justify-center flex-shrink-0`}
            >
              {item.icon}
            </div>
          </div>
          <span className="text-[17px] font-bold text-[#111827] leading-none">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default LeadStats;
