import React, { useState, useEffect } from "react";
import reportService from "../services/reportService";

const Card = ({ title, value, subtext, color = "bg-white" }) => (
  <div className={`${color} p-5 rounded-lg shadow-sm border border-gray-100`}>
    <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">
      {title}
    </h3>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
  </div>
);

const Reports = () => {
  const [serviceRevenue, setServiceRevenue] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [paymentStats, setPaymentStats] = useState([]);
  const [contactBilling, setContactBilling] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [showDetailedReport, setShowDetailedReport] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
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
          reportService.getServiceRevenue(),
          reportService.getMonthlyTransactions(params),
          reportService.getPaymentStatusStats(),
          reportService.getContactBilling(),
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
      } finally {
        setLoading(false);
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
    return (
      <div className="p-8 text-center text-gray-500 text-sm">
        Loading reports...
      </div>
    );
  }

  // Calculate Totals
  const totalRevenue = monthlyStats.reduce(
    (acc, curr) => acc + curr.revenue,
    0,
  );
  const pendingAmount =
    paymentStats.find((s) => s._id === "PENDING")?.totalAmount || 0;
  const paidAmount =
    paymentStats.find((s) => s._id === "PAID")?.totalAmount || 0;

  return (
    <div className="w-full p-6 space-y-6 bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-800">Financial Reports</h1>
        <div className="flex gap-2">
          <select
            value={year}
            onChange={(e) => {
              if (e.target.value === "30d") {
                setYear("30d");
              } else {
                setYear(parseInt(e.target.value));
              }
            }}
            className="px-3 py-1.5 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-black"
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
            className="px-3 py-1.5 bg-black text-white rounded hover:bg-gray-800 transition-colors text-xs font-medium"
          >
            All Transactions
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          subtext={`For ${year === "30d" ? "Last 30 Days" : year}`}
        />
        <Card
          title="Paid Invoices"
          value={formatCurrency(paidAmount)}
          color="bg-green-50"
        />
        <Card
          title="Pending Amount"
          value={formatCurrency(pendingAmount)}
          color="bg-yellow-50"
        />
        <Card
          title="Transactions"
          value={monthlyStats.reduce((acc, c) => acc + c.count, 0)}
          subtext="Total Invoices"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-gray-800">
              {year === "30d" ? "Daily Revenue" : "Monthly Revenue"}
            </h2>
          </div>
          <div className="flex items-end space-x-1 h-56 pb-2">
            {monthlyStats.map((item, index) => {
              const max =
                Math.max(...monthlyStats.map((m) => m.revenue)) || 1000;
              const hasRevenue = item.revenue > 0;
              const height = hasRevenue ? (item.revenue / max) * 100 : 0;

              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col justify-end group relative h-full"
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-900 text-white text-[10px] p-1.5 rounded z-50 whitespace-nowrap shadow-lg border border-gray-700 pointer-events-none">
                    <p className="font-bold text-center border-b border-gray-700 pb-0.5 mb-0.5">
                      {item.label || item.monthName}
                    </p>
                    <div className="flex flex-col">
                      <p>Rev: {formatCurrency(item.revenue)}</p>
                      <p className="text-gray-400">{item.count} invoices</p>
                    </div>
                  </div>

                  {hasRevenue && (
                    <span className="mb-0.5 text-[10px] font-medium text-gray-600 w-full text-center hidden md:block truncate">
                      {formatCurrency(item.revenue)
                        .split("₹")[1]
                        .split(",")[0] + "k"}
                    </span>
                  )}

                  <div
                    className={`w-full rounded-t transition-all ${hasRevenue ? "bg-black hover:bg-gray-800 opacity-90" : "bg-gray-100"}`}
                    style={{ height: `${Math.max(height, 2)}%` }}
                  ></div>

                  <span className="text-[9px] text-center text-gray-400 mt-1 truncate w-full block">
                    {monthlyStats.length > 15 && index % 2 !== 0
                      ? ""
                      : item.label || item.monthName}
                  </span>
                </div>
              );
            })}
            {monthlyStats.length === 0 && (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                No data
              </div>
            )}
          </div>
        </div>

        {/* Service Performance */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-base font-bold text-gray-800 mb-4">
            Revenue by Service
          </h2>
          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {serviceRevenue.map((item, idx) => (
              <div key={idx} className="text-sm">
                <div className="flex justify-between font-medium mb-1 text-gray-700">
                  <span>{item.serviceName}</span>
                  <span>{formatCurrency(item.totalRevenue)}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="bg-gray-800 h-1.5 rounded-full"
                    style={{
                      width: `${(item.totalRevenue / totalRevenue) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
            {serviceRevenue.length === 0 && (
              <p className="text-gray-400 text-center py-8 text-xs">
                No services data
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Report Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div
          className="p-4 border-b border-gray-100 flex justify-between items-center cursor-pointer hover:bg-gray-50"
          onClick={() => setShowDetailedReport(!showDetailedReport)}
        >
          <h2 className="text-base font-bold text-gray-800">
            Detailed Breakdown
          </h2>
          <span className="text-xl text-gray-500">
            {showDetailedReport ? "−" : "+"}
          </span>
        </div>

        {showDetailedReport && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium">
                <tr>
                  <th className="px-4 py-2">Period</th>
                  <th className="px-4 py-2 text-right">Invoices</th>
                  <th className="px-4 py-2 text-right">Revenue</th>
                  <th className="px-4 py-2 text-right">% of Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[...monthlyStats].reverse().map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-900">
                      {item.label || item.monthName}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-600">
                      {item.count}
                    </td>
                    <td className="px-4 py-2 text-right font-medium text-gray-900">
                      {formatCurrency(item.revenue)}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-500">
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-800">Top Clients</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium h-8">
              <tr>
                <th className="px-4 py-2">Client</th>
                <th className="px-4 py-2">Company</th>
                <th className="px-4 py-2 text-right">Count</th>
                <th className="px-4 py-2 text-right">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contactBilling.slice(0, 5).map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-900">
                    {item.contactName}
                  </td>
                  <td className="px-4 py-2 text-gray-500">
                    {item.companyName || "-"}
                  </td>
                  <td className="px-4 py-2 text-right">{item.invoiceCount}</td>
                  <td className="px-4 py-2 text-right font-medium">
                    {formatCurrency(item.totalSpent)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
