import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loading } from './States';

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="flex h-full items-center justify-center bg-black"><Loading label="Loading…" /></div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return children;
}

// Login/Register are only for signed-out users
export function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-full items-center justify-center bg-black"><Loading label="Loading…" /></div>;
  if (user) return <Navigate to="/" replace />;
  return children;
}
