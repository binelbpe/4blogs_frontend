import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { createArticle } from "../api/userapi";
import Toast from "../components/Toast";
import { VALIDATION_RULES, ERROR_MESSAGES } from '../constants/validation';
import { CATEGORIES } from '../constants/categories';
import { API_ENDPOINTS } from '../constants/api';
import { BUTTON_STYLES, INPUT_STYLES } from '../constants/colors';

const ArticleCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    image: null,
    tags: "",
  });
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [toast, setToast] = useState(null);


  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = ERROR_MESSAGES.REQUIRED;
    }

    if (!formData.description.trim()) {
      newErrors.description = ERROR_MESSAGES.REQUIRED;
    }

    if (!formData.category) {
      newErrors.category = ERROR_MESSAGES.REQUIRED;
    }

    if (!formData.image) {
      newErrors.image = ERROR_MESSAGES.REQUIRED;
    } else if (formData.image.size > VALIDATION_RULES.IMAGE.MAX_SIZE) {
      newErrors.image = ERROR_MESSAGES.IMAGE_TOO_LARGE;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!validateForm()) {
      const firstErrorElement = document.querySelector(".text-red-500");
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      return;
    }

    try {
      const articleData = new FormData();

      if (formData.image) {
        if (formData.image.size > 5 * 1024 * 1024) {
          throw new Error("Image size must be less than 5MB");
        }
        articleData.append("image", formData.image);
      }

      articleData.append("title", formData.title.trim());
      articleData.append("description", formData.description.trim());
      articleData.append("category", formData.category);

      if (formData.tags) {
        const tags = formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);
        articleData.append("tags", JSON.stringify(tags));
      }

      const response = await createArticle(articleData);

      if (response.success) {
        setToast({
          message: "Article created successfully!",
          type: "success",
        });

        setTimeout(() => {
          navigate(API_ENDPOINTS.ARTICLES.LIST);
        }, 1500);
      }
    } catch (error) {
      console.error("Error creating article:", error);
      let errorMessage = "Failed to create article. Please try again.";

      if (error.response) {
        if (error.response.status === 413) {
          errorMessage =
            "Image size is too large. Please use a smaller image (max 5MB).";
        } else {
          errorMessage =
            error.response.data?.message || error.response.data || errorMessage;
        }
      }

      const errorElement = document.querySelector(".text-red-500");
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

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

      setFormData((prev) => ({ ...prev, image: file }));
      setErrors((prev) => ({ ...prev, image: "" }));
    } catch (error) {
      console.error("Error handling image:", error);
      setErrors((prev) => ({ ...prev, image: "Failed to process image" }));
    }
  };

  const handleCategoryChange = (category) => {
    setFormData((prev) => ({
      ...prev,
      category,
    }));

    if (errors.category) {
      setErrors((prev) => ({
        ...prev,
        category: "",
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="heading-primary mb-8">Create New Article</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
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

        <div>
          <label className="form-label">Category</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {CATEGORIES.filter(cat => cat !== 'all').map((category) => (
              <label
                key={category}
                className={`relative flex items-center p-2 sm:p-4 cursor-pointer rounded-lg border-2 
                  ${formData.category === category
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200 hover:border-primary-200"
                  }`}
              >
                <input
                  type="radio"
                  name="category"
                  value={category}
                  checked={formData.category === category}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className="text-sm sm:text-base capitalize">
                  {category}
                </span>
              </label>
            ))}
          </div>
          {errors.category && (
            <p className="text-red-500 text-sm mt-1">{errors.category}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="form-label">Article Image</label>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-dashed border-gray-300">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setFormData((prev) => ({ ...prev, image: null }));
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="text-center">
                <label
                  htmlFor="mobile-image-upload"
                  className="block w-full cursor-pointer"
                >
                  <div className="space-y-4">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-primary-600"
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
                        Add Article Image
                      </span>
                      <span className="mt-1 block text-xs text-gray-500">
                        Max size: 5MB
                      </span>
                    </div>
                  </div>
                </label>
                <input
                  id="mobile-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            )}
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
            className="w-full sm:w-auto btn-primary"
          >
            Create Article
          </button>
        </div>
      </form>

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
