import React from 'react';

const WeeklySummaryWidget = () => {
  const days = [
    { name: 'M', height1: 60, height2: 40 },
    { name: 'T', height1: 40, height2: 30 },
    { name: 'W', height1: 75, height2: 25 },
    { name: 'T', height1: 35, height2: 20 },
    { name: 'F', height1: 45, height2: 25 },
    { name: 'S', height1: 50, height2: 35 },
    { name: 'S', height1: 30, height2: 15 },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
      
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-slate-800 font-bold text-[0.95rem] tracking-wide">Weekly Summary</h3>
        <div className="text-[0.8rem] font-medium text-slate-500">
          Total Focus Time: <span className="font-bold text-slate-800 ml-1">17h 30m</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col md:flex-row justify-between items-end gap-10">
        
        {/* Stats Left */}
        <div className="flex flex-col justify-end gap-5 w-full md:w-auto h-full pb-1">
          <div className="flex items-center gap-2">
            <span className="text-[0.85rem] font-medium text-slate-500">Total Focus Time: </span>
            <span className="font-bold text-slate-800 text-[0.95rem]">17h 30m</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[0.85rem] font-medium text-slate-500">Avg Execution: </span>
            <span className="font-bold text-slate-800 text-[0.95rem]">72%</span>
          </div>
        </div>

        {/* Chart Right */}
        <div className="flex-1 max-w-[400px] w-full flex justify-between items-end h-24">
          {days.map((day, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 group cursor-pointer w-full">
              <div className="w-8 flex flex-col justify-end gap-1 h-20 w-full px-2">
                <div 
                  className="w-full bg-[#8fb6fd] rounded-t-sm transition-all group-hover:bg-[#72a1fa]" 
                  style={{ height: `${day.height1}%` }}
                ></div>
                <div 
                  className="w-full bg-[#d6e5ff] rounded-b-sm transition-all group-hover:bg-[#b0ccf7]" 
                  style={{ height: `${day.height2}%` }}
                ></div>
              </div>
              <span className="text-[0.7rem] font-bold text-slate-400">{day.name}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default WeeklySummaryWidget;
