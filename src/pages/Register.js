import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../userapi';
import { useAuth } from '../context/AuthContext';
import { handleImageValidation } from '../utils/imageValidation';
import Toast from '../components/Toast';

const CATEGORIES = [
  'sports', 'politics', 'space', 'technology', 'entertainment',
  'health', 'science', 'business', 'education', 'travel',
  'food', 'fashion', 'art', 'music', 'gaming', 'environment'
];

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    preferences: [],
    image: null
  });

  const [formErrors, setFormErrors] = useState({});
  const [backendError, setBackendError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const validateForm = () => {
    const errors = {};
    const { firstName, lastName, email, phone, password, confirmPassword, dateOfBirth, preferences, image } = formData;

    // First Name validation
    if (!firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    // Last Name validation
    if (!lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    // Email validation
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/^[a-zA-Z0-9._-]+@[a-z]+\.[a-z]{2,}$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Phone validation (10 digits)
    if (!phone) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(phone.replace(/[-()\s]/g, ''))) {
      errors.phone = 'Please enter a valid 10-digit phone number';
    }

    // Password validation
    if (!password) {
      errors.password = 'Password is required';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
      errors.password = 'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character';
    }

    // Confirm Password validation
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Date of Birth validation
    if (!dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13) {
        errors.dateOfBirth = 'You must be at least 13 years old to register';
      }
    }

    // Preferences validation
    if (preferences.length === 0) {
      errors.preferences = 'Please select at least one preference';
    }

    // Image validation
    if (!image) {
      errors.image = 'Profile image is required';
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear specific field error
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    // Clear backend error
    if (backendError) {
      setBackendError('');
    }
  };

  const handleImageChange = async (event) => {
    const file = event.currentTarget.files[0];
    if (file) {
      const isValid = await handleImageValidation(
        file,
        (error) => setFormErrors(prev => ({ ...prev, image: error })),
        (image) => setFormData(prev => ({ ...prev, image })),
        setImagePreview,
        setToast
      );

      if (!isValid) {
        setFormData(prev => ({ ...prev, image: null }));
        setImagePreview(null);
      }
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
    
    setFormData(prev => ({
      ...prev,
      preferences: currentPreferences
    }));
    
    // Clear preferences error if exists
    if (formErrors.preferences && currentPreferences.length > 0) {
      setFormErrors(prev => ({
        ...prev,
        preferences: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent any bubbling
    setBackendError('');
    const errors = validateForm();

    if (Object.keys(errors).length === 0) {
      setIsSubmitting(true);
      try {
        const formDataToSend = new FormData();
        
        // Ensure all form data is properly appended
        Object.keys(formData).forEach(key => {
          if (key === 'preferences') {
            // Ensure preferences is always an array
            const prefsArray = Array.isArray(formData[key]) ? formData[key] : [];
            formDataToSend.append(key, JSON.stringify(prefsArray));
          } else if (key === 'image' && formData[key]) {
            // Only append image if it exists
            formDataToSend.append(key, formData[key]);
          } else if (key !== 'confirmPassword') {
            // Ensure value is converted to string
            formDataToSend.append(key, String(formData[key] || ''));
          }
        });

        const response = await register(formDataToSend);
        
        if (response.success) {
          login(response.data.user);
          navigate('/', { replace: true });
        } else {
          throw new Error(response.message || 'Registration failed');
        }
      } catch (error) {
        console.error('Registration error:', error);
        setBackendError(
          error.response?.data?.message || 
          error.message || 
          'Registration failed. Please try again.'
        );
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setFormErrors(errors);
      // Scroll to the first error
      const firstError = Object.keys(errors)[0];
      const errorElement = document.getElementById(firstError);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
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
          <div>
            <label className="form-label">Profile Image</label>
            <div className="mt-1 flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData(prev => ({ ...prev, image: null }));
                    }}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
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
                onClick={() => document.getElementById('image').click()}
                className="btn-primary"
              >
                Upload Image
              </button>
            </div>
            {formErrors.image && (
              <div className="text-red-500 text-sm mt-1">{formErrors.image}</div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="form-label">First Name</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                className="input-field"
                value={formData.firstName}
                onChange={handleChange}
              />
              {formErrors.firstName && (
                <div className="text-red-500 text-sm mt-1">{formErrors.firstName}</div>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="form-label">Last Name</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                className="input-field"
                value={formData.lastName}
                onChange={handleChange}
              />
              {formErrors.lastName && (
                <div className="text-red-500 text-sm mt-1">{formErrors.lastName}</div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="input-field"
              value={formData.email}
              onChange={handleChange}
            />
            {formErrors.email && (
              <div className="text-red-500 text-sm mt-1">{formErrors.email}</div>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="form-label">Phone</label>
            <input
              id="phone"
              name="phone"
              type="text"
              className="input-field"
              value={formData.phone}
              onChange={handleChange}
            />
            {formErrors.phone && (
              <div className="text-red-500 text-sm mt-1">{formErrors.phone}</div>
            )}
          </div>

          <div>
            <label htmlFor="dateOfBirth" className="form-label">Date of Birth</label>
            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              className="input-field"
              value={formData.dateOfBirth}
              onChange={handleChange}
            />
            {formErrors.dateOfBirth && (
              <div className="text-red-500 text-sm mt-1">{formErrors.dateOfBirth}</div>
            )}
          </div>

          <div>
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="input-field"
              value={formData.password}
              onChange={handleChange}
            />
            {formErrors.password && (
              <div className="text-red-500 text-sm mt-1">{formErrors.password}</div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className="input-field"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {formErrors.confirmPassword && (
              <div className="text-red-500 text-sm mt-1">{formErrors.confirmPassword}</div>
            )}
          </div>

          <div>
            <label className="form-label">Preferences</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {CATEGORIES.map((category) => (
                <label key={category} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
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
              <div className="text-red-500 text-sm mt-1">{formErrors.preferences}</div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between items-center space-y-3 sm:space-y-0">
            <button
              type="submit"
              className="w-full sm:w-auto btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Registering...' : 'Register'}
            </button>
            <Link to="/login" className="text-primary-600 hover:text-primary-700 text-sm">
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