import React from "react";

const ActivityStats = ({ stats }) => {
  const statCards = [
    {
      title: "Total Activities",
      value: stats.total || 0,
      icon: "📊",
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
    },
    {
      title: "Call Logs",
      value: stats.callLogs || 0,
      icon: "📞",
      color: "bg-gradient-to-br from-green-500 to-green-600",
    },
    {
      title: "Meetings",
      value: stats.meetings || 0,
      icon: "🤝",
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
    },
    {
      title: "Notes",
      value: stats.notes || 0,
      icon: "📝",
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
    },
    {
      title: "Emails",
      value: stats.emails || 0,
      icon: "✉️",
      color: "bg-gradient-to-br from-pink-500 to-pink-600",
    },
    {
      title: "Recent (7 days)",
      value: stats.recentActivities || 0,
      icon: "⏱️",
      color: "bg-gradient-to-br from-indigo-500 to-indigo-600",
    },
    {
      title: "Pending Follow-ups",
      value: stats.pendingFollowUps || 0,
      icon: "🔔",
      color: "bg-gradient-to-br from-red-500 to-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4 mb-6">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className={`${stat.color} text-white rounded-xl p-3 md:p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
        >
          <div className="flex flex-col items-center text-center">
            <div className="text-2xl md:text-3xl mb-1 md:mb-2">{stat.icon}</div>
            <div className="text-xl md:text-2xl font-bold mb-1">
              {stat.value}
            </div>
            <div className="text-xs md:text-sm opacity-90 font-medium">
              {stat.title}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityStats;
