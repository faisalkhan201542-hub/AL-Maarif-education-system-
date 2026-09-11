import React from 'react';

export default function PageHeader({ title, subtitle, rightElement, className = '' }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 shadow-lg border border-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 ${className}`}>
      {/* Background Decorative Circles */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-20 -mb-10 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl pointer-events-none"></div>
      
      <div className="relative z-10">
        <h1 className="text-2xl font-black tracking-tight drop-shadow-sm">{title}</h1>
        {subtitle && <p className="text-blue-100 mt-1 font-medium text-sm">{subtitle}</p>}
      </div>
      
      {rightElement && (
        <div className="relative z-10">
          {rightElement}
        </div>
      )}
    </div>
  );
}
