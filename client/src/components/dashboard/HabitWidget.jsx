import React from 'react';
import { Flame, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HabitWidget = ({ habits = [], setHabits }) => {
  const navigate = useNavigate();

  const toggleHabit = (id) => {
    setHabits(habits.map(h => 
      (h.habitId === id || h._id === id) ? { ...h, completed: !h.completed } : h
    ));
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-orange-50 text-orange-500 rounded-lg">
          <Flame className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Daily Habits</h2>
      </div>

      <div className="flex flex-col gap-3">
        {habits.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-slate-400 space-y-3">
            <span className="text-sm font-semibold tracking-wide">No habits added.</span>
            <button 
              onClick={() => navigate('/habits')} 
              className="text-xs bg-indigo-50 text-indigo-500 px-4 py-2 rounded-lg font-bold hover:bg-indigo-100 transition-colors"
            >
              Configure Habits
            </button>
          </div>
        ) : (
          habits.map(habit => {
            const id = habit.habitId || habit._id;
            return (
              <div 
                key={id || Math.random()} 
                className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer group hover:shadow-sm ${
                  habit.completed 
                    ? 'bg-orange-50/30 border-orange-100' 
                    : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                }`}
                onClick={() => id && toggleHabit(id)}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className={`w-6 h-6 rounded-md flex items-center justify-center border-2 transition-colors duration-300 ${
                      habit.completed 
                        ? 'bg-orange-500 border-orange-500 text-white' 
                        : 'border-slate-300 bg-white text-transparent group-hover:border-slate-400'
                    }`}
                  >
                    <Check className="w-4 h-4" strokeWidth={3} />
                  </div>
                  <span className={`font-semibold tracking-wide transition-colors ${
                    habit.completed ? 'text-slate-400 line-through' : 'text-slate-700'
                  }`}>
                    {habit.name}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HabitWidget;
