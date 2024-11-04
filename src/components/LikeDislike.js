import React from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

const LikeDislike = ({ 
  likes, 
  dislikes, 
  isLiked, 
  isDisliked, 
  onLike, 
  onDislike, 
  size = "default" 
}) => {
  const buttonClass = size === "small" 
    ? "p-1 text-xs"
    : "p-2 text-sm";

  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={onLike}
        className={`${buttonClass} flex items-center space-x-1 rounded-full
          ${isLiked 
            ? 'bg-primary-100 text-primary-600' 
            : 'hover:bg-gray-100 text-gray-600'
          } transition-colors duration-200`}
      >
        <ThumbsUp size={size === "small" ? 14 : 18} />
        <span>{likes}</span>
      </button>

      <button
        onClick={onDislike}
        className={`${buttonClass} flex items-center space-x-1 rounded-full
          ${isDisliked 
            ? 'bg-red-100 text-red-600' 
            : 'hover:bg-gray-100 text-gray-600'
          } transition-colors duration-200`}
      >
        <ThumbsDown size={size === "small" ? 14 : 18} />
        <span>{dislikes}</span>
      </button>
    </div>
  );
};

export default LikeDislike; 