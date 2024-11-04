import React from 'react';
import { Link } from 'react-router-dom';
import LikeDislike from './LikeDislike';

const ArticleCard = ({ article, onLike, onDislike, showLikes = true }) => {
  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/articles/${article._id}`} className="flex flex-col md:flex-row">
        <div className="md:w-1/3 lg:w-1/4">
          {article.image ? (
            <img
              src={`${process.env.PUBLIC_URL}${article.image}`}
              alt={article.title}
              className="w-full h-48 md:h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/150?text=No+Image";
              }}
            />
          ) : (
            <div className="w-full h-48 md:h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}
        </div>
        <div className="p-6 md:w-2/3 lg:w-3/4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>{new Date(article.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span>By {article.author.firstName} {article.author.lastName}</span>
              <span>•</span>
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                {article.category}
              </span>
            </div>
            {showLikes && (
              <LikeDislike
                likes={article.likes?.length || 0}
                dislikes={article.dislikes?.length || 0}
                isLiked={article.isLiked}
                isDisliked={article.isDisliked}
                onLike={() => onLike(article._id)}
                onDislike={() => onDislike(article._id)}
                size="small"
              />
            )}
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white hover:text-primary-600">
            {article.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
            {article.description}
          </p>
          <div className="flex items-center text-primary-600 dark:text-primary-400 font-medium">
            Read more
            <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>
    </article>
  );
};

export default ArticleCard; 