import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getArticleById, blockArticle, likeArticle, dislikeArticle } from "../api/userapi";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import Modal from "../components/Modal";
import LikeDislike from '../components/LikeDislike';

const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [blockModal, setBlockModal] = useState({
    isOpen: false,
    action: null,
  });
  const [likeStats, setLikeStats] = useState({
    likes: 0,
    dislikes: 0,
    isLiked: false,
    isDisliked: false
  });

  const fetchArticle = useCallback(async () => {
    try {
      const data = await getArticleById(id);

      if (user && data.blocks.includes(user._id)) {
        navigate("/");
        return;
      }

      setArticle(data);
      setLikeStats({
        likes: data.likes.length,
        dislikes: data.dislikes.length,
        isLiked: user ? data.likes.includes(user._id) : false,
        isDisliked: user ? data.dislikes.includes(user._id) : false
      });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      navigate("/");
    }
  }, [id, navigate, user]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  const handleBlockClick = () => {
    const action = article.blocks.includes(user?._id) ? "unblock" : "block";
    setBlockModal({
      isOpen: true,
      action,
    });
  };

  const handleBlockConfirm = async () => {
    try {
      const updatedArticle = await blockArticle(id);
      setArticle(updatedArticle);
      setBlockModal({ isOpen: false, action: null });

      if (blockModal.action === "block") {
        navigate("/dashboard");
      }
    } catch (error) {
      console.err(error);
    }
  };

  const handleBlockCancel = () => {
    setBlockModal({ isOpen: false, action: null });
  };

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const response = await likeArticle(article._id);
      setLikeStats(response);
    } catch (error) {
      console.error('Error liking article:', error);
    }
  };

  const handleDislike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const response = await dislikeArticle(article._id);
      setLikeStats(response);
    } catch (error) {
      console.error('Error disliking article:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!article) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Article not found.</p>
      </div>
    );
  }

  const isBlocked = article.blocks.includes(user?._id);
  const isAuthor = user?._id === article.author._id;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {article.image ? (
          <img
            src={`${process.env.PUBLIC_URL}${article.image}`}
            alt={article.title}
            className="w-full h-96 object-cover"
          />
        ) : (
          <div className="w-full h-96 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500">No image</span>
          </div>
        )}

        <div className="p-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            {article.title}
          </h1>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 dark:text-gray-400">
                By {article.author.firstName} {article.author.lastName}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                {new Date(article.createdAt).toLocaleDateString()}
              </span>
            </div>
            <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-400 rounded-full">
              {article.category}
            </span>
          </div>

          <div className="prose dark:prose-invert max-w-none mb-8">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {article.description}
            </p>
          </div>
        </div>
      </div>

      {user && !isAuthor && (
        <div className="flex justify-end border-t pt-6">
          <button
            onClick={handleBlockClick}
            className={`px-4 py-2 rounded-md ${
              isBlocked
                ? "bg-gray-600 text-white hover:bg-gray-700"
                : "border border-red-600 text-red-600 hover:bg-red-50"
            }`}
          >
            {isBlocked ? "Unblock Article" : "Block Article"}
          </button>
        </div>
      )}

      {article.tags.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-between items-center">
        <LikeDislike
          likes={likeStats.likes}
          dislikes={likeStats.dislikes}
          isLiked={likeStats.isLiked}
          isDisliked={likeStats.isDisliked}
          onLike={handleLike}
          onDislike={handleDislike}
        />
      </div>

      <Modal
        isOpen={blockModal.isOpen}
        onClose={handleBlockCancel}
        onConfirm={handleBlockConfirm}
        title={
          blockModal.action === "block" ? "Block Article" : "Unblock Article"
        }
        message={
          blockModal.action === "block"
            ? "Are you sure you want to block this article? You won't see it in your feed anymore."
            : "Are you sure you want to unblock this article? It will appear in your feed again."
        }
      />
    </div>
  );
};

export default ArticleDetail;
