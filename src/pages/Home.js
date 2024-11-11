import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getArticles, likeArticle, dislikeArticle } from "../api/userapi";
import LoadingSpinner from "../components/LoadingSpinner";
import ArticleCard from '../components/ArticleCard';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import { useAuth } from "../context/AuthContext";
import { CATEGORIES } from '../constants/categories';
import { Search, X } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getArticles({ 
        page, 
        limit: 10,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchTerm
      });
      
      if (page === 1) {
        setArticles(response.articles);
      } else {
        setArticles(prev => [...prev, ...response.articles]);
      }
      
      setHasMore(response.hasMore);
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  }, [page, selectedCategory, searchTerm]);

  useEffect(() => {
    setPage(1);
    setArticles([]);
  }, [selectedCategory, searchTerm]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles, page, selectedCategory, searchTerm]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [loading, hasMore]);

  useEffect(() => {
    if (page > 1) {
      fetchArticles();
    }
  }, [page, fetchArticles]);

  const [isFetching] = useInfiniteScroll(loadMore, hasMore);

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="heading-primary mb-8">Explore Articles</h1>
      
      <div className="mb-8">
        {/* Search Bar with Clear Icon */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="relative">
            <Search 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 pr-10"
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 
                         text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                         p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700
                         transition-all duration-200"
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <button
            onClick={() => handleCategoryChange("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
              ${selectedCategory === "all"
                ? "bg-primary-600 text-white shadow-md transform scale-105"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow dark:bg-gray-800 dark:text-gray-300"
              }`}
          >
            All Categories
          </button>
          {CATEGORIES.filter(cat => cat !== 'all').map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                ${selectedCategory === category
                  ? "bg-primary-600 text-white shadow-md transform scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow dark:bg-gray-800 dark:text-gray-300"
                }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && page === 1 && (
        <div className="flex justify-center items-center min-h-[200px]">
          <LoadingSpinner />
        </div>
      )}

      {/* Articles List */}
      <div className="space-y-6">
        {articles.map((article) => (
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

      {/* Loading More State */}
      {isFetching && (
        <div className="py-4 flex justify-center">
          <LoadingSpinner />
        </div>
      )}

      {/* No Results State */}
      {!loading && articles.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500 text-lg">
            {searchTerm
              ? "No articles found matching your search."
              : selectedCategory === "all"
              ? "No articles available."
              : `No articles found in the ${selectedCategory} category.`}
          </p>
        </div>
      )}

      {/* End of Results */}
      {!hasMore && articles.length > 0 && (
        <p className="text-center text-gray-500 mt-8 py-4">
          You've reached the end
        </p>
      )}
    </div>
  );
};

export default Home;
