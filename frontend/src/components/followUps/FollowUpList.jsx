import React from "react";

const FollowUpList = ({ followUps, onEdit, onDelete, onStatusChange }) => {
  if (!followUps || followUps.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow-sm">
        No follow-ups found.
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const statusColors = {
    Pending: "bg-blue-100 text-blue-800",
    Completed: "bg-green-100 text-green-800",
    Missed: "bg-red-100 text-red-800",
    Rescheduled: "bg-yellow-100 text-yellow-800",
  };

  return (
    <div className="w-full">
      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {followUps.map((item) => (
          <div
            key={item._id}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="overflow-hidden">
                <p className="font-semibold text-gray-900 truncate">
                  {item.lead?.name || "Unknown"}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {item.lead?.phone}
                </p>
              </div>
              <span
                className={`flex-shrink-0 px-2 py-1 text-xs font-semibold rounded-full ${statusColors[item.status] || "bg-gray-100 text-gray-800"}`}
              >
                {item.status}
              </span>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center">
                <span className="w-20 font-medium flex-shrink-0">Type:</span>
                <span className="truncate">{item.type}</span>
              </div>
              <div className="flex items-center">
                <span className="w-20 font-medium flex-shrink-0">Due:</span>
                <span className="truncate">{formatDate(item.scheduledAt)}</span>
              </div>
              {item.notes && (
                <div className="bg-gray-50 p-2 rounded text-xs mt-2 break-words text-wrap">
                  {item.notes}
                </div>
              )}
            </div>

            <div className="flex justify-end items-center gap-3 border-t border-gray-100 pt-3">
              {item.status === "Pending" && (
                <button
                  onClick={() => onStatusChange(item, "Completed")}
                  className="text-sm text-green-600 font-medium hover:text-green-700 whitespace-nowrap"
                >
                  Mark Done
                </button>
              )}
              <button
                onClick={() => onEdit(item)}
                className="text-sm text-indigo-600 font-medium hover:text-indigo-700 whitespace-nowrap"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(item._id)}
                className="text-sm text-red-600 font-medium hover:text-red-700 whitespace-nowrap"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lead
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notes
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {followUps.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[item.status] || "bg-gray-100 text-gray-800"}`}
                  >
                    {item.status}
                  </span>
                  {item.status === "Pending" && (
                    <button
                      onClick={() => onStatusChange(item, "Completed")}
                      className="ml-2 text-xs text-green-600 hover:underline"
                    >
                      Mark Done
                    </button>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(item.scheduledAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {item.lead?.name || "Unknown"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {item.lead?.phone || ""}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.type}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {item.notes}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onEdit(item)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(item._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FollowUpList;
