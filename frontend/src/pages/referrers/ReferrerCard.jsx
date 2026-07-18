import React from "react";

const ReferrerCard = ({ referrer, onEdit, onDelete, onView, stats }) => {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-slate-800">{referrer.name}</h3>
          {referrer.organizationName && (
            <p className="text-base text-black">{referrer.organizationName}</p>
          )}
          {referrer.designation && (
            <p className="text-base text-black">{referrer.designation}</p>
          )}
        </div>
        {!referrer.isActive && (
          <span className="px-2 py-1 bg-slate-100 text-black text-base rounded-full">
            Inactive
          </span>
        )}
      </div>

      {/* Contact Info */}
      <div className="space-y-1 mb-3">
        <p className="text-base text-black">
          <span className="font-medium">Phone:</span> {referrer.phone}
        </p>
        {referrer.email && (
          <p className="text-base text-black">
            <span className="font-medium">Email:</span> {referrer.email}
          </p>
        )}
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-900 rounded-lg text-white mb-3">
          <div>
            <div className="text-base text-black uppercase">Total</div>
            <div className="text-base font-medium">{stats.totalLeads || 0}</div>
          </div>
          <div>
            <div className="text-base text-black uppercase">Converted</div>
            <div className="text-base font-medium">{stats.convertedLeads || 0}</div>
          </div>
          <div>
            <div className="text-base text-black uppercase">Rate</div>
            <div className="text-base font-medium">
              {stats.conversionPercentage || 0}%
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onView(referrer)}
          className="flex-1 px-3 py-2 bg-slate-100 text-black rounded-lg hover:bg-gray-200 transition-colors text-base font-medium"
        >
          View
        </button>
        <button
          onClick={() => onEdit(referrer)}
          className="flex-1 px-3 py-2 bg-black text-white rounded-lg hover:bg-slate-800 transition-colors text-base font-medium"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(referrer._id)}
          className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-base font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ReferrerCard;
