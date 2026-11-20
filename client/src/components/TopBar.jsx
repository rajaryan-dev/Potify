import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Music2, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function TopBar() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  async function handleLogout() {
    await logout();
    toast('Logged out');
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between bg-surface/90 px-4 py-3 backdrop-blur md:px-8">
      <Link to="/" className="flex items-center gap-2 font-extrabold md:invisible">
        <Music2 className="text-brand" size={22} /> Potify
      </Link>
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Account menu"
          className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-elevated text-sm font-bold ring-2 ring-black hover:ring-white/40"
        >
          {user.profileImage ? <img src={user.profileImage} alt="" className="h-full w-full object-cover" /> : user.username[0].toUpperCase()}
        </button>
        {open && (
          <div role="menu" className="fade-in absolute right-0 mt-2 w-48 rounded-lg bg-elevated p-1 text-sm shadow-2xl">
            <p className="truncate px-3 py-2 text-xs text-muted">{user.username}</p>
            <Link role="menuitem" to="/profile" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded px-3 py-2 hover:bg-hover">
              <User size={16} /> Profile
            </Link>
            <button role="menuitem" onClick={handleLogout} className="flex w-full items-center gap-2 rounded px-3 py-2 text-left hover:bg-hover">
              <LogOut size={16} /> Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
