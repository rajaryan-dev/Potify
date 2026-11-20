import { NavLink } from 'react-router-dom';
import { Home, Library, Search, User } from 'lucide-react';

const item = ({ isActive }) =>
  `flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${isActive ? 'text-white' : 'text-muted'}`;

export default function MobileNav() {
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-50 flex h-14 border-t border-white/10 bg-black md:hidden">
      <NavLink to="/" end className={item}><Home size={22} />Home</NavLink>
      <NavLink to="/search" className={item}><Search size={22} />Search</NavLink>
      <NavLink to="/library" className={item}><Library size={22} />Library</NavLink>
      <NavLink to="/profile" className={item}><User size={22} />Profile</NavLink>
    </nav>
  );
}
