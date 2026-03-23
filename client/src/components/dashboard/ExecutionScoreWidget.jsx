import React from 'react';

const ExecutionScoreWidget = ({ tasks }) => {
  const completed = tasks?.filter(t => t.completed).length || 0;
  const total = tasks?.length || 0;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md transition-shadow">
      <h3 className="text-slate-800 font-bold text-[0.95rem] mb-4 tracking-wide">Execution Score</h3>
      
      <div className="flex-1 flex items-center justify-start gap-8 ml-2 mt-2">
        <div className="relative w-28 h-28 flex items-center justify-center">
          <svg className="transform -rotate-90 w-full h-full drop-shadow-sm">
            <circle
              cx="56"
              cy="56"
              r={radius}
              stroke="currentColor"
              strokeWidth="9"
              fill="transparent"
              className="text-[#f1f5f9]"
            />
            <circle
              cx="56"
              cy="56"
              r={radius}
              stroke="currentColor"
              strokeWidth="9"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="text-[#20a144]"
              style={{ transition: "stroke-dashoffset 0.8s ease-in-out" }}
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-3xl font-normal tracking-tight text-slate-800 flex items-baseline">
              {percentage}<span className="text-lg font-medium">%</span>
            </span>
          </div>
        </div>

        <div className="flex flex-col">
          <span className="text-[0.8rem] font-medium text-slate-500">
            {completed} / {total} tasks completed
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExecutionScoreWidget;
