import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getArticles, likeArticle, dislikeArticle } from "../api/userapi";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import ArticleCard from '../components/ArticleCard';

const Home = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  const CATEGORIES = [
    "all",
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to 4Blogs</h1>
        <p className="text-gray-600 mb-8">
          Discover interesting articles across various categories
        </p>
        {!user && (
          <div className="space-x-4">
            <Link to="/register" className="btn-primary">
              Get Started
            </Link>
            <Link
              to="/login"
              className="text-primary-600 hover:text-primary-700"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>

      <div className="mb-8">
        <div className="max-w-2xl mx-auto mb-6">
          <input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex flex-wrap gap-2 justify-center max-w-4xl mx-auto">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm ${
                selectedCategory === category
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } transition-colors duration-200`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

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

      {filteredArticles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {searchTerm
              ? "No articles found matching your search."
              : "No articles found in this category."}
          </p>
        </div>
      )}
    </div>
  );
};

export default Home;
