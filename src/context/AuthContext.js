import React, { createContext, useContext, useState, useEffect } from "react";
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

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      if (token && !checkTokenExpiration(token)) {
        try {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          const userData = await getProfile();
          dispatch(
            setCredentials({
              user: { ...userData, _id: userData._id || userData.id },
              token,
            })
          );
        } catch (error) {
          console.error("Auth initialization error:", error);
          handleLogout();
        }
      } else if (token) {
        handleLogout();
      }
      setLoading(false);
    };

    initializeAuth();
  }, [dispatch]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    api.defaults.headers.common["Authorization"] = null;
    dispatch({ type: "auth/logout" });
    navigate("/login", { replace: true });

    // Clear any cached data or state
    sessionStorage.clear();
    // If you're using query cache (like react-query), clear it here
  };

  const login = (userData) => {
    const token = localStorage.getItem("token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    dispatch(
      setCredentials({
        user: { ...userData, _id: userData._id || userData.id },
        token,
      })
    );
  };

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
