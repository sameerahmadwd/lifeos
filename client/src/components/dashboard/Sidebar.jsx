import { LayoutDashboard, Flame, Settings, UserCircle, StickyNote, CheckSquare, Activity } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Master Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Habits Tracker', path: '/habits', icon: Flame },
    { name: 'Engagement', path: '/sessions', icon: Activity },
    { name: 'Journal', path: '/notes', icon: StickyNote }, 
    { name: 'Profile', path: '/profile', icon: UserCircle },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-[260px] bg-card border-r border-border hidden md:flex flex-col fixed top-16 bottom-0 left-0 z-20 font-sans shadow-sm transition-colors duration-300">
      <div className="flex-1 overflow-y-auto pt-8">
        <div className="px-8 mb-4 text-[0.7rem] font-bold text-muted uppercase tracking-widest">
          Main Menu
        </div>
        
        <div className="mb-6 space-y-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            
            return (
              <div 
                key={link.name}
                onClick={() => navigate(link.path)}
                className={`px-4 py-3 mx-4 rounded-xl text-[0.95rem] cursor-pointer flex items-center gap-3 transition-all group ${
                  isActive 
                  ? 'bg-primary/10 text-primary font-bold' 
                  : 'text-muted font-medium hover:text-primary hover:bg-primary/5'
                }`}
              >
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-indigo-600' : 'group-hover:text-indigo-500'}`} strokeWidth={isActive ? 2.5 : 2} />
                <span>{link.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
