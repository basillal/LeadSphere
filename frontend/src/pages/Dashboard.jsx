import React, { useEffect, useState } from "react";
import {
  ComposedChart,
  Line,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import dashboardService from "../services/dashboardService";
import { useAuth } from "../components/auth/AuthProvider";
import TimeRangeFilter, { getDateRange } from "../components/common/TimeRangeFilter";

const CHART_COLORS = ["#F54900", "#10B981", "#3B82F6", "#F59E0B", "#8B5CF6", "#06B6D4"];

const HeroCard = ({ title, value, icon, iconBg, iconColor, valueColor = "text-gray-900" }) => (
  <div className="bg-white p-4 rounded-[20px] border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-gray-200 transition-all flex items-center gap-3.5">
    <div className={`w-10 h-10 rounded-[12px] ${iconBg} ${iconColor} flex items-center justify-center text-[16px] shrink-0`}>
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[9.5px] font-semibold text-gray-400 uppercase tracking-wider truncate mb-0.5">
        {title}
      </p>
      <h3 className={`text-[20px] font-bold tracking-tight leading-none ${valueColor}`}>
        {value}
      </h3>
    </div>
  </div>
);

const CompactStat = ({ title, value, icon, iconBg, iconColor }) => (
  <div className="bg-white p-3 rounded-[16px] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-gray-200 transition-all flex items-center gap-2.5">
    <div className={`w-7 h-7 rounded-[8px] ${iconBg} ${iconColor} flex items-center justify-center text-[12px] shrink-0`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider truncate">
        {title}
      </p>
      <p className="text-[14px] font-bold text-gray-900 leading-tight mt-0.5">
        {value}
      </p>
    </div>
  </div>
);

const ChartCard = ({ title, children, action }) => (
  <div className="em-card p-4 rounded-[20px] bg-white border border-gray-100 flex flex-col">
    <div className="flex justify-between items-center pb-3 mb-3 border-b border-gray-100">
      <h4 className="text-[12px] font-semibold text-gray-900">
        {title}
      </h4>
      {action}
    </div>
    <div className="flex-1">{children}</div>
  </div>
);

const CustomTooltip = ({ active, payload, label, formatFn }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-[12px] p-2.5 shadow-lg text-[11px]">
      <p className="font-semibold text-gray-900 mb-1 text-[11px]">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 my-0.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-gray-500">{p.name}:</span>
          <span className="font-bold text-gray-900">{formatFn ? formatFn(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

const Dashboard = () => {
  const { user, selectedOrganization } = useAuth();
  const [data, setData] = useState({
    counts: { leads: 0, contacts: 0, services: 0, activities: 0, pendingActivities: 0, revenue: 0, conversionRate: 0 },
    charts: { leadsByStatus: [], activitiesByType: [], topServices: [], leadsBySource: [], financialTrend: [] },
    recentActivities: [],
    recentLeads: [],
  });

  const [timeRange, setTimeRange] = useState("last_30_days");
  const [revenueInterval, setRevenueInterval] = useState("daily");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { startDate, endDate } = getDateRange(timeRange);
        const params = { revenueInterval };
        if (startDate && endDate) { params.startDate = startDate; params.endDate = endDate; }
        const result = await dashboardService.getStats(params);
        setData(result);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      }
    };
    fetchDashboardData();
  }, [timeRange, revenueInterval, selectedOrganization]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

  if (!data || !data.counts) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-2 text-center">
        <span className="text-2xl">⚠️</span>
        <h2 className="text-[13px] font-semibold text-gray-900">Failed to load statistics</h2>
        <p className="text-[11px] text-gray-400">Please try refreshing or check your connection.</p>
      </div>
    );
  }

  const netProfit = (data.counts.revenue || 0) - (data.counts.totalExpenses || 0);

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-1 px-1">
        <div>
          <h1 className="text-[13px] font-semibold text-gray-900 tracking-tight">
            Welcome back, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-[10.5px] text-gray-400 mt-0.5">
            Real-time business performance, pipeline progress, and key activity metrics.
          </p>
        </div>
        <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <HeroCard
          title="Total Revenue"
          value={formatCurrency(data.counts.revenue)}
          icon="💰"
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          valueColor="text-emerald-700"
        />
        <HeroCard
          title="Pending Amount"
          value={formatCurrency(data.counts.pendingRevenue || 0)}
          icon="⏳"
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          valueColor="text-amber-700"
        />
        <HeroCard
          title="Total Expenses"
          value={formatCurrency(data.counts.totalExpenses || 0)}
          icon="💸"
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
          valueColor="text-rose-700"
        />
      </div>

      {/* Net Profit Banner */}
      <div
        className={`p-3.5 sm:p-4 rounded-[20px] border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
          netProfit >= 0
            ? "bg-emerald-50/50 border-emerald-200"
            : "bg-rose-50/50 border-rose-200"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-[12px] flex items-center justify-center text-[18px] shrink-0 ${
              netProfit >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
            }`}
          >
            🏦
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[9.5px] font-bold text-gray-500 uppercase tracking-wider">
                Net Operating Margin
              </span>
              <span
                className={`inline-flex px-2 py-0.2 rounded-full text-[9px] font-bold border ${
                  netProfit >= 0
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : "bg-rose-100 text-rose-800 border-rose-300"
                }`}
              >
                {netProfit >= 0 ? "PROFIT" : "LOSS"}
              </span>
            </div>
            <h3
              className={`text-[20px] font-black tracking-tight leading-none ${
                netProfit >= 0 ? "text-emerald-800" : "text-rose-800"
              }`}
            >
              {formatCurrency(Math.abs(netProfit))}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white/80 rounded-[12px] px-3.5 py-2 border border-gray-200/70 self-stretch sm:self-auto justify-between sm:justify-end">
          <div className="text-right">
            <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Revenue</p>
            <p className="font-bold text-emerald-600 text-[12px] leading-tight">{formatCurrency(data.counts.revenue)}</p>
          </div>
          <div className="w-[1px] h-6 bg-gray-200" />
          <div className="text-right">
            <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Expenses</p>
            <p className="font-bold text-rose-600 text-[12px] leading-tight">{formatCurrency(data.counts.totalExpenses || 0)}</p>
          </div>
        </div>
      </div>

      {/* Compact Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <CompactStat title="Total Leads" value={data.counts.leads} icon="👥" iconBg="bg-blue-50" iconColor="text-blue-600" />
        <CompactStat title="Services" value={data.counts.services} icon="⚡" iconBg="bg-purple-50" iconColor="text-purple-600" />
        <CompactStat title="Invoices" value={data.counts.invoices || 0} icon="🧾" iconBg="bg-teal-50" iconColor="text-teal-600" />
        <CompactStat title="Users" value={data.counts.users || 0} icon="👤" iconBg="bg-rose-50" iconColor="text-rose-600" />
        <CompactStat title="Conversion" value={`${data.counts.conversionRate || 0}%`} icon="📈" iconBg="bg-orange-50" iconColor="text-[var(--primary)]" />
        <CompactStat title="Pending Tasks" value={data.counts.pendingActivities} icon="📅" iconBg="bg-amber-50" iconColor="text-amber-600" />
      </div>

      {/* Financial Chart */}
      <ChartCard
        title="Financial Overview"
        action={
          <select
            value={revenueInterval}
            onChange={(e) => setRevenueInterval(e.target.value)}
            className="h-[28px] px-2.5 border border-gray-200 rounded-[8px] text-[10px] font-semibold bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-900"
          >
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        }
      >
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data.charts.financialTrend || []} margin={{ top: 8, right: 8, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis
                dataKey="_id"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9.5, fill: "#9CA3AF" }}
                tickFormatter={(value) => {
                  if (revenueInterval === "yearly") return value;
                  const date = new Date(value);
                  return revenueInterval === "daily"
                    ? date.toLocaleDateString("default", { day: "numeric", month: "short" })
                    : date.toLocaleDateString("default", { month: "short", year: "2-digit" });
                }}
                interval={revenueInterval === "daily" ? 2 : 0}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9.5, fill: "#9CA3AF" }}
                tickFormatter={(v) => new Intl.NumberFormat("en-IN", { notation: "compact", compactDisplay: "short" }).format(v)}
              />
              <Tooltip
                content={<CustomTooltip formatFn={formatCurrency} />}
                labelFormatter={(v) => {
                  if (revenueInterval === "yearly") return v;
                  return new Date(v).toLocaleDateString("default", { day: "numeric", month: "long", year: "numeric" });
                }}
              />
              <Bar dataKey="totalRevenue" name="Revenue" fill="#10B981" radius={[4, 4, 0, 0]} barSize={16} />
              <Bar dataKey="totalExpenses" name="Expenses" fill="#F43F5E" radius={[4, 4, 0, 0]} barSize={16} />
              <Line type="monotone" dataKey="totalPending" name="Pending" stroke="#F54900" strokeWidth={2.5} dot={{ r: 3, fill: "#F54900" }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-center items-center gap-4 mt-2">
          {[{ label: "Revenue", color: "#10B981" }, { label: "Expenses", color: "#F43F5E" }, { label: "Pending", color: "#F54900" }].map((l) => (
            <span key={l.label} className="inline-flex items-center gap-1.5 text-[10px] text-gray-500 font-medium">
              <span className="w-2.5 h-2.5 rounded-[3px] inline-block" style={{ background: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
      </ChartCard>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Lead Distribution */}
        <ChartCard title="Lead Stage Distribution">
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.charts.leadsByStatus}
                  cx="50%" cy="50%"
                  innerRadius={50} outerRadius={75}
                  paddingAngle={3}
                  dataKey="count" nameKey="_id"
                >
                  {data.charts.leadsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="bg-white border border-gray-200 rounded-[10px] p-2 shadow-md text-[11px]">
                      <p className="font-semibold text-gray-900">{payload[0].name}</p>
                      <p className="text-gray-500">Count: <strong>{payload[0].value}</strong></p>
                    </div>
                  );
                }} />
                <Legend wrapperStyle={{ fontSize: "10px", paddingTop: "6px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Lead Sources */}
        <ChartCard title="Lead Acquisition Channels">
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.charts.leadsBySource}
                  cx="50%" cy="50%"
                  outerRadius={75}
                  dataKey="count" nameKey="_id"
                >
                  {data.charts.leadsBySource?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="bg-white border border-gray-200 rounded-[10px] p-2 shadow-md text-[11px]">
                      <p className="font-semibold text-gray-900">{payload[0].name}</p>
                      <p className="text-gray-500">Count: <strong>{payload[0].value}</strong></p>
                    </div>
                  );
                }} />
                <Legend wrapperStyle={{ fontSize: "10px", paddingTop: "6px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Bottom Grid: Recent Leads & Activities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Recent Leads */}
        <ChartCard title="Recent Inquiries">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[10.5px]">
              <thead>
                <tr className="border-b border-gray-100 text-[9px] text-[#8B92A5] uppercase tracking-[0.08em] font-semibold whitespace-nowrap select-none">
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Source</th>
                  <th className="py-2.5 px-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.recentLeads && data.recentLeads.length > 0 ? (
                  data.recentLeads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-2 px-3 font-semibold text-gray-900 whitespace-nowrap">{lead.name}</td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center justify-center whitespace-nowrap px-2 py-0.5 rounded-full text-[8.5px] font-semibold border ${
                          lead.status === "Won" || lead.status === "Converted"
                            ? "bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]"
                            : lead.status === "New"
                              ? "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]"
                              : lead.status === "Lost"
                                ? "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]"
                                : "bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]"
                        }`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-gray-500 whitespace-nowrap">{lead.source}</td>
                      <td className="py-2 px-3 text-right text-gray-400 whitespace-nowrap">
                        {new Date(lead.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-6 text-gray-400 text-[10.5px]">
                      No recent leads found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </ChartCard>

        {/* Recent Activity */}
        <ChartCard title="Recent Client Activities">
          <div className="overflow-y-auto max-h-64 flex flex-col gap-1.5 divide-y divide-gray-50">
            {data.recentActivities.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-[10.5px]">
                No recent activities recorded.
              </div>
            ) : (
              data.recentActivities.map((activity) => (
                <div
                  key={activity._id}
                  className="flex items-start gap-2.5 py-2 px-1 hover:bg-gray-50/50 rounded-[8px] transition-colors"
                >
                  <div
                    className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                      activity.status === "Completed"
                        ? "bg-emerald-500"
                        : activity.status === "Scheduled"
                          ? "bg-[var(--primary)]"
                          : "bg-gray-300"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold text-gray-900 truncate">
                      {activity.title}{" "}
                      <span className="text-gray-400 font-normal text-[10px]">({activity.activityType})</span>
                    </p>
                    {activity.description && (
                      <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">
                        {activity.description}
                      </p>
                    )}
                    <p className="text-[9.5px] text-gray-400 mt-1">
                      {activity.relatedId?.name || "Client"} • {new Date(activity.activityDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default Dashboard;