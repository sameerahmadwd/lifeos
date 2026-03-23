import React from 'react';
import { Flame, CheckCircle2, Clock } from 'lucide-react';

const ProgressSummaryWidget = ({ completedTasks, totalTasks, completedHabits, totalHabits, focusTime }) => {
  const taskPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  const habitPercent = totalHabits === 0 ? 0 : Math.round((completedHabits / totalHabits) * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Habit Overview */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
        {/* ... (Habit Card Content) ... */}
        <div className="p-4 bg-orange-50 text-orange-600 rounded-xl">
          <Flame className="w-8 h-8" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Daily Habits</p>
          <div className="flex justify-between items-end">
            <h3 className="text-2xl font-bold text-slate-800">{completedHabits} <span className="text-base font-medium text-slate-400">/ {totalHabits}</span></h3>
            <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2.5 py-1 rounded-full">{habitPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div className="bg-orange-500 h-2 rounded-full transition-all duration-500" style={{ width: `${habitPercent}%` }}></div>
          </div>
        </div>
      </div>

      {/* Task Overview */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Today's Tasks</p>
          <div className="flex justify-between items-end">
            <h3 className="text-2xl font-bold text-slate-800">{completedTasks} <span className="text-base font-medium text-slate-400">/ {totalTasks}</span></h3>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2.5 py-1 rounded-full">{taskPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div className="bg-indigo-500 h-2 rounded-full transition-all duration-500" style={{ width: `${taskPercent}%` }}></div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProgressSummaryWidget;
