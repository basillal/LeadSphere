import React from "react";

const ReferrerCard = ({ referrer, onEdit, onDelete, onView, stats }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900">{referrer.name}</h3>
          {referrer.companyName && (
            <p className="text-sm text-gray-500">{referrer.companyName}</p>
          )}
          {referrer.designation && (
            <p className="text-xs text-gray-400">{referrer.designation}</p>
          )}
        </div>
        {!referrer.isActive && (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
            Inactive
          </span>
        )}
      </div>

      {/* Contact Info */}
      <div className="space-y-1 mb-3">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Phone:</span> {referrer.phone}
        </p>
        {referrer.email && (
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Email:</span> {referrer.email}
          </p>
        )}
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-3 gap-2 p-3 bg-gray-900 rounded-lg text-white mb-3">
          <div>
            <div className="text-xs text-gray-400 uppercase">Total</div>
            <div className="text-lg font-bold">{stats.totalLeads || 0}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400 uppercase">Converted</div>
            <div className="text-lg font-bold">{stats.convertedLeads || 0}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400 uppercase">Rate</div>
            <div className="text-lg font-bold">
              {stats.conversionPercentage || 0}%
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onView(referrer)}
          className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          View
        </button>
        <button
          onClick={() => onEdit(referrer)}
          className="flex-1 px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(referrer._id)}
          className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ReferrerCard;
