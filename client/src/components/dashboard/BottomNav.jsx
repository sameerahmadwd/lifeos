import React from 'react';
import { LayoutDashboard, CheckSquare, Flame, StickyNote, UserCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/', icon: LayoutDashboard },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Habits', path: '/habits', icon: Flame },
    { name: 'Journal', path: '/notes', icon: StickyNote },
    { name: 'Profile', path: '/profile', icon: UserCircle },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 z-[60] pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          const Icon = link.icon;
          
          return (
            <button
              key={link.name}
              onClick={() => navigate(link.path)}
              className="flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform"
            >
              <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-indigo-50' : 'bg-transparent'}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[0.65rem] font-medium leading-none ${isActive ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}>
                {link.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
