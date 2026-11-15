import React, { useState, useEffect } from "react";
import { useLoading } from "../context/LoadingProvider";
import reportService from "../services/reportService";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const StatCard = ({ title, value, subtext, accentColor = "text-gray-900", iconBg = "bg-gray-50", iconColor = "text-gray-600", icon }) => (
  <div className="bg-white p-3.5 rounded-[20px] border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-gray-200 transition-all flex flex-col justify-between">
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-[9.5px] font-semibold text-gray-400 uppercase tracking-wider truncate">
        {title}
      </span>
      {icon && (
        <div className={`w-7 h-7 rounded-[8px] ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
      )}
    </div>
    <div>
      <p className={`text-[18px] font-bold leading-tight ${accentColor}`}>
        {value}
      </p>
      {subtext && (
        <p className="text-[9.5px] text-gray-400 mt-1 font-medium">{subtext}</p>
      )}
    </div>
  </div>
);

const Reports = () => {
  const [serviceRevenue, setServiceRevenue] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [paymentStats, setPaymentStats] = useState([]);
  const [contactBilling, setContactBilling] = useState([]);
  const { loading } = useLoading();
  const [year, setYear] = useState(new Date().getFullYear());
  const [showDetailedReport, setShowDetailedReport] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        let params = {};
        if (year === "30d") {
          const end = new Date();
          const start = new Date();
          start.setDate(start.getDate() - 30);
          params = {
            startDate: start.toISOString().split("T")[0],
            endDate: end.toISOString().split("T")[0],
          };
        } else {
          params = { year };
        }

        const results = await Promise.allSettled([
          reportService.getServiceRevenue(params),
          reportService.getMonthlyTransactions(params),
          reportService.getPaymentStatusStats(params),
          reportService.getContactBilling(params),
        ]);

        const [revRes, monthRes, payRes, contactRes] = results;

        if (revRes.status === "fulfilled") {
          setServiceRevenue(revRes.value.data || []);
        }

        if (monthRes.status === "fulfilled") {
          setMonthlyStats(monthRes.value.data || []);
        }

        if (payRes.status === "fulfilled") {
          setPaymentStats(payRes.value.data || []);
        }

        if (contactRes.status === "fulfilled") {
          setContactBilling(contactRes.value.data || []);
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    fetchReports();
  }, [year]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return <div className="min-h-[400px] flex items-center justify-center text-gray-400 text-[11px]">Loading reports...</div>;
  }

  // Calculate Totals
  const totalRevenue = monthlyStats.reduce(
    (acc, curr) => acc + (curr.revenue || 0),
    0,
  );
  const totalExpenses = monthlyStats.reduce(
    (acc, curr) => acc + (curr.expenses || 0),
    0,
  );
  const netRevenue = totalRevenue - totalExpenses;
  const pendingAmount =
    paymentStats.find((s) => s._id === "PENDING")?.totalAmount || 0;

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-1 px-1">
        <div>
          <h1 className="text-[13px] font-semibold text-gray-900 tracking-tight">
            Financial Reports
          </h1>
          <p className="text-[10.5px] text-gray-400 mt-0.5">
            Monitor revenue streams, expenses, net profit, and client billing volume.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={year}
            onChange={(e) => {
              if (e.target.value === "30d") {
                setYear("30d");
              } else {
                setYear(parseInt(e.target.value));
              }
            }}
            className="h-[34px] px-3 border border-[#D1D5DB] rounded-[10px] text-[11px] font-medium bg-white focus:outline-none focus:ring-1 focus:ring-gray-900"
          >
            <option value="30d">Last 30 Days</option>
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <button
            onClick={() => (window.location.href = "/billings")}
            className="em-btn-clear h-[34px] px-3.5 inline-flex items-center text-[11px]"
          >
            All Invoices
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <StatCard
          title="Revenue"
          value={formatCurrency(totalRevenue)}
          subtext={`Period: ${year === "30d" ? "Last 30 Days" : year}`}
          accentColor="text-gray-900"
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Expenses"
          value={formatCurrency(totalExpenses)}
          subtext="Operational spend"
          accentColor="text-rose-600"
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          }
        />
        <StatCard
          title="Net Profit"
          value={formatCurrency(netRevenue)}
          subtext="Margin after costs"
          accentColor={netRevenue >= 0 ? "text-emerald-600" : "text-rose-600"}
          iconBg={netRevenue >= 0 ? "bg-emerald-50" : "bg-rose-50"}
          iconColor={netRevenue >= 0 ? "text-emerald-600" : "text-rose-600"}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
        <StatCard
          title="Pending Amount"
          value={formatCurrency(pendingAmount)}
          subtext="Awaiting clearance"
          accentColor="text-amber-600"
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Monthly Revenue Chart */}
        <div className="em-card p-4 rounded-[20px] bg-white border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-[12px] font-semibold text-gray-900">
              {year === "30d" ? "Daily Revenue Trend" : "Monthly Revenue & Expense Trend"}
            </h2>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={monthlyStats}
                margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#F3F4F6"
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#9CA3AF" }}
                  dy={6}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#9CA3AF" }}
                  tickFormatter={(value) =>
                    new Intl.NumberFormat("en-IN", {
                      notation: "compact",
                      compactDisplay: "short",
                    }).format(value)
                  }
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #E5E7EB",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                    fontSize: "11px",
                  }}
                  formatter={(value) => formatCurrency(value)}
                  cursor={{ fill: "rgba(0,0,0,0.02)" }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "10.5px", paddingTop: "8px" }} />
                <Bar
                  dataKey="revenue"
                  name="Revenue"
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                  barSize={16}
                />
                <Bar
                  dataKey="expenses"
                  name="Expenses"
                  fill="#F43F5E"
                  radius={[4, 4, 0, 0]}
                  barSize={16}
                />
                <Line
                  type="monotone"
                  dataKey="pending"
                  name="Pending"
                  stroke="#F54900"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#F54900" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service Performance */}
        <div className="em-card p-4 rounded-[20px] bg-white border border-gray-100 flex flex-col">
          <h2 className="text-[12px] font-semibold text-gray-900 mb-3">
            Revenue by Service Category
          </h2>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1 flex-1">
            {serviceRevenue.map((item, idx) => (
              <div key={idx} className="text-[11px]">
                <div className="flex justify-between font-semibold mb-1 text-gray-800">
                  <span>{item.serviceName}</span>
                  <span>{formatCurrency(item.totalRevenue)}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[var(--primary)] h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${totalRevenue > 0 ? (item.totalRevenue / totalRevenue) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            {serviceRevenue.length === 0 && (
              <p className="text-gray-400 text-center py-10 text-[11px]">
                No service revenue recorded in this period.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Breakdown Accordion Table */}
      <div className="em-card rounded-[20px] overflow-hidden p-0 bg-white border border-gray-100">
        <div
          className="p-3.5 border-b border-gray-100 flex justify-between items-center cursor-pointer hover:bg-gray-50/50 transition-colors"
          onClick={() => setShowDetailedReport(!showDetailedReport)}
        >
          <div>
            <h2 className="text-[12px] font-semibold text-gray-900">
              Detailed Period Breakdown
            </h2>
            <p className="text-[10px] text-gray-400">Click to expand monthly revenue distribution.</p>
          </div>
          <span className="text-[14px] font-bold text-gray-500 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100">
            {showDetailedReport ? "−" : "+"}
          </span>
        </div>

        {showDetailedReport && (
          <div className="overflow-x-auto">
            <table className="w-full text-[10.5px] text-left border-collapse">
              <thead className="bg-gray-50/70 border-b border-gray-100 text-[9px] text-gray-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-2.5">Period</th>
                  <th className="px-4 py-2.5 text-right">Invoices</th>
                  <th className="px-4 py-2.5 text-right">Revenue</th>
                  <th className="px-4 py-2.5 text-right">% of Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[...monthlyStats].reverse().map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-gray-900">
                      {item.label || item.monthName}
                    </td>
                    <td className="px-4 py-2.5 text-right text-gray-600">
                      {item.count}
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold text-gray-900">
                      {formatCurrency(item.revenue)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-gray-500">
                      {totalRevenue > 0
                        ? ((item.revenue / totalRevenue) * 100).toFixed(1)
                        : 0}
                      %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Top Clients Table */}
      <div className="em-card rounded-[20px] overflow-hidden p-0 bg-white border border-gray-100">
        <div className="p-3.5 border-b border-gray-100">
          <h2 className="text-[12px] font-semibold text-gray-900">Top Clients by Billing</h2>
          <p className="text-[10px] text-gray-400">Leading accounts ranked by total invoice amount.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[10.5px] text-left border-collapse">
            <thead className="bg-gray-50/70 border-b border-gray-100 text-[9px] text-gray-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-2.5">Client</th>
                <th className="px-4 py-2.5">Organization</th>
                <th className="px-4 py-2.5 text-right">Invoices</th>
                <th className="px-4 py-2.5 text-right">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contactBilling.slice(0, 5).map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-2.5 font-semibold text-gray-900">
                    {item.contactName}
                  </td>
                  <td className="px-4 py-2.5 text-gray-500">
                    {item.organizationName || "-"}
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-600 font-medium">
                    {item.invoiceCount}
                  </td>
                  <td className="px-4 py-2.5 text-right font-bold text-gray-900">
                    {formatCurrency(item.totalSpent)}
                  </td>
                </tr>
              ))}
              {contactBilling.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-4 py-6 text-center text-gray-400">
                    No client billing records available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;