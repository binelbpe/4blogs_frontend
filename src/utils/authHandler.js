export const checkTokenExpiration = (token) => {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    console.error("Token validation error:", error);
    return true;
  }
};

export const handleAuthError = (error) => {
  const isAuthError =
    error.response?.status === 401 ||
    error.response?.data?.message?.toLowerCase().includes("expired") ||
    error.response?.data?.message?.toLowerCase().includes("invalid token");

  if (isAuthError) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("token");
    window.location.href = "/login";
    return true;
  }
  return false;
};

export const getAuthHeaders = () => {
  const accessToken = localStorage.getItem("accessToken");
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
};
