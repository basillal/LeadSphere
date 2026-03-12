import React from "react";

/**
 * MobileCard - A reusable, professionally aligned card component for mobile views.
 * 
 * @param {Object} props
 * @param {string} props.title - Main heading
 * @param {string} props.subtitle - Secondary info below title
 * @param {string} props.status - Status text
 * @param {string} props.statusColor - Tailwind classes for status badge
 * @param {Array} props.data - Array of { icon, value, label }
 * @param {Array} props.actions - Array of { icon, label, onClick, color }
 * @param {Function} props.onClick - Optional card click handler
 */
const MobileCard = ({
  title,
  subtitle,
  status,
  statusColor = "bg-white/50 text-[#2E6F40]",
  data = [],
  actions = [],
  onClick,
}) => {
  return (
    <div
      className="bg-[#CFFFDC] border border-[#2E6F40]/30 rounded-2xl p-4 transition-all active:scale-[0.98] cursor-pointer shadow-md hover:shadow-lg relative overflow-hidden group"
      onClick={onClick}
    >
      {/* Decorative Forest Accent */}
      <div className="absolute top-0 left-0 w-1 h-full bg-[#2E6F40]/20" />

      {/* Header Section */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-[#253D2C] text-[14px] uppercase truncate leading-tight tracking-wider mb-0.5">
            {title}
          </h3>
          {subtitle && (
            <div className="flex items-center gap-1.5 opacity-90">
               <div className="w-1 h-1 rounded-full bg-[#2E6F40]/40" />
               <p className="text-[10px] text-[#2E6F40] font-bold truncate tracking-wide">
                {subtitle}
              </p>
            </div>
          )}
        </div>
        {status && (
          <span
            className={`shrink-0 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${statusColor} border border-[#2E6F40]/10 shadow-sm`}
          >
            {status}
          </span>
        )}
      </div>

      {/* Structured Data Grid */}
      {data.length > 0 && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-3 border-t border-[#2E6F40]/10">
          {data.filter(item => item.value).map((item, idx) => (
            <div key={idx} className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-1.5">
                {item.icon && (
                  <span className="text-[12px] opacity-80 shrink-0">
                    {item.icon}
                  </span>
                )}
                <span className="text-[8px] uppercase font-black text-[#2E6F40]/60 tracking-tight">
                  {item.label}
                </span>
              </div>
              <span className="text-[11px] text-[#253D2C] font-extrabold truncate pl-0.5">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Action Footer */}
      {actions.length > 0 && (
        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-[#2E6F40]/5">
          {actions.map((action, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick();
              }}
              className={`w-9 h-9 rounded-xl transition-all flex items-center justify-center bg-white/60 hover:bg-white border border-[#2E6F40]/10 shadow-sm active:scale-90 ${action.color || "text-[#2E6F40]"}`}
              title={action.label}
            >
              <span className="scale-110">{action.icon}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MobileCard;
