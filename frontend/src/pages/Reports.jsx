import React, { useState, useEffect } from "react";
import reportService from "../services/reportService";

const Card = ({ title, value, subtext, color = "bg-white" }) => (
  <div className={`${color} p-6 rounded-xl shadow-sm border border-gray-100`}>
    <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">
      {title}
    </h3>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
    {subtext && <p className="text-sm text-gray-500 mt-1">{subtext}</p>}
  </div>
);

const Reports = () => {
  const [serviceRevenue, setServiceRevenue] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [paymentStats, setPaymentStats] = useState([]);
  const [contactBilling, setContactBilling] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const [revRes, monthRes, payRes, contactRes] = await Promise.all([
          reportService.getServiceRevenue(),
          reportService.getMonthlyTransactions(year),
          reportService.getPaymentStatusStats(),
          reportService.getContactBilling(),
        ]);
        setServiceRevenue(revRes.data);
        setMonthlyStats(monthRes.data);
        setPaymentStats(payRes.data);
        setContactBilling(contactRes.data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [year]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">Loading reports...</div>
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
    <div className="w-full p-6 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
        <select
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
        >
          {[2024, 2025, 2026, 2027].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          subtext={`For ${year}`}
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

      {/* Charts Section (Placeholder visuals with CSS bars for now) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Revenue */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            Monthly Revenue
          </h2>
          <div className="flex items-end space-x-2 h-64">
            {monthlyStats.map((item) => {
              const max = Math.max(...monthlyStats.map((m) => m.revenue)) || 1;
              const height = (item.revenue / max) * 100;
              return (
                <div
                  key={item.month}
                  className="flex-1 flex flex-col justify-end group relative"
                >
                  <div
                    className="w-full bg-black rounded-t opacity-80 hover:opacity-100 transition-all"
                    style={{ height: `${height}%` }}
                  ></div>
                  <span className="text-xs text-center text-gray-500 mt-2 truncate">
                    {item.monthName}
                  </span>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs p-2 rounded z-10 whitespace-nowrap">
                    {formatCurrency(item.revenue)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Service Performance */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            Revenue by Service
          </h2>
          <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
            {serviceRevenue.map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span>{item.serviceName}</span>
                  <span>{formatCurrency(item.totalRevenue)}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${(item.totalRevenue / totalRevenue) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
            {serviceRevenue.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                No data available
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Clients */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">
              Top Clients by Billing
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-3">Client</th>
                  <th className="px-6 py-3">Company</th>
                  <th className="px-6 py-3 text-right">Invoices</th>
                  <th className="px-6 py-3 text-right">Total Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {contactBilling.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {item.contactName}
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {item.companyName || "-"}
                    </td>
                    <td className="px-6 py-3 text-right">
                      {item.invoiceCount}
                    </td>
                    <td className="px-6 py-3 text-right font-medium">
                      {formatCurrency(item.totalSpent)}
                    </td>
                  </tr>
                ))}
                {contactBilling.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-gray-500">
                      No data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Status Overview</h2>
          </div>
          <div className="p-6 space-y-4">
            {paymentStats.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      item._id === "PAID"
                        ? "bg-green-500"
                        : item._id === "PENDING"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                  ></span>
                  <span className="font-medium text-gray-700 capitalize">
                    {item._id.toLowerCase()}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">
                    {formatCurrency(item.totalAmount)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {item.count} Invoices
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
