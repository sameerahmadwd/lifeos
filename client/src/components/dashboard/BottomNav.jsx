import React from 'react';
import { LayoutDashboard, CheckSquare, Flame, StickyNote, UserCircle, History } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/', icon: LayoutDashboard },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Habits', path: '/habits', icon: Flame },
    { name: 'History', path: '/sessions', icon: History },
    { name: 'Journal', path: '/notes', icon: StickyNote },
    { name: 'Profile', path: '/profile', icon: UserCircle },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-md border-t border-border z-[60] pb-safe transition-colors duration-300">
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
              <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-primary/10' : 'bg-transparent'}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted'}`} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[0.65rem] font-medium leading-none ${isActive ? 'text-primary font-bold' : 'text-muted'}`}>
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
