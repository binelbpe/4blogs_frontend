import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/userapi";
import { useAuth } from "../context/AuthContext";
import { useDispatch } from "react-redux";
import { setCredentials } from "../store/slice/userSlice";
import api from "../api/api";
import { VALIDATION_RULES, ERROR_MESSAGES } from '../constants/validation';
import { API_ENDPOINTS } from '../constants/api';
import { ROUTES } from '../constants/routes';

const Login = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendError, setBackendError] = useState(null);

  const validateForm = () => {
    const errors = {};
    const { identifier, password } = formData;

    const isEmail = identifier.includes("@");
    if (isEmail) {
      if (!VALIDATION_RULES.EMAIL.test(identifier)) {
        errors.identifier = ERROR_MESSAGES.INVALID_EMAIL;
      }
    } else {
      if (!VALIDATION_RULES.PHONE.test(identifier.replace(/[-()\s]/g, ""))) {
        errors.identifier = ERROR_MESSAGES.INVALID_PHONE;
      }
    }

    if (!VALIDATION_RULES.PASSWORD.test(password)) {
      errors.password = ERROR_MESSAGES.INVALID_PASSWORD;
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (backendError) {
      setBackendError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBackendError(null);
    const errors = validateForm();

    if (Object.keys(errors).length === 0) {
      setIsSubmitting(true);
      try {
        const response = await login(formData);

        if (response.success && response.data) {
          const { accessToken, refreshToken, user } = response.data;

          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);

          api.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${accessToken}`;

          dispatch(setCredentials({ user, token: accessToken }));
          authLogin(user);

          navigate("/", { replace: true });
        } else {
          throw new Error(response.message || "Login failed");
        }
      } catch (error) {
        console.error("Login error:", error);
        setBackendError(
          error.response?.data?.message ||
            error.message ||
            "An unexpected error occurred. Please try again."
        );
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setFormErrors(errors);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {backendError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{backendError}</p>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="identifier" className="form-label">
                Email or Phone
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                className={`input-field ${
                  formErrors.identifier || backendError
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                value={formData.identifier}
                onChange={handleChange}
                placeholder="Enter email or phone number"
              />
              {formErrors.identifier && (
                <div className="text-red-500 text-sm mt-1">
                  {formErrors.identifier}
                </div>
              )}
            </div>

            <div className="mt-4">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className={`input-field ${
                  formErrors.password || backendError
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                value={formData.password}
                onChange={handleChange}
              />
              {formErrors.password && (
                <div className="text-red-500 text-sm mt-1">
                  {formErrors.password}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end">
            <Link
              to="/forgot-password"
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              Forgot your password?
            </Link>
          </div>

          <div>
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        <div className="text-center">
          <Link
            to="/register"
            className="text-primary-600 hover:text-primary-700"
          >
            Don't have an account? Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
