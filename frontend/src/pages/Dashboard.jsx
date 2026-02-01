import React, { useEffect, useState } from "react";
import {
  ComposedChart,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import dashboardService from "../services/dashboardService";
import { useAuth } from "../components/auth/AuthProvider";

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    counts: {
      leads: 0,
      contacts: 0,
      services: 0,
      activities: 0,
      pendingActivities: 0,
      revenue: 0,
      conversionRate: 0,
    },
    charts: {
      leadsByStatus: [],
      activitiesByType: [],
      topServices: [],
      leadsBySource: [],
    },
    recentActivities: [],
    recentLeads: [],
  });

  const [timeRange, setTimeRange] = useState("last_30_days"); // Default to Last 30 Days
  const [revenueInterval, setRevenueInterval] = useState("daily"); // Default daily for Revenue Trend

  const getDateRange = (range) => {
    const today = new Date();
    const endDate = today.toISOString();
    let startDate = null;

    if (range === "this_month") {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      startDate = start.toISOString();
    } else if (range === "this_year") {
      const start = new Date(today.getFullYear(), 0, 1);
      startDate = start.toISOString();
    } else if (range === "last_30_days") {
      const start = new Date();
      start.setDate(today.getDate() - 30);
      startDate = start.toISOString();
    }
    // "all_time" returns null startDate
    return { startDate, endDate };
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const { startDate, endDate } = getDateRange(timeRange);

        // Build params
        const params = {
          revenueInterval,
        };

        if (startDate) {
          params.startDate = startDate;
          params.endDate = endDate;
        }

        const stats = await dashboardService.getStats(params);
        setData(stats);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [timeRange, revenueInterval]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const HeroCard = ({ title, value, icon, iconColor, bgColor, isDark }) => (
    <div
      className={`p-6 rounded-2xl ${isDark ? "bg-gradient-to-br from-gray-900 to-black text-white shadow-xl" : "bg-white shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100"} transition-all hover:-translate-y-1 hover:shadow-lg relative overflow-hidden`}
    >
      {isDark && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
      )}
      <div className="flex items-center gap-5 relative z-10">
        <div
          className={`p-4 rounded-2xl ${bgColor} ${iconColor} flex items-center justify-center`}
        >
          <span className="text-3xl">{icon}</span>
        </div>
        <div>
          <p
            className={`text-xs font-bold tracking-widest uppercase mb-1 ${isDark ? "text-gray-400" : "text-gray-400"}`}
          >
            {title}
          </p>
          <h3
            className={`text-3xl font-bold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}
          >
            {value}
          </h3>
        </div>
      </div>
    </div>
  );

  const CompactStat = ({ title, value, icon, color }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:bg-gray-50 transition-colors">
      <div className={`p-2 rounded-lg ${color} bg-opacity-10 text-xl`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
          {title}
        </p>
        <h3 className="text-lg font-bold text-gray-700">{value}</h3>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  // Safety check if data is malformed
  if (!data || !data.counts) {
    return (
      <div className="flex justify-center items-center h-screen flex-col">
        <h2 className="text-xl font-bold text-gray-800">
          Something went wrong
        </h2>
        <p className="text-gray-500 mt-2">
          Failed to load dashboard statistics.
        </p>
      </div>
    );
  }

  // Calculate Net Profit
  const netProfit =
    (data.counts.revenue || 0) - (data.counts.totalExpenses || 0);

  return (
    <div className="p-4 md:p-6 w-full max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Here's what's happening in your business today.
          </p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-black focus:border-black block p-2.5 min-w-[150px]"
        >
          <option value="last_30_days">Last 30 Days</option>
          <option value="this_month">This Month</option>
          <option value="this_year">This Year</option>
          <option value="all_time">All Time</option>
        </select>
      </div>

      {/* Hero Stats Grid - Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <HeroCard
          title="Total Revenue"
          value={formatCurrency(data.counts.revenue)}
          icon="💰"
          iconColor="text-emerald-600"
          bgColor="bg-emerald-50"
        />
        <HeroCard
          title="Total Pending"
          value={formatCurrency(data.counts.pendingRevenue)}
          icon="⏳"
          iconColor="text-orange-600"
          bgColor="bg-orange-50"
        />
        <HeroCard
          title="Total Expenses"
          value={formatCurrency(data.counts.totalExpenses || 0)}
          icon="💸"
          iconColor="text-rose-600"
          bgColor="bg-rose-50"
        />
      </div>

      {/* Net Profit Section - Full Width Compact Design */}
      <div className="mb-8 w-full bg-white border border-gray-200 shadow-sm p-4 rounded-xl relative overflow-hidden transition-all hover:shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-xl ${netProfit >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}
            >
              <span className="text-2xl">🏦</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="text-[10px] font-bold tracking-widest uppercase text-gray-400">
                  Net Profit
                </h2>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${netProfit >= 0 ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-red-50 border-red-100 text-red-600"}`}
                >
                  {netProfit >= 0 ? "PROFIT" : "LOSS"}
                </span>
              </div>
              <h3
                className={`text-2xl font-bold tracking-tight ${netProfit >= 0 ? "text-gray-900" : "text-red-600"}`}
              >
                {formatCurrency(netProfit)}
              </h3>
            </div>
          </div>

          <div className="flex gap-6 text-right bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
            <div>
              <p className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">
                Revenue
              </p>
              <p className="font-semibold text-gray-900">
                {formatCurrency(data.counts.revenue)}
              </p>
            </div>
            <div className="w-px bg-gray-200"></div>
            <div>
              <p className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">
                Expenses
              </p>
              <p className="font-semibold text-gray-900">
                {formatCurrency(data.counts.totalExpenses || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <CompactStat
          title="Total Leads"
          value={data.counts.leads}
          icon="👥"
          color="text-blue-600 bg-blue-100"
        />
        <CompactStat
          title="Active Services"
          value={data.counts.services}
          icon="⚡"
          color="text-purple-600 bg-purple-100"
        />
        <CompactStat
          title="Invoices"
          value={data.counts.invoices || 0}
          icon="🧾"
          color="text-teal-600 bg-teal-100"
        />
        <CompactStat
          title="Users"
          value={data.counts.users || 0}
          icon="👤"
          color="text-pink-600 bg-pink-100"
        />
        <CompactStat
          title="Conversion"
          value={`${data.counts.conversionRate}%`}
          icon="📈"
          color="text-indigo-600 bg-indigo-100"
        />
        <CompactStat
          title="Pending Tasks"
          value={data.counts.pendingActivities}
          icon="📅"
          color="text-orange-600 bg-orange-100"
        />
      </div>

      {/* Advanced Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Financial Overview - Combined Chart */}
        <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">
              Financial Overview
            </h3>
            <select
              value={revenueInterval}
              onChange={(e) => setRevenueInterval(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-black focus:border-black block p-1.5"
            >
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data.charts.financialTrend || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="_id"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => {
                  if (revenueInterval === "yearly") return value;
                  const date = new Date(value);
                  if (revenueInterval === "daily") {
                    return date.toLocaleDateString("default", {
                      day: "numeric",
                      month: "short",
                    });
                  }
                  return date.toLocaleDateString("default", {
                    month: "short",
                    year: "2-digit",
                  });
                }}
                interval={revenueInterval === "daily" ? 2 : 0}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) =>
                  new Intl.NumberFormat("en-IN", {
                    notation: "compact",
                    compactDisplay: "short",
                  }).format(value)
                }
              />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                labelFormatter={(value) => {
                  const date = new Date(value);
                  if (revenueInterval === "yearly") return value;
                  return date.toLocaleDateString("default", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  });
                }}
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Legend iconType="circle" />
              <Bar
                dataKey="totalRevenue"
                name="Revenue"
                fill="#10B981"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
              <Bar
                dataKey="totalExpenses"
                name="Expenses"
                fill="#EF4444"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
              <Line
                type="monotone"
                dataKey="totalPending"
                name="Pending"
                stroke="#EAB308"
                strokeWidth={3}
                dot={{ r: 4, fill: "#EAB308" }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secondary Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Leads by Status - Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Leads Distribution
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.charts.leadsByStatus}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="count"
                nameKey="_id"
              >
                {data.charts.leadsByStatus.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Services */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Top Performing Services
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            {data.charts.topServices && data.charts.topServices.length > 0 ? (
              <BarChart
                data={data.charts.topServices}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="_id"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  width={100}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ borderRadius: "8px" }}
                />
                <Bar
                  dataKey="totalRevenue"
                  fill="#10B981"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                />
              </BarChart>
            ) : (
              <div className="flex justify-center items-center h-full text-gray-400">
                No data available
              </div>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Lead Sources & Recent Leads Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Leads by Source - Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Lead Sources</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.charts.leadsBySource}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                nameKey="_id"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {data.charts.leadsBySource &&
                  data.charts.leadsBySource.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Leads List */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80 overflow-hidden flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Leads</h3>
          <div className="overflow-y-auto flex-grow pr-2">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.recentLeads && data.recentLeads.length > 0 ? (
                  data.recentLeads.map((lead) => (
                    <tr key={lead._id}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {lead.name}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            lead.status === "Won"
                              ? "bg-green-100 text-green-800"
                              : lead.status === "New"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        {lead.source}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-3 py-4 text-center text-sm text-gray-500"
                    >
                      No recent leads
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Activities List (Moved to bottom grid) */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80 overflow-hidden flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Recent Activity
          </h3>
          <div className="overflow-y-auto flex-grow pr-2 space-y-4">
            {data.recentActivities.length === 0 ? (
              <p className="text-center text-gray-400 text-sm mt-10">
                No recent activities
              </p>
            ) : (
              data.recentActivities.map((activity) => (
                <div
                  key={activity._id}
                  className="flex gap-3 items-start pb-3 border-b border-gray-50 last:border-0"
                >
                  <div
                    className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                      activity.status === "Completed"
                        ? "bg-green-500"
                        : activity.status === "Scheduled"
                          ? "bg-blue-500"
                          : "bg-gray-300"
                    }`}
                  ></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">
                      {activity.title}{" "}
                      <span className="text-gray-400 font-normal">
                        ({activity.activityType})
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {activity.description
                        ? activity.description
                        : "No details provided"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {activity.relatedId?.name || "Unknown"} •{" "}
                      {new Date(activity.activityDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
