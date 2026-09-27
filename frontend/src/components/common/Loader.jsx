import React from "react";

const Loader = ({ local = false }) => {
  return (
    <div className={local ? "absolute top-0 left-0 right-0 z-50 pointer-events-none" : "fixed top-0 left-0 right-0 z-[10000] pointer-events-none"}>
      <div className="h-[3px] w-full overflow-hidden bg-transparent">
        <div 
          className="absolute top-0 h-full bg-slate-900 shadow-[0_0_10px_rgba(15,23,42,0.3)]"
          style={{
            animation: 'global-loader-slide 1.2s ease-in-out infinite',
          }}
        />
      </div>
      <style>
        {`
          @keyframes global-loader-slide {
            0% { left: -40%; width: 30%; }
            50% { left: 20%; width: 50%; }
            100% { left: 100%; width: 30%; }
          }
        `}
      </style>
    </div>
  );
};

export default Loader;
