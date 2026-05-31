import React from "react";

const ActivityStats = ({ stats, onStatClick, mobileMode = false }) => {
  const statCards = [
    {
      title: "Total Activities",
      value: stats.total || 0,
      icon: "📊",
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      filter: null,
    },
    {
      title: "Today's Activities",
      value: stats.todaysActivities || 0,
      icon: "📅",
      color: "bg-gradient-to-br from-cyan-500 to-cyan-600",
      filter: "today",
    },
    {
      title: "Overdue",
      value: stats.overdueActivities || 0,
      icon: "⚠️",
      color: "bg-gradient-to-br from-red-500 to-red-600",
      filter: "overdue",
    },
    {
      title: "Call Logs",
      value: stats.callLogs || 0,
      icon: "📞",
      color: "bg-gradient-to-br from-green-500 to-green-600",
      filter: null,
    },
    {
      title: "Meetings",
      value: stats.meetings || 0,
      icon: "🤝",
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      filter: null,
    },
    {
      title: "Notes",
      value: stats.notes || 0,
      icon: "📝",
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      filter: null,
    },
    {
      title: "Emails",
      value: stats.emails || 0,
      icon: "✉️",
      color: "bg-gradient-to-br from-pink-500 to-pink-600",
      filter: null,
    },
    {
      title: "Recent (7 days)",
      value: stats.recentActivities || 0,
      icon: "⏱️",
      color: "bg-gradient-to-br from-indigo-500 to-indigo-600",
      filter: null,
    },
    {
      title: "Pending Follow-ups",
      value: stats.pendingFollowUps || 0,
      icon: "🔔",
      color: "bg-gradient-to-br from-yellow-500 to-yellow-600",
      filter: null,
    },
  ];

  const accentStyles = {
    blue: { badge: "bg-blue-50 text-blue-600", ring: "ring-blue-100" },
    cyan: { badge: "bg-cyan-50 text-cyan-600", ring: "ring-cyan-100" },
    red: { badge: "bg-rose-50 text-rose-600", ring: "ring-rose-100" },
    green: { badge: "bg-emerald-50 text-emerald-600", ring: "ring-emerald-100" },
    purple: { badge: "bg-violet-50 text-violet-600", ring: "ring-violet-100" },
    orange: { badge: "bg-orange-50 text-orange-600", ring: "ring-orange-100" },
    pink: { badge: "bg-pink-50 text-pink-600", ring: "ring-pink-100" },
    indigo: { badge: "bg-indigo-50 text-indigo-600", ring: "ring-indigo-100" },
    yellow: { badge: "bg-amber-50 text-amber-600", ring: "ring-amber-100" },
  };

  const getAccentForIndex = (index) => {
    const palette = [
      accentStyles.blue,
      accentStyles.cyan,
      accentStyles.red,
      accentStyles.green,
      accentStyles.purple,
      accentStyles.orange,
      accentStyles.pink,
      accentStyles.indigo,
      accentStyles.yellow,
    ];
    return palette[index % palette.length];
  };

  const gridClass = mobileMode
    ? "flex flex-nowrap gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1"
    : "hidden md:flex md:flex-nowrap gap-3 mb-6 overflow-x-auto scrollbar-hide pb-1";

  return (
    <div className={gridClass}>
      {statCards.map((stat, index) => (
        <div
          key={index}
          onClick={() => stat.filter && onStatClick && onStatClick(stat.filter)}
          className={`group bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 ${stat.filter ? "cursor-pointer hover:-translate-y-0.5" : ""} ${mobileMode ? "min-w-[160px] flex-shrink-0" : "min-w-[170px] flex-1"}`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ring-1 ${getAccentForIndex(index).badge} ${getAccentForIndex(index).ring}`}
            >
              <span className="text-base sm:text-lg">{stat.icon}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-none">
                {stat.value}
              </div>
              <div className="mt-1 text-[10px] sm:text-[11px] uppercase tracking-[0.16em] font-semibold text-slate-500 leading-tight">
                {stat.title}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityStats;
