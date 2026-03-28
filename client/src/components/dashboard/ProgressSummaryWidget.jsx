import { Flame, CheckCircle2 } from 'lucide-react';
import TimeTrackerWidget from './TimeTrackerWidget';

const ProgressSummaryWidget = ({ completedTasks, totalTasks, completedHabits, totalHabits }) => {
  const taskPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  const habitPercent = totalHabits === 0 ? 0 : Math.round((completedHabits / totalHabits) * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* Habit Overview */}
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border flex items-center gap-4 hover:shadow-md transition-all duration-300">
        <div className="p-4 bg-orange-50 text-orange-600 rounded-xl flex-shrink-0">
          <Flame className="w-8 h-8" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-muted uppercase tracking-wider mb-1">Daily Habits</p>
          <div className="flex justify-between items-end">
            <h3 className="text-2xl font-bold text-main">{completedHabits} <span className="text-base font-medium text-muted/50">/ {totalHabits}</span></h3>
            <span className="text-xs font-bold text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-2.5 py-1 rounded-full">{habitPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
            <div className="bg-orange-500 h-2 rounded-full transition-all duration-500" style={{ width: `${habitPercent}%` }}></div>
          </div>
        </div>
      </div>

      {/* Task Overview */}
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border flex items-center gap-4 hover:shadow-md transition-all duration-300">
        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl flex-shrink-0">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-muted uppercase tracking-wider mb-1">Today's Tasks</p>
          <div className="flex justify-between items-end">
            <h3 className="text-2xl font-bold text-main">{completedTasks} <span className="text-base font-medium text-muted/50">/ {totalTasks}</span></h3>
            <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">{taskPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
            <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${taskPercent}%` }}></div>
          </div>
        </div>
      </div>

      {/* Active Time Overview */}
      <TimeTrackerWidget variant="compact" />

    </div>
  );
};

export default ProgressSummaryWidget;
