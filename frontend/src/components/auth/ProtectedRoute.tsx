import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingState } from '../common/LoadingState';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowIncompleteOnboarding?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowIncompleteOnboarding = false,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-color-black">
        <LoadingState message="Verifying operative security token..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect unauthenticated visitors to login, saving their intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user has not completed onboarding and is not permitted, redirect to /onboarding
  if (user && !user.onboardingCompleted && !allowIncompleteOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
