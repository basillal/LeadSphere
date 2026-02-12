import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import billingService from "../../services/billingService";

const PrintInvoice = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await billingService.getBilling(id);
        setInvoice(response.data);
      } catch (error) {
        console.error("Failed to load invoice", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  useEffect(() => {
    if (invoice) {
      document.title = invoice.invoiceNumber;
    }
    // Cleanup to reset title if needed, or leave it.
    // Given the user might navigate away, restoring it is nice but maybe not strictly required if the whole app is "LeadSphere".
    // Let's restore it to "LeadSphere" on cleanup to be safe.
    return () => {
      document.title = "LeadSphere";
    };
  }, [invoice]);

  useEffect(() => {
    if (invoice && !loading) {
      setTimeout(() => {
        window.print();
      }, 800);
    }
  }, [invoice, loading]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading)
    return (
      <div className="p-12 text-center text-gray-500">Loading Invoice...</div>
    );
  if (!invoice)
    return (
      <div className="p-12 text-center text-red-500">Invoice not found.</div>
    );

  const company = invoice.company || {};
  const contact = invoice.contact || {};

  return (
    <div className="bg-white min-h-screen text-gray-800 font-sans print:p-0 p-8 max-w-5xl mx-auto">
      {/* Print Specific Styles */}
      <style>{`
        @media print {
          @page { margin: 0; size: auto; }
          body { -webkit-print-color-adjust: exact; margin: 0; padding: 0; }
          .print-container { padding: 40px; margin: 0; width: 100%; height: 100%; }
        }
      `}</style>

      <div className="print-container border border-gray-200 shadow-xl print:shadow-none print:border-none p-12 bg-white min-h-[297mm]">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-12">
          <div className="w-1/2">
            {/* Logo or Placeholder */}
            <div className="mb-4">
              {company.settings?.logo || company.logo ? (
                <img
                  src={company.settings?.logo || company.logo}
                  alt={company.name}
                  className="h-16 w-auto object-contain mb-2"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}

              {/* Fallback Initial if no logo or error */}
              <div
                className="w-12 h-12 bg-black text-white flex items-center justify-center font-bold text-xl rounded mb-2"
                style={{
                  display:
                    company.settings?.logo || company.logo ? "none" : "flex",
                }}
              >
                {company.name ? company.name.charAt(0) : "L"}
              </div>

              <h1 className="text-2xl font-bold text-gray-900 uppercase">
                {company.name || "Your Company Name"}
              </h1>
            </div>

            <div className="text-sm text-gray-600 space-y-1">
              {/* Address rendering */}
              {company.address ? (
                <>
                  <p>{company.address.street}</p>
                  <p>
                    {[
                      company.address.city,
                      company.address.state,
                      company.address.zipCode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  <p>{company.address.country}</p>
                </>
              ) : (
                // Fallback if no specific address in DB
                <>
                  <p>123 Business Street</p>
                  <p>Tech City, TC 54321</p>
                </>
              )}
              <p className="pt-2">
                <strong>Phone:</strong> {company.phone || "+91 98765 43210"}
              </p>
              <p>
                <strong>Email:</strong>{" "}
                {company.email || "support@leadsphere.com"}
              </p>
              {company.website && (
                <p>
                  <strong>Web:</strong> {company.website}
                </p>
              )}
            </div>
          </div>

          <div className="text-right w-1/2">
            <h2 className="text-5xl font-extrabold text-gray-100 uppercase tracking-widest mb-4">
              Invoice
            </h2>
            <div className="inline-block text-left">
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <div className="text-gray-500 font-medium">Invoice No:</div>
                <div className="font-bold text-gray-900">
                  #{invoice.invoiceNumber}
                </div>

                <div className="text-gray-500 font-medium">Date:</div>
                <div className="font-bold text-gray-900">
                  {formatDate(invoice.billingDate)}
                </div>

                <div className="text-gray-500 font-medium">Due Date:</div>
                <div className="font-bold text-gray-900">
                  {invoice.dueDate ? formatDate(invoice.dueDate) : "Immediate"}
                </div>

                <div className="text-gray-500 font-medium">Status:</div>
                <div
                  className={`font-bold uppercase text-xs px-2 py-0.5 rounded w-fit ${
                    invoice.paymentStatus === "PAID"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {invoice.paymentStatus}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bill To Section */}
        <div className="mb-10 p-6 bg-gray-50 rounded-lg border border-gray-100">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            Bill To
          </h3>
          <div className="text-lg font-bold text-gray-900 mb-1 uppercase">
            {contact.name || "Unknown Client"}
          </div>
          <div className="text-sm text-gray-600 space-y-0.5">
            {contact.companyName && (
              <p className="font-medium text-gray-800">{contact.companyName}</p>
            )}
            {contact.email && <p>{contact.email}</p>}
            {contact.phone && <p>{contact.phone}</p>}
            {contact.address && (
              <p>
                {[
                  contact.address.street,
                  contact.address.city,
                  contact.address.state,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}
          </div>
        </div>

        {/* Invoice Items Table */}
        <div className="mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-900 text-white text-sm uppercase tracking-wider">
                <th className="py-3 px-4 text-left rounded-l-lg">
                  Description
                </th>
                <th className="py-3 px-4 text-center w-24">Qty</th>
                <th className="py-3 px-4 text-right w-32">Price</th>
                <th className="py-3 px-4 text-right w-32 rounded-r-lg">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {invoice.services.map((item, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-4 px-4 font-medium uppercase">
                    {item.serviceName}
                  </td>
                  <td className="py-4 px-4 text-center">{item.quantity}</td>
                  <td className="py-4 px-4 text-right">
                    {formatCurrency(item.unitAmount)}
                  </td>
                  <td className="py-4 px-4 text-right font-bold">
                    {formatCurrency(item.totalAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end mb-12">
          <div className="w-1/2 lg:w-1/3 space-y-3">
            <div className="flex justify-between text-sm text-gray-600 border-b border-gray-100 pb-2">
              <span>Subtotal</span>
              <span className="font-medium">
                {formatCurrency(invoice.subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 border-b border-gray-100 pb-2">
              <span>Tax</span>
              <span className="font-medium">
                {formatCurrency(invoice.taxTotal)}
              </span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600 border-b border-gray-100 pb-2">
                <span>Discount</span>
                <span className="font-medium">
                  -{formatCurrency(invoice.discount)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold text-gray-900 pt-2">
              <span>Grand Total</span>
              <span>{formatCurrency(invoice.grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Footer / Notes & Terms */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Notes & Terms
          </h3>
          <p className="text-sm text-gray-600">
            {invoice.notes ||
              "Thank you for your business. Payment is due within the specified time. Please include invoice number on your check."}
          </p>
        </div>

        <div className="mt-16 text-center text-xs text-gray-400">
          <p>
            © {new Date().getFullYear()} {company.name || "LeadSphere Inc."}.
            All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrintInvoice;
