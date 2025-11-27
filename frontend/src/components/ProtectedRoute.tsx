import { useAuth } from '@/context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // You can add a loading spinner here
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};