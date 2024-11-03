import { Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { checkTokenExpiration } from '../utils/authHandler';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // Check if token exists and is valid
    if (!token || checkTokenExpiration(token)) {
      localStorage.removeItem('token');
      navigate('/login', { replace: true, state: { from: location } });
      return;
    }

    // If no user, redirect to login
    if (!user) {
      navigate('/login', { replace: true, state: { from: location } });
    }

    // Add event listener for browser back/forward buttons
    const handlePopState = () => {
      const currentToken = localStorage.getItem('token');
      if (!currentToken || checkTokenExpiration(currentToken)) {
        navigate('/login', { replace: true });
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [user, navigate, location]);

  // Immediate check for authentication
  if (!user || !localStorage.getItem('token')) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute; 