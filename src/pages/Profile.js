import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getUserArticles } from "../api/userapi";
import LoadingSpinner from "../components/LoadingSpinner";
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import { useAuth } from "../context/AuthContext";
import { PAGINATION } from '../constants/pagination';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [stats, setStats] = useState({
    totalArticles: 0,
    totalViews: 0,
  });

  const fetchArticles = useCallback(async () => {
    try {
      const response = await getUserArticles({ 
        page, 
        limit: PAGINATION.DEFAULT_LIMIT 
      });
      if (response.success && response.data) {
        if (page === 1) {
          setArticles(response.data.articles);
        } else {
          setArticles(prev => [...prev, ...response.data.articles]);
        }
        setHasMore(response.data.hasMore);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user articles:", error);
      setLoading(false);
    }
  }, [page]);

  const loadMore = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  const [isFetching] = useInfiniteScroll(loadMore, hasMore);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        await fetchArticles();
        setStats({
          totalArticles: articles.length,
          totalViews: articles.length * 100,
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [fetchArticles, articles.length]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-4">
            {user.image ? (
              <img
                src={`${process.env.PUBLIC_URL}${user.image}`}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-24 h-24 rounded-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=0D8ABC&color=fff`;
                }}
              />
            ) : (
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-3xl text-primary-800">
                  {user.firstName?.charAt(0)}
                  {user.lastName?.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-4xl font-bold ">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-gray-600">
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </p>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/update-profile")}
            className="btn-primary"
          >
            Update Profile
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-primary-600">
              {stats.totalArticles}
            </div>
            <div className="text-gray-600">Articles</div>
          </div>
        </div>

        {user.preferences?.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Interests</h2>
            <div className="flex flex-wrap gap-2">
              {user.preferences.map((preference, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                >
                  {preference}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-6">
          Articles by {user.firstName}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((article) => (
            <div
              key={article._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all cursor-pointer"
              onClick={() => navigate(`/articles/${article._id}`)}
            >
              {article.image ? (
                <img
                  src={`${process.env.PUBLIC_URL}${article.image}`}
                  alt={article.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/150?text=No+Image";
                  }}
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{article.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {article.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {new Date(article.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {isFetching && <LoadingSpinner />}
        {!hasMore && articles.length > 0 && (
          <p className="text-center text-gray-500 mt-8">
            No more articles to load
          </p>
        )}
      </div>
    </div>
  );
};

export default Profile;
