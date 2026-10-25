// src/components/RouteGuards.tsx
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../hooks/redux';

interface RouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: RouteProps) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login, but save the location they tried to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render the children (which will be the AppLayout wrapping the Outlet)
  return <>{children}</>;
};

export const PublicOnlyRoute = ({ children }: RouteProps) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (isAuthenticated) {
    // If already logged in, prevent access to Login/Register
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};