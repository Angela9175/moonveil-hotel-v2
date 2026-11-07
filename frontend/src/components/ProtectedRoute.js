import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles = [] }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles.length && !roles.includes(user.role)) {
    const redirect = user.role === 'admin' ? '/admin' : user.role === 'staff' ? '/staff' : '/';
    return <Navigate to={redirect} replace />;
  }

  return children;
}