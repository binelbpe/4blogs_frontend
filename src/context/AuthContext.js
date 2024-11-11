import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProfile } from "../api/userapi";
import { setCredentials, selectCurrentUser } from "../store/slice/userSlice";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import { checkTokenExpiration } from "../utils/authHandler";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    api.defaults.headers.common["Authorization"] = null;
    dispatch({ type: "auth/logout" });
    navigate("/login", { replace: true });
    sessionStorage.clear();
  }, [dispatch, navigate]);

  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = localStorage.getItem("accessToken");
      
      if (accessToken && !checkTokenExpiration(accessToken)) {
        try {
          api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
          const userData = await getProfile();
          
          dispatch(
            setCredentials({
              user: userData,
              token: accessToken,
            })
          );
        } catch (error) {
          console.error("Auth initialization error:", error);
          handleLogout();
        }
      } else if (accessToken) {
        handleLogout();
      }
      setLoading(false);
    };

    initializeAuth();
  }, [dispatch, handleLogout]);

  const login = useCallback((userData) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      dispatch(
        setCredentials({
          user: userData,
          token: accessToken,
        })
      );
    }
  }, [dispatch]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
