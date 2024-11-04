import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/userapi";
import { useAuth } from "../context/AuthContext";
import Toast from "../components/Toast";
import { X } from "lucide-react";

const CATEGORIES = [
  "sports",
  "politics",
  "space",
  "technology",
  "entertainment",
  "health",
  "science",
  "business",
  "education",
  "travel",
  "food",
  "fashion",
  "art",
  "music",
  "gaming",
  "environment",
];

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    preferences: [],
    image: null,
  });

  const [formErrors, setFormErrors] = useState({});
  const [backendError, setBackendError] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const validateForm = () => {
    const errors = {};
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      confirmPassword,
      dateOfBirth,
      preferences,
      image,
    } = formData;

    if (!firstName.trim()) {
      errors.firstName = "First name is required";
    }

    if (!lastName.trim()) {
      errors.lastName = "Last name is required";
    }

    if (!email) {
      errors.email = "Email is required";
    } else if (!/^[a-zA-Z0-9._-]+@[a-z]+\.[a-z]{2,}$/.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!phone) {
      errors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(phone.replace(/[-()\s]/g, ""))) {
      errors.phone = "Please enter a valid 10-digit phone number";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
        password
      )
    ) {
      errors.password =
        "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!dateOfBirth) {
      errors.dateOfBirth = "Date of birth is required";
    } else {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13) {
        errors.dateOfBirth = "You must be at least 13 years old to register";
      }
    }

    if (preferences.length === 0) {
      errors.preferences = "Please select at least one preference";
    }

    if (!image) {
      errors.image = "Profile image is required";
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
      setBackendError("");
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      if (!file.type.startsWith("image/")) {
        setFormErrors((prev) => ({
          ...prev,
          image: "Please select an image file",
        }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setFormErrors((prev) => ({
          ...prev,
          image: "Image must be less than 5MB",
        }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      setFormData((prev) => ({ ...prev, image: file }));
      setFormErrors((prev) => ({ ...prev, image: "" }));
    } catch (error) {
      console.error("Error handling image:", error);
      setFormErrors((prev) => ({ ...prev, image: "Failed to process image" }));
    }
  };

  const handlePreferenceChange = (category) => {
    const currentPreferences = [...formData.preferences];
    const index = currentPreferences.indexOf(category);

    if (index === -1) {
      currentPreferences.push(category);
    } else {
      currentPreferences.splice(index, 1);
    }

    setFormData((prev) => ({
      ...prev,
      preferences: currentPreferences,
    }));

    if (formErrors.preferences && currentPreferences.length > 0) {
      setFormErrors((prev) => ({
        ...prev,
        preferences: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBackendError('');
    const errors = validateForm();

    if (Object.keys(errors).length === 0) {
      setIsSubmitting(true);
      try {
        const formDataToSend = new FormData();

        if (formData.image) {
          if (formData.image.size > 5 * 1024 * 1024) {
            throw new Error('Image size must be less than 5MB');
          }
          formDataToSend.append('image', formData.image);
        }

        Object.keys(formData).forEach((key) => {
          if (key === 'preferences') {
            formDataToSend.append(key, JSON.stringify(formData[key]));
          } else if (key !== 'image' && key !== 'confirmPassword') {
            formDataToSend.append(key, formData[key]);
          }
        });

        const response = await register(formDataToSend);

        if (response.success) {
          localStorage.setItem('token', response.data.token);
          login(response.data.user);
          setToast({
            message: 'Registration successful! Welcome to 4BLOGS!',
            type: 'success'
          });
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 1500);
        } else {
          throw new Error(response.message || 'Registration failed');
        }
      } catch (error) {
        console.error('Registration error:', error);
        let errorMessage = 'Registration failed. Please try again.';

        if (error.response) {
          if (error.response.status === 413) {
            errorMessage = 'Image size is too large. Please use a smaller image (max 5MB).';
          } else {
            errorMessage = error.response.data?.message || error.response.data || errorMessage;
          }
        }

        setBackendError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setFormErrors(errors);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 sm:mb-8">
          Create your account
        </h2>

        {backendError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded relative mb-4 text-sm">
            {backendError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <label className="form-label">Profile Picture</label>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-dashed border-gray-300">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 mx-auto rounded-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData((prev) => ({ ...prev, image: null }));
                    }}
                    className="absolute top-0 right-1/2 transform translate-x-16 -translate-y-2 
                               bg-red-500 text-white p-2 rounded-full"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <label
                    htmlFor="profile-image-upload"
                    className="block w-full cursor-pointer"
                  >
                    <div className="space-y-4">
                      <div className="mx-auto w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </div>
                      <div>
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Add Profile Picture
                        </span>
                        <span className="mt-1 block text-xs text-gray-500">
                          Max size: 5MB
                        </span>
                      </div>
                    </div>
                  </label>
                  <input
                    id="profile-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              )}
            </div>
            {formErrors.image && (
              <p className="text-red-500 text-sm mt-1">{formErrors.image}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="form-label">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                className="input-field"
                value={formData.firstName}
                onChange={handleChange}
              />
              {formErrors.firstName && (
                <div className="text-red-500 text-sm mt-1">
                  {formErrors.firstName}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="form-label">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                className="input-field"
                value={formData.lastName}
                onChange={handleChange}
              />
              {formErrors.lastName && (
                <div className="text-red-500 text-sm mt-1">
                  {formErrors.lastName}
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="input-field"
              value={formData.email}
              onChange={handleChange}
            />
            {formErrors.email && (
              <div className="text-red-500 text-sm mt-1">
                {formErrors.email}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="form-label">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="text"
              className="input-field"
              value={formData.phone}
              onChange={handleChange}
            />
            {formErrors.phone && (
              <div className="text-red-500 text-sm mt-1">
                {formErrors.phone}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="dateOfBirth" className="form-label">
              Date of Birth
            </label>
            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              className="input-field"
              value={formData.dateOfBirth}
              onChange={handleChange}
            />
            {formErrors.dateOfBirth && (
              <div className="text-red-500 text-sm mt-1">
                {formErrors.dateOfBirth}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="input-field"
              value={formData.password}
              onChange={handleChange}
            />
            {formErrors.password && (
              <div className="text-red-500 text-sm mt-1">
                {formErrors.password}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className="input-field"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {formErrors.confirmPassword && (
              <div className="text-red-500 text-sm mt-1">
                {formErrors.confirmPassword}
              </div>
            )}
          </div>

          <div>
            <label className="form-label">Preferences</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {CATEGORIES.map((category) => (
                <label
                  key={category}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded"
                >
                  <input
                    type="checkbox"
                    name="preferences"
                    value={category}
                    onChange={() => handlePreferenceChange(category)}
                    checked={formData.preferences.includes(category)}
                    className="form-checkbox h-4 w-4 text-primary-600"
                  />
                  <span className="capitalize text-sm">{category}</span>
                </label>
              ))}
            </div>
            {formErrors.preferences && (
              <div className="text-red-500 text-sm mt-1">
                {formErrors.preferences}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between items-center space-y-3 sm:space-y-0">
            <button
              type="submit"
              className="w-full sm:w-auto btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Registering..." : "Register"}
            </button>
            <Link
              to="/login"
              className="text-primary-600 hover:text-primary-700 text-sm"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Register;
