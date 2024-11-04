import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrashIcon, PencilIcon, HandThumbUpIcon as ThumbsUp, HandThumbDownIcon as ThumbsDown } from '@heroicons/react/24/outline';
import { getUserArticles, deleteArticle } from '../api/userapi';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import Toast from '../components/Toast';

const ArticleList = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    articleId: null
  });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchUserArticles();
  }, []);

  const fetchUserArticles = async () => {
    try {
      const data = await getUserArticles();
      setArticles(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setLoading(false);
    }
  };

  const handleDeleteClick = (articleId) => {
    setDeleteModal({
      isOpen: true,
      articleId
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteArticle(deleteModal.articleId);
      setToast({
        message: 'Article deleted successfully',
        type: 'success'
      });
      fetchUserArticles(); 
      setDeleteModal({ isOpen: false, articleId: null });
    } catch (error) {
      setToast({
        message: 'Failed to delete article',
        type: 'error'
      });
      console.error('Error deleting article:', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, articleId: null });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Articles</h1>
          <p className="text-gray-600 mt-2">Manage your published articles</p>
        </div>
        <Link to="/articles/create" className="btn-primary">
          Create New Article
        </Link>
      </div>
      {articles.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Article
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Engagement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {articles.map((article) => (
                <tr key={article._id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {article.image ? (
                        <img
                          className="h-16 w-16 object-cover rounded"
                          src={`${process.env.PUBLIC_URL}${article.image}`}
                          alt={article.title}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                          }}
                        />
                      ) : (
                        <div className="h-16 w-16 bg-gray-100 rounded flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No image</span>
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {article.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(article.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {article.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <span className="flex items-center">
                        <ThumbsUp size={14} className="mr-1" />
                        {article.likes?.length || 0}
                      </span>
                      <span className="flex items-center">
                        <ThumbsDown size={14} className="mr-1" />
                        {article.dislikes?.length || 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex space-x-3">
                      <Link
                        to={`/articles/edit/${article._id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(article._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">You haven't created any articles yet.</p>
          <Link to="/articles/create" className="btn-primary">
            Create Your First Article
          </Link>
        </div>
      )}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Article"
        message="Are you sure you want to delete this article? This action cannot be undone."
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

export default ArticleList; 