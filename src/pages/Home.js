import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getArticles } from "../userapi";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();

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

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
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
  };

  const filteredArticles = articles
    .filter(
      (article) =>
        selectedCategory === "all" || article.category === selectedCategory
    )
    .filter(
      (article) =>
       ( article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.description.toLowerCase().includes(searchTerm.toLowerCase()))&&
        (!article.deleted &&
          !article.blocks.includes(user?._id) )
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
          <article
            key={article._id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <Link to={`/articles/${article._id}`} className="flex flex-col md:flex-row">
              {article.image ? (
                <div className="md:w-1/3 lg:w-1/4">
                  <img
                    src={`${process.env.PUBLIC_URL}${article.image}`}
                    alt={article.title}
                    className="w-full h-48 md:h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/150?text=No+Image";
                    }}
                  />
                </div>
              ) : (
                <div className="md:w-1/3 lg:w-1/4 bg-gray-100 h-48 md:h-full flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
              <div className="p-6 md:w-2/3 lg:w-3/4">
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                  <span>{new Date(article.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                  <span>•</span>
                  <span>By {article.author.firstName} {article.author.lastName}</span>
                  <span>•</span>
                  <span className="px-2 py-1 bg-gray-100 rounded-full">
                    {article.category}
                  </span>
                </div>
                <h2 className="text-2xl font-bold mb-3 text-gray-900 hover:text-primary-600">
                  {article.title}
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {article.description}
                </p>
                <div className="flex items-center text-primary-600 font-medium">
                  Read more
                  <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </article>
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
