import React from "react";

const ContactStats = ({ stats, mobileMode = false }) => {
  const cards = [
    {
      title: "Directory Contacts",
      subtitle: "Total network",
      value: stats?.total || 0,
      iconBg: "bg-[#FFF1EB]",
      iconColor: "text-[var(--primary)]",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      title: "Client Accounts",
      subtitle: "Active customers",
      value: stats?.clients || 0,
      iconBg: "bg-[#DCFCE7]",
      iconColor: "text-[#15803D]",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: "Vendors & Suppliers",
      subtitle: "Service providers",
      value: stats?.vendors || 0,
      iconBg: "bg-[#EFF6FF]",
      iconColor: "text-[#1D4ED8]",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      title: "Channel Partners",
      subtitle: "Strategic alliances",
      value: stats?.partners || 0,
      iconBg: "bg-[#FAF5FF]",
      iconColor: "text-[#7E22CE]",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div
      className={
        mobileMode
          ? "grid grid-cols-2 gap-2.5 mb-3"
          : "grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4"
      }
    >
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="bg-white border border-gray-100 rounded-[18px] p-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-gray-200 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-semibold tracking-[0.08em] uppercase text-[#8B92A5]">
              {card.title}
            </span>
            <div className={`w-7 h-7 rounded-full ${card.iconBg} ${card.iconColor} flex items-center justify-center shrink-0`}>
              {card.icon}
            </div>
          </div>
          <div>
            <div className="text-[18px] sm:text-[20px] font-bold text-gray-900 leading-none mb-1">
              {card.value}
            </div>
            <p className="text-[9.5px] font-medium text-gray-400 m-0">
              {card.subtitle}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactStats;
