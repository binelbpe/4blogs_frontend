import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getArticles } from "../api/userapi";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

const Dashboard = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchArticles = useCallback(async () => {
    try {
      const data = await getArticles();
      const filteredArticles = data.filter(
        (article) =>
          !article.deleted &&
          !article.blocks.includes(user?._id) &&
          user?.preferences?.includes(article.category)
      );
      setArticles(filteredArticles);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching articles:", error);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
            <article
              key={article._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden
                         transform hover:scale-[1.02] hover:shadow-xl
                         transition-all duration-300 ease-in-out"
            >
              <Link
                to={`/articles/${article._id}`}
                className="flex flex-col md:flex-row"
              >
                <div className="md:w-1/3 lg:w-1/4 overflow-hidden">
                  <img
                    src={`${process.env.PUBLIC_URL}${article.image}`}
                    alt={article.title}
                    className="w-full h-48 md:h-full object-cover transform hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 md:w-2/3 lg:w-3/4">
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <span>
                      {new Date(article.createdAt).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                      {article.category}
                    </span>
                  </div>
                  <h2
                    className="text-2xl font-bold mb-3 card-title hover:text-primary-600 
                                 dark:hover:text-primary-400 transition-colors"
                  >
                    {article.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {article.description}
                  </p>
                  <div className="flex items-center text-primary-600 dark:text-primary-400 font-medium">
                    Read more
                    <svg
                      className="w-4 h-4 ml-1"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            </article>
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
