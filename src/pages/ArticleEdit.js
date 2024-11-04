import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getArticleByUserAndId, updateArticle, blockArticle } from '../api/userapi';
import { useAuth } from '../context/AuthContext';
import { X, Loader, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import Toast from '../components/Toast';
import Modal from '../components/Modal';
import { handleImageValidation } from '../utils/imageValidation';

const CATEGORIES = [
  'sports', 'politics', 'space', 'technology', 'entertainment',
  'health', 'science', 'business', 'education', 'travel',
  'food', 'fashion', 'art', 'music', 'gaming', 'environment'
];

const ArticleEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    image: null,
    tags: '',
    currentImage: '',
    removeImage: false
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [author, setAuthor] = useState(null);
  const [blocks, setBlocks] = useState([]);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const article = await getArticleByUserAndId(id);
        setFormData({
          title: article.title,
          description: article.description,
          category: article.category,
          tags: article.tags.join(', '),
          currentImage: article.image,
          removeImage: false,
          image: null
        });
        setImagePreview(article.image ? `${process.env.PUBLIC_URL}${article.image}` : null);
        setAuthor(article.author);
        setBlocks(article.blocks || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching article:', error);
        navigate('/articles/list');
      }
    };

    fetchArticle();
  }, [id, navigate]);

  const validateField = (name, value) => {
    switch (name) {
      case 'title':
        if (!value.trim()) return 'Title is required';
        if (value.length < 3) return 'Title must be at least 3 characters';
        if (value.length > 100) return 'Title must be less than 100 characters';
        return '';
      
      case 'description':
        if (!value.trim()) return 'Description is required';
        if (value.length < 10) return 'Description must be at least 10 characters';
        if (value.length > 5000) return 'Description must be less than 5000 characters';
        return '';
      
      case 'category':
        if (!value) return 'Category is required';
        if (!CATEGORIES.includes(value)) return 'Invalid category selected';
        return '';
      
      case 'image':
        if (value && value.size > 5 * 1024 * 1024) {
          return 'Image size must be less than 5MB';
        }
        if (value && !value.type.startsWith('image/')) {
          return 'File must be an image';
        }
        return '';
      
      case 'tags':
        const tags = value.split(',').map(tag => tag.trim()).filter(Boolean);
        if (tags.some(tag => tag.length > 20)) {
          return 'Each tag must be less than 20 characters';
        }
        if (tags.length > 10) {
          return 'Maximum 10 tags allowed';
        }
        return '';
      
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (key === 'image' || key === 'currentImage' || key === 'removeImage') return;
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const isValid = await handleImageValidation(
        file,
        (error) => setErrors(prev => ({ ...prev, image: error })),
        (image) => setFormData(prev => ({
          ...prev,
          image,
          removeImage: false,
          currentImage: ''
        })),
        setImagePreview,
        setToast
      );

      if (!isValid) {
        setFormData(prev => ({
          ...prev,
          image: null,
          removeImage: false,
          currentImage: prev.currentImage
        }));
      }
    }
  };

  const handleBlockConfirm = async () => {
    try {
      const updatedArticle = await blockArticle(id);
      setBlocks(updatedArticle.blocks || []);
      setShowBlockModal(false);
    } catch (error) {
      console.error('Error blocking article:', error);
    }
  };

  const handleImageRemove = () => {
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      image: null,
      currentImage: '',
      removeImage: true
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
  
    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      
      if (formData.removeImage) {
        submitData.append('removeImage', 'true');
      } else if (formData.image) {
        submitData.append('image', formData.image);
      } else if (formData.currentImage) {
        submitData.append('currentImage', formData.currentImage);
      }
      
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean);
      submitData.append('tags', JSON.stringify(tags));
  
      await updateArticle(id, submitData);
      
      setToast({
        message: 'Article updated successfully',
        type: 'success'
      });

      setTimeout(() => {
        navigate('/articles/list');
      }, 2000);
    } catch (error) {
      console.error('Error updating article:', error);
      setToast({
        message: error.response?.data?.message || 'Failed to update article',
        type: 'error'
      });
      setErrors(prev => ({ ...prev, submit: 'Failed to update article' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="heading-primary">Edit Article</h1>
          {user?._id === author?._id && (
            <button
              onClick={() => setShowBlockModal(true)}
              className={`btn-outline flex items-center gap-2 ${
                blocks.includes(user?._id)
                  ? 'border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                  : ''
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              {blocks.includes(user?._id) ? 'Unblock Article' : 'Block Article'}
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="form-label">Title</label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              onBlur={handleBlur}
              className="input-field"
            />
            {touched.title && errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              id="description"
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              onBlur={handleBlur}
              className="input-field"
            />
            {touched.description && errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="form-label">Category</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {CATEGORIES.map((category) => (
                <label
                  key={category}
                  className={`relative flex items-center p-4 cursor-pointer rounded-lg border-2 
                             transition-all duration-200 
                             ${formData.category === category
                               ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                               : 'border-gray-200 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-800'
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
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center
                                   ${formData.category === category
                                     ? 'border-primary-500 bg-primary-500'
                                     : 'border-gray-300 dark:border-gray-600'
                                   }`}
                    >
                      {formData.category === category && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <span className={`text-sm font-medium
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
            {touched.category && errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="form-label">Article Image</label>
            <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 
                           border-dashed rounded-lg hover:border-primary-500 dark:hover:border-primary-400
                           transition-colors duration-200">
              <div className="space-y-1 text-center">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mx-auto h-48 w-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={handleImageRemove}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full
                                hover:bg-red-600 transition-colors duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                      <label className="relative cursor-pointer rounded-md font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500">
                        <span>Upload a file</span>
                        <input
                          type="file"
                          name="image"
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
          </div>

          <div>
            <label htmlFor="tags" className="form-label">
              Tags (comma-separated)
            </label>
            <input
              id="tags"
              name="tags"
              type="text"
              value={formData.tags}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="technology, news, update"
              className="input-field"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/articles/list')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader className="animate-spin w-4 h-4" />
                  <span>Updating...</span>
                </div>
              ) : (
                'Update Article'
              )}
            </button>
          </div>
        </form>
      </div>

      <Modal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        onConfirm={handleBlockConfirm}
        title={blocks.includes(user?._id) ? 'Unblock Article' : 'Block Article'}
        message={blocks.includes(user?._id) 
          ? 'Are you sure you want to unblock this article?'
          : 'Are you sure you want to block this article?'
        }
      />

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

export default ArticleEditor;