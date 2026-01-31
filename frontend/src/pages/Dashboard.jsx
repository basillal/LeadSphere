import React, { useEffect, useState } from "react";
import {
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

  const [timeRange, setTimeRange] = useState("all_time");

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
        const params = startDate ? { startDate, endDate } : {};

        const stats = await dashboardService.getStats(params);
        setData(stats);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [timeRange]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-1">
          {title}
        </p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </div>
      <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
        <span className="text-2xl">{icon}</span>
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

  return (
    <div className="p-4 md:p-6 w-full max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Here's what's happening in your business today.
        </p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-700">
          Business Overview
        </h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-black focus:border-black block p-2.5"
        >
          <option value="all_time">All Time</option>
          <option value="this_month">This Month</option>
          <option value="this_year">This Year</option>
          <option value="last_30_days">Last 30 Days</option>
        </select>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(data.counts.revenue)}
          icon="💰"
          color="bg-green-100 text-green-600"
        />
        <StatCard
          title="Pending Revenue"
          value={formatCurrency(data.counts.pendingRevenue)}
          icon="⏳"
          color="bg-yellow-100 text-yellow-600"
        />
        <StatCard
          title="Conversion Rate"
          value={`${data.counts.conversionRate}%`}
          icon="📈"
          color="bg-indigo-100 text-indigo-600"
        />
        <StatCard
          title="Total Leads"
          value={data.counts.leads}
          icon="👥"
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Active Services"
          value={data.counts.services}
          icon="⚡"
          color="bg-purple-100 text-purple-600"
        />
        <StatCard
          title="Pending Tasks"
          value={data.counts.pendingActivities}
          icon="📅"
          color="bg-orange-100 text-orange-600"
        />
      </div>

      {/* Advanced Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Trend - Area Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Revenue Trend (Last 12 Months)
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.charts.revenueTrend || []}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="_id"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("default", {
                    month: "short",
                    year: "2-digit",
                  });
                }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Area
                type="monotone"
                dataKey="totalRevenue"
                stroke="#10B981"
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
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
