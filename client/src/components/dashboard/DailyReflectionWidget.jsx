import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';

const DailyReflectionWidget = () => {
  const [reflection, setReflection] = useState(() => {
    return JSON.parse(localStorage.getItem('dailyReflection')) || { win: '', mistake: '', improvement: '' };
  });

  useEffect(() => {
    localStorage.setItem('dailyReflection', JSON.stringify(reflection));
  }, [reflection]);

  const handleChange = (field, value) => {
    setReflection({ ...reflection, [field]: value });
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col h-[400px] hover:shadow-md transition-shadow">
      <h3 className="text-slate-800 font-bold text-[0.95rem] tracking-wide mb-5">Daily Reflection</h3>

      <div className="flex-1 space-y-5 mt-1">
        
        {/* Win Input */}
        <div className="group border-b border-transparent hover:border-slate-100 pb-1.5 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <label className="text-[0.85rem] font-bold text-slate-800 min-w-28">One Win</label>
            <input 
              type="text" 
              value={reflection.win}
              onChange={(e) => handleChange('win', e.target.value)}
              placeholder="Deployed first version..."
              className="w-full text-[0.85rem] text-slate-500 font-medium bg-transparent focus:outline-none placeholder:text-slate-300"
            />
          </div>
        </div>

        {/* Mistake Input */}
        <div className="group border-b border-transparent hover:border-slate-100 pb-1.5 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <label className="text-[0.85rem] font-bold text-slate-800 min-w-28">One Mistake</label>
            <input 
              type="text" 
              value={reflection.mistake}
              onChange={(e) => handleChange('mistake', e.target.value)}
              placeholder="Got distracted on YouTube..."
              className="w-full text-[0.85rem] text-slate-500 font-medium bg-transparent focus:outline-none placeholder:text-slate-300"
            />
          </div>
        </div>

        {/* Improvement Input */}
        <div className="group border-b border-transparent hover:border-slate-100 pb-1.5 transition-all relative">
          <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
            <label className="text-[0.85rem] font-bold text-slate-800 min-w-28 mt-0.5">One Improvement</label>
            <textarea 
              value={reflection.improvement}
              onChange={(e) => handleChange('improvement', e.target.value)}
              placeholder="Focus more on deep work tomorrow..."
              className="w-full text-[0.85rem] text-slate-500 font-medium bg-transparent focus:outline-none placeholder:text-slate-300 resize-none h-10 pr-6"
            />
            <ChevronRight className="w-3.5 h-3.5 absolute right-0 top-1 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

      </div>

      <button className="w-full bg-[#4f86f7] hover:bg-blue-600 shadow-sm text-white font-semibold text-[0.85rem] py-2.5 rounded-lg transition-colors mt-2">
        Save Reflection
      </button>
    </div>
  );
};

export default DailyReflectionWidget;
