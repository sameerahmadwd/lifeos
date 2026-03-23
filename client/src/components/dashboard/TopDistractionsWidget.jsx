import React from 'react';
import { Info, Play, Twitter, MessageSquare } from 'lucide-react';

const TopDistractionsWidget = () => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-5">
        <h3 className="text-slate-800 font-bold text-[0.95rem] tracking-wide">Top Distraction</h3>
        <Info className="w-4 h-4 text-slate-400" />
      </div>

      <div className="space-y-4 mt-1">
        
        {/* Item 1 */}
        <div className="text-[0.85rem]">
          <div className="flex justify-between items-end mb-1">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center rounded-sm bg-red-100 text-[#ff0000]">
                <Play className="w-3 h-3 fill-current" />
              </div>
              <span className="font-semibold text-slate-700">YouTube</span>
              <span className="font-medium text-slate-800 ml-1">1h 55m</span>
            </div>
            <div className="text-slate-400 font-medium">1h 05m ❯</div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div className="bg-[#24a19c] h-1.5 rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>

        {/* Item 2 */}
        <div className="text-[0.85rem]">
          <div className="flex justify-between items-end mb-1">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center rounded-sm bg-blue-100 text-[#1da1f2]">
                <Twitter className="w-4 h-4 fill-current" />
              </div>
              <span className="font-semibold text-slate-700">Twitter</span>
              <span className="font-medium text-slate-800 ml-1">35m</span>
            </div>
            <div className="text-slate-400 font-medium">25m ❯</div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5"></div>
        </div>

        {/* Item 3 */}
        <div className="text-[0.85rem]">
          <div className="flex justify-between items-end mb-1">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center rounded-sm bg-orange-100 text-[#ff4500]">
                <MessageSquare className="w-4 h-4 fill-current" />
              </div>
              <span className="font-semibold text-slate-700">Reddit</span>
              <span className="font-medium text-slate-800 ml-1">25m</span>
            </div>
            <div className="text-slate-400 font-medium">17m ❯</div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5"></div>
        </div>

      </div>
    </div>
  );
};

export default TopDistractionsWidget;
