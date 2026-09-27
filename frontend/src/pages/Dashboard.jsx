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

/* ─────────────────────────────────────────────────────────────
   COLORS — Premium palette
───────────────────────────────────────────────────────────── */
const CHART_COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];

/* ─────────────────────────────────────────────────────────────
   HERO STAT CARD
───────────────────────────────────────────────────────────── */
const HeroCard = ({ title, value, icon, variant = "primary", subtitle }) => {
  const variantStyles = {
    primary: { iconBox: "icon-box-primary", borderClass: "hero-stat-primary" },
    success: { iconBox: "icon-box-success", borderClass: "hero-stat-success" },
    warning: { iconBox: "icon-box-warning", borderClass: "hero-stat-warning" },
    danger:  { iconBox: "icon-box-danger",  borderClass: "hero-stat-danger" },
    cyan:    { iconBox: "icon-box-cyan",     borderClass: "" },
    purple:  { iconBox: "icon-box-purple",   borderClass: "" },
  };
  const { iconBox, borderClass } = variantStyles[variant] || variantStyles.primary;

  return (
    <div className={`hero-stat-card ${borderClass}`}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
        <div className={`icon-box ${iconBox}`} style={{ fontSize: "1.2rem" }}>
          {icon}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0, marginBottom: "0.2rem" }}>
            {title}
          </p>
          <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0F172A", margin: 0, fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            {value}
          </h3>
          {subtitle && (
            <p style={{ fontSize: "0.72rem", color: "#94A3B8", margin: "0.25rem 0 0" }}>{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   COMPACT STAT CARD
───────────────────────────────────────────────────────────── */
const CompactStat = ({ title, value, icon, iconClass = "icon-box-primary" }) => (
  <div
    style={{
      background: "#FFFFFF",
      border: "1px solid #E2E8F0",
      borderRadius: "12px",
      padding: "0.875rem 1rem",
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      transition: "box-shadow 0.18s ease, transform 0.18s ease",
      cursor: "default",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = "0 4px 16px -4px rgba(79,70,229,0.12)";
      e.currentTarget.style.transform = "translateY(-1px)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = "none";
      e.currentTarget.style.transform = "translateY(0)";
    }}
  >
    <div className={`icon-box ${iconClass}`} style={{ fontSize: "1rem", width: 38, height: 38, borderRadius: "9px" }}>
      {icon}
    </div>
    <div>
      <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
        {title}
      </p>
      <p style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0F172A", margin: "0.1rem 0 0", fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.02em" }}>
        {value}
      </p>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   CHART CARD WRAPPER
───────────────────────────────────────────────────────────── */
const ChartCard = ({ title, children, action, style = {} }) => (
  <div
    style={{
      background: "#FFFFFF",
      border: "1px solid #E2E8F0",
      borderRadius: "14px",
      boxShadow: "0 1px 4px rgba(15,23,42,0.05)",
      ...style,
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.25rem", borderBottom: "1px solid #F1F5F9" }}>
      <h4 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: "#0F172A", fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.02em" }}>
        {title}
      </h4>
      {action}
    </div>
    <div style={{ padding: "1rem 1.25rem 1.25rem" }}>{children}</div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   CUSTOM TOOLTIP
───────────────────────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label, formatFn }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(255,255,255,0.98)",
      border: "1px solid #E2E8F0",
      borderRadius: "10px",
      padding: "0.625rem 0.875rem",
      boxShadow: "0 8px 24px -4px rgba(15,23,42,0.14)",
      fontSize: "0.8rem",
    }}>
      <p style={{ margin: "0 0 0.375rem", fontWeight: 600, color: "#0F172A", fontSize: "0.78rem" }}>{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: "0.2rem 0" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
          <span style={{ color: "#475569" }}>{p.name}:</span>
          <span style={{ fontWeight: 700, color: "#0F172A" }}>{formatFn ? formatFn(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   MAIN DASHBOARD
───────────────────────────────────────────────────────────── */
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
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh", flexDirection: "column", gap: "1rem" }}>
        <div style={{ fontSize: "2rem" }}>⚠️</div>
        <h2 style={{ color: "#0F172A", fontFamily: "'Outfit', sans-serif" }}>Something went wrong</h2>
        <p style={{ color: "#64748B" }}>Failed to load dashboard statistics.</p>
      </div>
    );
  }

  const netProfit = (data.counts.revenue || 0) - (data.counts.totalExpenses || 0);

  return (
    <div style={{ width: "100%", maxWidth: "1400px", margin: "0 auto" }}>
      {/* ── Page Header ── */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: "#0F172A", margin: 0, letterSpacing: "-0.03em" }}>
            Welcome back, {user?.name?.split(" ")[0]}! 👋
          </h1>
          <p style={{ fontSize: "0.85rem", color: "#64748B", margin: "0.25rem 0 0" }}>
            Here's what's happening in your business today.
          </p>
        </div>
        <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
      </div>

      {/* ── Hero Stats (3 columns) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
        <HeroCard title="Total Revenue"  value={formatCurrency(data.counts.revenue)} icon="💰" variant="success" />
        <HeroCard title="Pending Amount" value={formatCurrency(data.counts.pendingRevenue || 0)} icon="⏳" variant="warning" />
        <HeroCard title="Total Expenses" value={formatCurrency(data.counts.totalExpenses || 0)} icon="💸" variant="danger" />
      </div>

      {/* ── Net Profit Banner ── */}
      <div
        style={{
          background: netProfit >= 0
            ? "linear-gradient(135deg, rgba(16,185,129,0.06), rgba(52,211,153,0.04))"
            : "linear-gradient(135deg, rgba(239,68,68,0.06), rgba(248,113,113,0.04))",
          border: `1px solid ${netProfit >= 0 ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
          borderRadius: "14px",
          padding: "1.125rem 1.5rem",
          marginBottom: "1rem",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div
            className={`icon-box ${netProfit >= 0 ? "icon-box-success" : "icon-box-danger"}`}
            style={{ width: 48, height: 48, borderRadius: "12px", fontSize: "1.25rem" }}
          >
            🏦
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.125rem" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Net Profit
              </span>
              <span className={`badge ${netProfit >= 0 ? "badge-success" : "badge-danger"}`}>
                {netProfit >= 0 ? "PROFIT" : "LOSS"}
              </span>
            </div>
            <h3
              style={{
                fontSize: "1.75rem", fontWeight: 900, margin: 0,
                fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.04em",
                color: netProfit >= 0 ? "#065F46" : "#991B1B",
              }}
            >
              {formatCurrency(Math.abs(netProfit))}
            </h3>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1.5rem", background: "rgba(255,255,255,0.7)", borderRadius: "10px", padding: "0.75rem 1.25rem", border: "1px solid rgba(226,232,240,0.8)" }}>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>Revenue</p>
            <p style={{ fontWeight: 700, color: "#059669", margin: "0.125rem 0 0", fontSize: "0.95rem" }}>{formatCurrency(data.counts.revenue)}</p>
          </div>
          <div style={{ width: "1px", background: "#E2E8F0" }} />
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>Expenses</p>
            <p style={{ fontWeight: 700, color: "#DC2626", margin: "0.125rem 0 0", fontSize: "0.95rem" }}>{formatCurrency(data.counts.totalExpenses || 0)}</p>
          </div>
        </div>
      </div>

      {/* ── Compact Stats Strip (6 columns) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "0.75rem", marginBottom: "1.25rem" }}>
        <CompactStat title="Total Leads"   value={data.counts.leads}                      icon="👥" iconClass="icon-box-primary" />
        <CompactStat title="Services"      value={data.counts.services}                    icon="⚡" iconClass="icon-box-purple" />
        <CompactStat title="Invoices"      value={data.counts.invoices || 0}               icon="🧾" iconClass="icon-box-teal" />
        <CompactStat title="Users"         value={data.counts.users || 0}                  icon="👤" iconClass="icon-box-pink" />
        <CompactStat title="Conversion"    value={`${data.counts.conversionRate || 0}%`}   icon="📈" iconClass="icon-box-indigo" />
        <CompactStat title="Pending Tasks" value={data.counts.pendingActivities}           icon="📅" iconClass="icon-box-orange" />
      </div>

      {/* ── Financial Chart ── */}
      <div style={{ marginBottom: "1.25rem" }}>
        <ChartCard
          title="Financial Overview"
          action={
            <select
              value={revenueInterval}
              onChange={(e) => setRevenueInterval(e.target.value)}
              style={{
                background: "#F8FAFC", border: "1px solid #E2E8F0", color: "#475569",
                fontSize: "0.78rem", fontWeight: 600, borderRadius: "8px", padding: "0.35rem 0.75rem",
                cursor: "pointer", outline: "none",
              }}
            >
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          }
        >
          <div style={{ height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.charts.financialTrend || []} margin={{ top: 8, right: 8, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0.5} />
                  </linearGradient>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EF4444" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#EF4444" stopOpacity={0.5} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="_id"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#94A3B8", fontFamily: "'Inter', sans-serif" }}
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
                  tick={{ fontSize: 10, fill: "#94A3B8", fontFamily: "'Inter', sans-serif" }}
                  tickFormatter={(v) => new Intl.NumberFormat("en-IN", { notation: "compact", compactDisplay: "short" }).format(v)}
                />
                <Tooltip
                  content={<CustomTooltip formatFn={formatCurrency} />}
                  labelFormatter={(v) => {
                    if (revenueInterval === "yearly") return v;
                    return new Date(v).toLocaleDateString("default", { day: "numeric", month: "long", year: "numeric" });
                  }}
                />
                <Bar dataKey="totalRevenue"  name="Revenue"  fill="url(#revGrad)" radius={[5,5,0,0]} barSize={18} />
                <Bar dataKey="totalExpenses" name="Expenses" fill="url(#expGrad)" radius={[5,5,0,0]} barSize={18} />
                <Line type="monotone" dataKey="totalPending" name="Pending" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 3.5, fill: "#F59E0B", strokeWidth: 2, stroke: "white" }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
            {[{ label: "Revenue", color: "#10B981" }, { label: "Expenses", color: "#EF4444" }, { label: "Pending", color: "#F59E0B" }].map((l) => (
              <span key={l.label} style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.75rem", color: "#64748B", fontWeight: 500 }}>
                <span style={{ width: 10, height: 10, borderRadius: "3px", background: l.color, display: "inline-block" }} />
                {l.label}
              </span>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* ── Secondary Charts ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem", marginBottom: "1.25rem" }}>
        {/* Leads by Status */}
        <ChartCard title="Lead Distribution">
          <div style={{ height: "240px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.charts.leadsByStatus}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={85}
                  paddingAngle={4}
                  dataKey="count" nameKey="_id"
                >
                  {data.charts.leadsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div style={{ background: "white", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "0.5rem 0.875rem", boxShadow: "0 8px 24px -4px rgba(15,23,42,0.14)", fontSize: "0.8rem" }}>
                      <p style={{ fontWeight: 700, color: "#0F172A", margin: 0 }}>{payload[0].name}</p>
                      <p style={{ color: "#64748B", margin: "0.2rem 0 0" }}>Count: <strong style={{ color: payload[0].color }}>{payload[0].value}</strong></p>
                    </div>
                  );
                }} />
                <Legend wrapperStyle={{ fontSize: "0.75rem", paddingTop: "8px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Lead Sources */}
        <ChartCard title="Lead Sources">
          <div style={{ height: "240px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.charts.leadsBySource}
                  cx="50%" cy="50%"
                  outerRadius={85}
                  dataKey="count" nameKey="_id"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {data.charts.leadsBySource?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* ── Bottom Grid — Recent Leads & Activities ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.25rem" }}>
        {/* Recent Leads Table */}
        <ChartCard title="Recent Leads">
          <div style={{ overflowY: "auto", maxHeight: "280px" }} className="custom-scrollbar">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Name", "Status", "Source", "Date"].map((h) => (
                    <th key={h} className="table-header-cell" style={{ padding: "0.5rem 0.75rem", textAlign: "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.recentLeads && data.recentLeads.length > 0 ? (
                  data.recentLeads.map((lead) => (
                    <tr key={lead._id} className="table-row">
                      <td className="table-body-cell" style={{ fontWeight: 600, fontSize: "0.82rem" }}>{lead.name}</td>
                      <td className="table-body-cell">
                        <span className={`badge ${
                          lead.status === "Won" ? "badge-success"
                            : lead.status === "New" ? "badge-primary"
                            : lead.status === "Lost" ? "badge-danger"
                            : "badge-slate"
                        }`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="table-body-cell" style={{ color: "#64748B", fontSize: "0.8rem" }}>{lead.source}</td>
                      <td className="table-body-cell" style={{ color: "#94A3B8", fontSize: "0.78rem", whiteSpace: "nowrap" }}>
                        {new Date(lead.createdAt).toLocaleDateString("default", { day: "numeric", month: "short" })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", padding: "2rem 0", color: "#94A3B8", fontSize: "0.84rem" }}>
                      No recent leads
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </ChartCard>

        {/* Recent Activity */}
        <ChartCard title="Recent Activity">
          <div style={{ overflowY: "auto", maxHeight: "280px", display: "flex", flexDirection: "column", gap: "0.5rem" }} className="custom-scrollbar">
            {data.recentActivities.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem 0", color: "#94A3B8", fontSize: "0.84rem" }}>
                No recent activities
              </div>
            ) : (
              data.recentActivities.map((activity) => (
                <div
                  key={activity._id}
                  style={{
                    display: "flex", gap: "0.75rem", padding: "0.625rem 0.5rem",
                    borderRadius: "8px", transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#F8FAFC"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <div style={{
                    marginTop: "4px", width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                    background: activity.status === "Completed" ? "#10B981"
                      : activity.status === "Scheduled" ? "#4F46E5"
                      : "#CBD5E1",
                  }} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#0F172A", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {activity.title}{" "}
                      <span style={{ color: "#94A3B8", fontWeight: 400 }}>({activity.activityType})</span>
                    </p>
                    <p style={{ fontSize: "0.78rem", color: "#64748B", margin: "0.2rem 0 0", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {activity.description || "No details provided"}
                    </p>
                    <p style={{ fontSize: "0.71rem", color: "#CBD5E1", margin: "0.25rem 0 0" }}>
                      {activity.relatedId?.name || "Unknown"} • {new Date(activity.activityDate).toLocaleDateString()}
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
