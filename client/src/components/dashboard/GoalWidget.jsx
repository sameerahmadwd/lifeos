import React from 'react';
import { Trophy, Target, ChevronRight, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GoalWidget = ({ goal }) => {
  const navigate = useNavigate();

  if (!goal) {
    return (
      <div 
        onClick={() => navigate('/goals')}
        className="bg-card rounded-2xl p-6 shadow-sm border border-border flex flex-col items-center justify-center text-center space-y-4 hover:shadow-md transition-all h-full cursor-pointer group"
      >
        <div className="p-3 bg-primary/5 text-primary/40 rounded-full group-hover:scale-110 transition-transform">
           <Target className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <p className="font-bold text-main text-sm">No Active Goals</p>
          <p className="text-[0.65rem] text-muted font-medium uppercase tracking-wider">Start your first journey</p>
        </div>
      </div>
    );
  }

  const progress = Math.min(Math.round((goal.currentValue / goal.targetValue) * 100), 100);
  const level = Math.min(Math.floor(progress / (100 / (goal.levelConfig?.numberOfLevels || 5))) + 1, goal.levelConfig?.numberOfLevels || 5);

  return (
    <div 
      onClick={() => navigate(`/goals/${goal._id}`)}
      className="bg-card rounded-2xl p-6 shadow-sm border border-border flex flex-col hover:shadow-md transition-all duration-300 h-full cursor-pointer group relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
            <Trophy className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-main truncate max-w-[150px]">{goal.title}</h2>
        </div>
        <div className="px-2 py-0.5 bg-primary/10 text-primary rounded-md text-[0.6rem] font-black uppercase tracking-widest">
           Level {level}
        </div>
      </div>

      <div className="flex-1 space-y-4">
         <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black tracking-tighter tabular-nums text-main">
               {goal.currentValue.toLocaleString()}
               <span className="text-xs font-bold text-muted ml-1 uppercase">/ {goal.targetValue.toLocaleString()}</span>
            </div>
            <div className="text-sm font-black text-primary">{progress}%</div>
         </div>

         <div className="space-y-2">
            <div className="w-full h-2.5 bg-input rounded-full overflow-hidden p-0.5 border border-border/50">
               <div 
                 className="h-full bg-gradient-to-r from-primary to-indigo-400 rounded-full transition-all duration-1000"
                 style={{ width: `${progress}%` }}
               />
            </div>
            <div className="flex justify-between items-center text-[0.6rem] font-bold text-muted uppercase tracking-widest">
               <span>Progress</span>
               <div className="flex items-center gap-1 group-hover:text-primary transition-colors">
                  Details <ChevronRight className="w-3 h-3" />
               </div>
            </div>
         </div>
      </div>

      {/* Decorative background element */}
      <Rocket className="absolute -right-2 -bottom-2 w-12 h-12 text-primary/5 -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
    </div>
  );
};

export default GoalWidget;
