import React, { useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { checkTokenExpiration } from "../utils/authHandler";
import api from "../api/api";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("ProtectedRoute check initiated");
    const checkAuth = async () => {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      console.log("Access token present:", !!accessToken);
      console.log("Refresh token present:", !!refreshToken);
      console.log("User present:", !!user);

      if (!accessToken && !refreshToken) {
        console.log("No tokens found, redirecting to login");
        navigate("/login", { replace: true, state: { from: location } });
        return;
      }

      if (accessToken && checkTokenExpiration(accessToken) && refreshToken) {
        console.log("Access token expired, attempting refresh");
        try {
          const response = await api.post("/refresh-token", { refreshToken });
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
            response.data.data;

          localStorage.setItem("accessToken", newAccessToken);
          localStorage.setItem("refreshToken", newRefreshToken);
          api.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${newAccessToken}`;

          console.log("Token refresh successful");
          return;
        } catch (error) {
          console.error("Token refresh failed:", error);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          navigate("/login", { replace: true, state: { from: location } });
          return;
        }
      }

      if (!user) {
        console.log("No user found, redirecting to login");
        navigate("/login", { replace: true, state: { from: location } });
      }
    };

    checkAuth();
  }, [user, navigate, location]);

  // Only redirect if there's no user AND no tokens
  if (
    !user &&
    !localStorage.getItem("accessToken") &&
    !localStorage.getItem("refreshToken")
  ) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
