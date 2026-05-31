import React from "react";

const EmptyTableState = ({ title, description }) => {
  return (
    <div className="flex min-h-[280px] w-full items-center justify-center px-4 py-10">
      <div className="w-full max-w-md px-6 py-8 text-center">
        <div className="mx-auto mb-5 flex h-28 w-28 items-center justify-center rounded-full bg-transparent">
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-sm"
            aria-hidden="true"
          >
            <path
              d="M47 18H73C76.866 18 80 21.134 80 25V30H47V18Z"
              fill="#D1D5DB"
            />
            <rect x="32" y="28" width="56" height="72" rx="12" fill="#F8FAFC" stroke="#C7CDD7" strokeWidth="2" />
            <rect x="42" y="40" width="28" height="6" rx="3" fill="#D1D5DB" />
            <rect x="42" y="52" width="36" height="4" rx="2" fill="#E2E8F0" />
            <rect x="42" y="61" width="30" height="4" rx="2" fill="#E2E8F0" />
            <rect x="42" y="70" width="34" height="4" rx="2" fill="#E2E8F0" />
            <rect x="42" y="79" width="24" height="4" rx="2" fill="#E2E8F0" />
            <circle cx="50" cy="44" r="4" fill="#94A3B8" />
            <path d="M29 77C24 79 20 83 18 88" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
            <path d="M35 87L26 86" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
            <path d="M36 84C31 82 27 79 24 75" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
            <circle cx="90" cy="42" r="10" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4 4" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold tracking-tight text-slate-900">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
};

export default EmptyTableState;