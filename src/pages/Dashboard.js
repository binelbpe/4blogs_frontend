import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getArticles, likeArticle, dislikeArticle } from "../api/userapi";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import ArticleCard from '../components/ArticleCard';

const Dashboard = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchArticles = useCallback(async () => {
    try {
      const data = await getArticles();
      const availableArticles = data.filter(
        (article) =>
          !article.deleted && (user ? !article.blocks.includes(user._id) : true)
      );
      setArticles(availableArticles);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching articles:", error);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleLike = async (articleId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const response = await likeArticle(articleId);
      setArticles(articles.map(article => 
        article._id === articleId 
          ? { 
              ...article, 
              likes: response.isLiked ? [...(article.likes || []), user._id] : article.likes.filter(id => id !== user._id),
              dislikes: response.isDisliked ? [...(article.dislikes || []), user._id] : article.dislikes.filter(id => id !== user._id)
            }
          : article
      ));
    } catch (error) {
      console.error('Error liking article:', error);
    }
  };

  const handleDislike = async (articleId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const response = await dislikeArticle(articleId);
      setArticles(articles.map(article => 
        article._id === articleId 
          ? { 
              ...article, 
              likes: response.isLiked ? [...(article.likes || []), user._id] : article.likes.filter(id => id !== user._id),
              dislikes: response.isDisliked ? [...(article.dislikes || []), user._id] : article.dislikes.filter(id => id !== user._id)
            }
          : article
      ));
    } catch (error) {
      console.error('Error disliking article:', error);
    }
  };

  const filteredArticles = articles
    .filter(
      (article) =>
        selectedCategory === "all" || article.category === selectedCategory
    )
    .filter(
      (article) =>
        (article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
        !article.deleted &&
        !article.blocks.includes(user?._id)
    );

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please log in to view your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="heading-primary">My Dashboard</h1>
          <p className="text-subtle mt-2">Articles based on your preferences</p>
        </div>
        <Link to="/articles/create" className="btn-primary">
          Create New Article
        </Link>
      </div>

      <div className="mb-8">
        <div className="max-w-2xl mx-auto mb-6">
          <input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-full text-sm ${
              selectedCategory === "all"
                ? "bg-primary-600 text-white"
                : "bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-300 dark:hover:bg-primary-900/40"
            }`}
          >
            All Preferred Categories
          </button>
          {user.preferences &&
            user.preferences.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm ${
                  selectedCategory === category
                    ? "bg-primary-600 text-white"
                    : "bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-300 dark:hover:bg-primary-900/40"
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
        </div>
      </div>

      {filteredArticles.length > 0 ? (
        <div className="space-y-8">
          {filteredArticles.map((article) => (
            <ArticleCard
              key={article._id}
              article={{
                ...article,
                isLiked: user ? article.likes?.includes(user._id) : false,
                isDisliked: user ? article.dislikes?.includes(user._id) : false
              }}
              onLike={handleLike}
              onDislike={handleDislike}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">
            {searchTerm
              ? "No articles found matching your search."
              : selectedCategory === "all"
              ? "No articles found in your preferred categories."
              : `No articles found in the ${selectedCategory} category.`}
          </p>
          <Link to="/articles/create" className="btn-primary">
            Create Your First Article
          </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
