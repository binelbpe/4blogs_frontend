import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../api/userapi";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { updateUser as updateUserAction } from "../store/slice/userSlice";

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

const UpdateProfile = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
    preferences: user?.preferences || [],
    image: null,
    removeImage: false,
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });
  const [imagePreview, setImagePreview] = useState(
    user?.image ? `${process.env.PUBLIC_URL}${user.image}` : null
  );

  const validateField = (name, value, allValues = formData) => {
    if (!value && name !== "newPassword" && name !== "currentPassword") {
      return "";
    }

    switch (name) {
      case "email":
        if (value && !/^[a-zA-Z0-9._-]+@[a-z]+\.[a-z]{2,}$/.test(value)) {
          return "Please enter a valid email address";
        }
        break;

      case "phone":
        if (value && !/^\d{10}$/.test(value.replace(/[-()\s]/g, ""))) {
          return "Please enter a valid 10-digit phone number";
        }
        break;

      case "newPassword":
        if (allValues.currentPassword || value) {
          if (!value) {
            return "New password is required when current password is provided";
          }
          if (value && value.length < 8) {
            return "Must be at least 8 characters";
          }
          if (
            value &&
            !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
              value
            )
          ) {
            return "Password must include uppercase, lowercase, number and special character";
          }
        }
        break;

      case "currentPassword":
        if (allValues.newPassword || value) {
          if (!value) {
            return "Current password is required to change password";
          }
        }
        break;

      case "confirmNewPassword":
        if (allValues.newPassword && value !== allValues.newPassword) {
          return "Passwords must match";
        }
        break;

      case "image":
        if (value && value.size > 5 * 1024 * 1024) {
          return "Image must be less than 5MB";
        }
        break;
      default: {
        return "";
      }
    }
  };

  const validateForm = (data) => {
    const newErrors = {};
    const changedFields = Object.keys(data).filter((key) => {
      if (key === "image") {
        return data[key] !== null;
      }
      if (key === "preferences") {
        return true;
      }
      if (key === "removeImage") {
        return data[key] === true;
      }
      return data[key] !== user[key] && data[key] !== "";
    });

    changedFields.forEach((key) => {
      const error = validateField(key, data[key], data);
      if (error) {
        newErrors[key] = error;
      }
    });

    if (data.currentPassword || data.newPassword || data.confirmNewPassword) {
      ["currentPassword", "newPassword", "confirmNewPassword"].forEach(
        (field) => {
          const error = validateField(field, data[field], data);
          if (error) {
            newErrors[field] = error;
          }
        }
      );
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    const error = validateField(name, value, formData);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleImageChange = async (event) => {
    const file = event.currentTarget.files[0];
    if (file) {
      try {
        if (!file.type.startsWith("image/")) {
          setErrors((prev) => ({
            ...prev,
            image: "Please select an image file",
          }));
          return;
        }

        if (file.size > 5 * 1024 * 1024) {
          setErrors((prev) => ({
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

        setFormData((prev) => ({
          ...prev,
          image: file,
          removeImage: false,
        }));
        setErrors((prev) => ({ ...prev, image: "" }));
      } catch (error) {
        console.error("Error handling image:", error);
        setErrors((prev) => ({ ...prev, image: "Failed to process image" }));
        setMessage({ type: "error", text: "Failed to process image" });
      }
    }
  };

  const handleImageRemove = () => {
    setImagePreview(null);
    setFormData((prev) => ({
      ...prev,
      image: null,
      removeImage: true,
    }));
  };

  const handlePreferenceChange = (category) => {
    setFormData((prev) => ({
      ...prev,
      preferences: prev.preferences.includes(category)
        ? prev.preferences.filter((pref) => pref !== category)
        : [...prev.preferences, category],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validateForm(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      const formDataToSend = new FormData();

      if (formData.removeImage) {
        formDataToSend.append("removeImage", "true");
      } else if (formData.image instanceof File) {
        formDataToSend.append("image", formData.image);
      }

      Object.keys(formData).forEach((key) => {
        if (
          key !== "image" &&
          key !== "removeImage" &&
          key !== "confirmNewPassword"
        ) {
          if (key === "preferences") {
            formDataToSend.append("preferences", JSON.stringify(formData[key]));
          } else if (formData[key] !== "" && formData[key] !== user[key]) {
            formDataToSend.append(key, formData[key]);
          }
        }
      });

      const response = await updateProfile(formDataToSend);

      if (response.success) {
        dispatch(updateUserAction(response.data.user));
        if (response.data.user.image) {
          setImagePreview(
            `${process.env.PUBLIC_URL}${response.data.user.image}`
          );
        }

        setMessage({
          type: "success",
          text: "Profile updated successfully! Redirecting to profile...",
        });

        setTimeout(() => {
          navigate("/profile");
        }, 2000);
      } else {
        throw new Error(response.message || "Update failed");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          error.message ||
          "Failed to update profile",
      });
    }
  };

  useEffect(() => {
    if (user?.image) {
      setImagePreview(`${process.env.PUBLIC_URL}${user.image}`);
    }
  }, [user]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Update Profile</h1>

      {message.text && (
        <div
          className={`p-4 rounded-md mb-6 ${
            message.type === "success"
              ? "bg-green-100 text-green-700 border border-green-400"
              : "bg-red-100 text-red-700 border border-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Image Section */}
        <div>
          <label className="form-label">Profile Image</label>
          <div className="mt-1 flex items-center space-x-4">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Profile Preview"
                  className="w-24 h-24 rounded-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleImageRemove}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-3xl text-gray-400">
                  {user?.firstName?.charAt(0)}
                  {user?.lastName?.charAt(0)}
                </span>
              </div>
            )}
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => document.getElementById("image").click()}
              className="btn-primary"
            >
              Upload Image
            </button>
          </div>
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="form-label">
              First Name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              className="input-field"
            />
            {errors.firstName && (
              <div className="text-red-500 text-sm mt-1">
                {errors.firstName}
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
              value={formData.lastName}
              onChange={handleChange}
              className="input-field"
            />
            {errors.lastName && (
              <div className="text-red-500 text-sm mt-1">{errors.lastName}</div>
            )}
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="input-field"
          />
          {errors.email && (
            <div className="text-red-500 text-sm mt-1">{errors.email}</div>
          )}
        </div>

        {/* Phone Field */}
        <div>
          <label htmlFor="phone" className="form-label">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="text"
            value={formData.phone}
            onChange={handleChange}
            className="input-field"
          />
          {errors.phone && (
            <div className="text-red-500 text-sm mt-1">{errors.phone}</div>
          )}
        </div>

        {/* Password Change Section */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">Change Password</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="form-label">
                Current Password
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
                className="input-field"
              />
              {errors.currentPassword && (
                <div className="text-red-500 text-sm mt-1">
                  {errors.currentPassword}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="newPassword" className="form-label">
                New Password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                className="input-field"
              />
              {errors.newPassword && (
                <div className="text-red-500 text-sm mt-1">
                  {errors.newPassword}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmNewPassword" className="form-label">
                Confirm New Password
              </label>
              <input
                id="confirmNewPassword"
                name="confirmNewPassword"
                type="password"
                value={formData.confirmNewPassword}
                onChange={handleChange}
                className="input-field"
              />
              {errors.confirmNewPassword && (
                <div className="text-red-500 text-sm mt-1">
                  {errors.confirmNewPassword}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">Article Preferences</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {CATEGORIES.map((category) => (
              <label
                key={category}
                className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded"
              >
                <input
                  type="checkbox"
                  checked={formData.preferences.includes(category)}
                  onChange={() => handlePreferenceChange(category)}
                  className="form-checkbox h-4 w-4 text-primary-600"
                />
                <span className="capitalize text-sm">{category}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button type="submit" className="btn-primary">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateProfile;
