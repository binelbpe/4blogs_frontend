import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { createArticle } from '../userapi';
import { handleImageValidation } from '../utils/imageValidation';
import Toast from '../components/Toast';

const CATEGORIES = [
  'sports', 'politics', 'space', 'technology', 'entertainment',
  'health', 'science', 'business', 'education', 'travel',
  'food', 'fashion', 'art', 'music', 'gaming', 'environment'
];

const ArticleCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    image: null,
    tags: ''
  });
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [toast, setToast] = useState(null);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.image) {
      newErrors.image = 'Image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent any bubbling
    setSubmitError('');
    
    if (!validateForm()) {
      // Scroll to the first error
      const firstErrorElement = document.querySelector('.text-red-500');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    try {
      setIsSubmitting(true);
      
      const articleData = new FormData();
      
      // Ensure proper data formatting
      articleData.append('title', formData.title.trim());
      articleData.append('description', formData.description.trim());
      articleData.append('category', formData.category);
      
      if (formData.image instanceof File) {
        articleData.append('image', formData.image);
      }
      
      if (formData.tags) {
        const tags = formData.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(Boolean);
        articleData.append('tags', JSON.stringify(tags));
      }

      await createArticle(articleData);
      
      // Show success message
      setToast({
        message: 'Article created successfully!',
        type: 'success'
      });

      // Delay navigation to show the success message
      setTimeout(() => {
        navigate('/articles/list');
      }, 1500);
    } catch (error) {
      console.error('Error creating article:', error);
      setSubmitError(
        error.response?.data?.message || 
        error.message || 
        'Failed to create article. Please try again.'
      );
      
      // Scroll error into view
      const errorElement = document.querySelector('.text-red-500');
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const isValid = await handleImageValidation(
        file,
        (error) => setErrors(prev => ({ ...prev, image: error })),
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

  const handleCategoryChange = (category) => {
    setFormData(prev => ({
      ...prev,
      category
    }));
    
    if (errors.category) {
      setErrors(prev => ({
        ...prev,
        category: ''
      }));
    }
  };

  // Add this function to handle mobile image upload
  const handleImageUpload = () => {
    const input = document.getElementById('image');
    if (input) {
      input.click();
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
        <h1 className="heading-primary text-xl sm:text-2xl mb-6">Create New Article</h1>
        
        {submitError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="title" className="form-label">
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              className="input-field"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter article title"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows="4"
              className="input-field"
              value={formData.description}
              onChange={handleInputChange}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="form-label">Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {CATEGORIES.map((category) => (
                <label
                  key={category}
                  className={`relative flex items-center p-2 sm:p-4 cursor-pointer rounded-lg border-2 
                             transition-all duration-200 text-sm sm:text-base
                             ${formData.category === category
                               ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                               : 'border-gray-200 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-800'
                             }`}
                  onClick={() => handleCategoryChange(category)}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    handleCategoryChange(category);
                  }}
                >
                  <input
                    type="radio"
                    name="category"
                    value={category}
                    checked={formData.category === category}
                    onChange={() => handleCategoryChange(category)}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 mr-2 sm:mr-3 flex items-center justify-center
                                   ${formData.category === category
                                     ? 'border-primary-500 bg-primary-500'
                                     : 'border-gray-300 dark:border-gray-600'
                                   }`}
                    >
                      {formData.category === category && (
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <span className={`text-xs sm:text-sm font-medium
                                    ${formData.category === category
                                      ? 'text-primary-700 dark:text-primary-400'
                                      : 'text-gray-700 dark:text-gray-300'
                                    }`}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </span>
                  </div>
                </label>
              ))}
            </div>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="form-label">Article Image</label>
            <div 
              className="flex justify-center px-3 sm:px-6 pt-4 pb-4 sm:pt-5 sm:pb-6 border-2 border-gray-300 
                         dark:border-gray-600 border-dashed rounded-lg hover:border-primary-500 
                         dark:hover:border-primary-400 transition-colors duration-200"
              onClick={handleImageUpload}
              role="button"
              tabIndex={0}
            >
              <div className="space-y-1 text-center">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mx-auto h-32 sm:h-48 w-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData(prev => ({ ...prev, image: null }));
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full
                                hover:bg-red-600 transition-colors duration-200"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                      <label htmlFor="image" className="relative cursor-pointer rounded-md font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500">
                        <span>Upload a file</span>
                        <input
                          id="image"
                          name="image"
                          type="file"
                          className="sr-only"
                          onChange={handleImageChange}
                          accept="image/*"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </>
                )}
              </div>
            </div>
            {errors.image && (
              <p className="text-red-500 text-sm mt-1">{errors.image}</p>
            )}
          </div>

          <div>
            <label htmlFor="tags" className="form-label">
              Tags (comma-separated)
            </label>
            <input
              id="tags"
              name="tags"
              type="text"
              className="input-field"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="technology, news, update"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto btn-primary"
            >
              {isSubmitting ? 'Creating...' : 'Create Article'}
            </button>
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

export default ArticleCreate;