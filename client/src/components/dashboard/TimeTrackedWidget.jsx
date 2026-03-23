import React from 'react';
import { ChevronRight } from 'lucide-react';

const TimeTrackedWidget = () => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col h-[400px] hover:shadow-md transition-shadow">
      <h3 className="text-slate-800 font-bold text-[0.95rem] tracking-wide mb-6">Time Tracked Today</h3>

      <div className="flex justify-between items-center mb-7 cursor-pointer group">
        <span className="text-[0.9rem] font-medium text-slate-700">Total Tracked Time</span>
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800 text-[0.9rem]">4h 55m</span>
          <span className="text-xs font-semibold text-slate-400">/ 8h</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500" />
        </div>
      </div>

      <div className="space-y-6">
        
        {/* Productive Time */}
        <div>
          <div className="flex justify-between items-end mb-1.5">
            <span className="text-[0.85rem] font-semibold text-slate-700">Productive Time</span>
            <span className="text-[0.85rem] font-semibold text-slate-800">3h 20m</span>
          </div>
          <div className="w-full bg-[#f1f5f9] rounded-full h-1.5">
            <div className="bg-[#78bca0] h-1.5 rounded-full" style={{ width: '65%' }}></div>
          </div>
        </div>

        {/* Learning Time */}
        <div>
          <div className="flex justify-between items-end mb-1.5">
            <span className="text-[0.85rem] font-semibold text-slate-700">Learning Time</span>
            <span className="text-[0.85rem] font-semibold text-[#7fa1d3]">40 min</span>
          </div>
          <div className="w-full bg-[#f1f5f9] rounded-full h-1.5">
            <div className="bg-[#7fa1d3] h-1.5 rounded-full" style={{ width: '15%' }}></div>
          </div>
        </div>

        {/* Wasted Time */}
        <div>
          <div className="flex justify-between items-end mb-1.5">
            <span className="text-[0.85rem] font-semibold text-slate-700">Wasted Time</span>
            <span className="text-[0.85rem] font-semibold text-[#d96666]">1h 55m</span>
          </div>
          <div className="w-full bg-[#f1f5f9] rounded-full h-1.5 flex overflow-hidden">
            <div className="bg-[#d96666] h-full" style={{ width: '35%' }}></div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TimeTrackedWidget;
