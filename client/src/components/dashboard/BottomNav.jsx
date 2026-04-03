import React, { useState } from 'react';
import { 
  LayoutDashboard, CheckSquare, Flame, Trophy, 
  MoreHorizontal, History, Settings, UserCircle, 
  StickyNote, X
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const primaryLinks = [
    { name: 'Home', path: '/', icon: LayoutDashboard },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Habits', path: '/habits', icon: Flame },
    { name: 'Goals', path: '/goals', icon: Trophy },
  ];

  const moreLinks = [
    { name: 'Journal', path: '/notes', icon: StickyNote },
    { name: 'Engagement', path: '/sessions', icon: History },
    { name: 'Profile', path: '/profile', icon: UserCircle },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const NavItem = ({ link, isActive, onClick }) => {
    const Icon = link.icon;
    return (
      <button
        onClick={onClick || (() => navigate(link.path))}
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
  };

  return (
    <>
      {/* More Menu Overlay */}
      {showMoreMenu && (
        <div className="md:hidden fixed inset-0 z-[70] bg-site/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute bottom-20 left-4 right-4 bg-card border border-border rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-main">Quick Explore</h3>
              <button 
                onClick={() => setShowMoreMenu(false)}
                className="p-2 bg-input rounded-xl text-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {moreLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => {
                    navigate(link.path);
                    setShowMoreMenu(false);
                  }}
                  className="flex items-center gap-4 p-4 bg-input hover:bg-input-hover rounded-2xl transition-all active:scale-95 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border shadow-sm group-hover:border-primary/30 group-hover:text-primary transition-colors">
                    <link.icon className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-main text-sm">{link.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Nav Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-md border-t border-border z-[60] pb-safe transition-colors duration-300">
        <div className="flex items-center justify-around h-16 px-2">
          {primaryLinks.map((link) => (
            <NavItem 
              key={link.name} 
              link={link} 
              isActive={location.pathname === link.path} 
            />
          ))}
          
          <NavItem 
            link={{ name: 'More', icon: MoreHorizontal }} 
            isActive={showMoreMenu} 
            onClick={() => setShowMoreMenu(!showMoreMenu)}
          />
        </div>
      </div>
    </>
  );
};

export default BottomNav;
