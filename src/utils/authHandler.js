export const checkTokenExpiration = (token) => {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
 
    if (payload.exp * 1000 < Date.now()) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Token validation error:', error);
    return true;
  }
};

export const handleAuthError = (error) => {
  const isAuthError = 
    error.response?.status === 401 || 
    error.response?.data?.message?.toLowerCase().includes('expired') ||
    error.response?.data?.message?.toLowerCase().includes('invalid token');

  if (isAuthError) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    return true;
  }
  return false;
}; 