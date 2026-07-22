import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
        <div className="flex flex-col items-center gap-3">
          <img src="/tap-intro-logo.svg" alt="Tap-Intro Logo" className="w-12 h-12 object-contain" />
          <Loader2 size={32} className="text-sky-400 animate-spin" />
        </div>
        <p className="text-gray-400 text-sm">Tap-Intro</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
