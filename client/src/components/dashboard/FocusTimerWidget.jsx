import React, { useState, useEffect } from 'react';
import { Timer, Play, Pause, RotateCcw } from 'lucide-react';

const FocusTimerWidget = ({ focusTime, setFocusTime }) => {
  const WORK_TIME = 25 * 60; // 25 minutes
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      clearInterval(interval);
      setFocusTime(prev => prev + 25);
      alert("Session Complete! Great focus.");
      setTimeLeft(WORK_TIME);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, setFocusTime]);

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(WORK_TIME);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const progressPercentage = ((WORK_TIME - timeLeft) / WORK_TIME) * 100;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden h-[240px]">
      
      {/* Background Animated Progress Bar */}
      <div 
        className="absolute bottom-0 left-0 h-1 bg-emerald-500 transition-all duration-1000 ease-linear"
        style={{ width: `${progressPercentage}%` }}
      />

      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg">
          <Timer className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Deep Focus</h2>
      </div>

      <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-100 rounded-xl relative z-10 py-4">
        <div className="text-5xl font-black text-slate-800 tracking-tighter tabular-nums mb-4 drop-shadow-sm">
          {formatTime(timeLeft)}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTimer}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-white transition-all shadow-sm text-sm ${
              isRunning 
                ? 'bg-amber-500 hover:bg-amber-600 hover:shadow-amber-500/25' 
                : 'bg-emerald-500 hover:bg-emerald-600 hover:shadow-emerald-500/25'
            }`}
          >
            {isRunning ? (
              <><Pause className="w-4 h-4 fill-current" /> Pause</>
            ) : (
              <><Play className="w-4 h-4 fill-current" /> Start</>
            )}
          </button>

          <button
            onClick={resetTimer}
            className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-all"
            title="Reset Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FocusTimerWidget;
