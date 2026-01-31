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
        // We might need a specific getBillingById if getBillings is list-only,
        // but typically lists return arrays. Let's assume we can fetch by ID or filter.
        // Checking serviceService... usually standard is get(id).
        // Let's assume we need to filtering or if there's a direct endpoint.
        // Actually, for now, let's try to fetch all and find, or if there is a specific endpoint.
        // Recommendation: Check billingService first. Assuming standard getBilling(id).
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
    if (invoice && !loading) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [invoice, loading]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  if (loading) return <div className="p-8 text-center">Loading Invoice...</div>;
  if (!invoice)
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 font-bold mb-2">Error Loading Invoice</div>
        <div className="text-gray-600 text-sm">
          Please check the console for details or try again.
        </div>
      </div>
    );

  return (
    <div
      className="bg-white min-h-screen p-8 max-w-4xl mx-auto text-gray-900 font-sans"
      id="invoice"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-8 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
          <p className="text-gray-500 text-sm">#{invoice.invoiceNumber}</p>
        </div>
        <div className="text-right">
          {/* We can put Company Logo or Name here if available in invoice.company */}
          <h2 className="text-xl font-bold text-gray-800">
            {typeof invoice.company === "object"
              ? invoice.company.companyName
              : "Company Name"}
          </h2>
          <p className="text-gray-500 text-sm">
            {new Date(invoice.billingDate).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Bill To */}
      <div className="mb-8">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          Bill To:
        </h3>
        <div className="text-gray-800 font-medium text-lg">
          {typeof invoice.contact === "object"
            ? invoice.contact.name
            : "Unknown Contact"}
        </div>
        {typeof invoice.contact === "object" && invoice.contact.email && (
          <div className="text-gray-600">{invoice.contact.email}</div>
        )}
      </div>

      {/* Table */}
      <table className="w-full mb-8">
        <thead>
          <tr className="border-b-2 border-gray-800">
            <th className="text-left py-2 font-bold text-gray-900">
              Description
            </th>
            <th className="text-right py-2 font-bold text-gray-900">Qty</th>
            <th className="text-right py-2 font-bold text-gray-900">Price</th>
            <th className="text-right py-2 font-bold text-gray-900">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {invoice.services.map((service, idx) => (
            <tr key={idx}>
              <td className="py-3 text-gray-800">{service.serviceName}</td>
              <td className="py-3 text-right text-gray-600">
                {service.quantity}
              </td>
              <td className="py-3 text-right text-gray-600">
                {formatCurrency(service.unitAmount)}
              </td>
              <td className="py-3 text-right text-gray-900 font-medium">
                {formatCurrency(service.totalAmount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal:</span>
            <span>{formatCurrency(invoice.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tax:</span>
            <span>{formatCurrency(invoice.taxTotal)}</span>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Discount:</span>
              <span>-{formatCurrency(invoice.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-xl font-bold text-gray-900 border-t pt-2 mt-2">
            <span>Total:</span>
            <span>{formatCurrency(invoice.grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="border-t pt-6 text-sm text-gray-500">
          <p className="font-bold mb-1">Notes:</p>
          <p>{invoice.notes}</p>
        </div>
      )}
    </div>
  );
};

export default PrintInvoice;
