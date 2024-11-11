export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    REFRESH_TOKEN: '/refresh-token',
    LOGOUT: '/logout'
  },
  USER: {
    PROFILE: '/profile',
    UPDATE_PROFILE: '/update_profile',
    GET_USER: '/:id',
    USER_ARTICLES: '/:id/articles'
  },
  ARTICLES: {
    CREATE: '/articles',
    LIST: '/articles',
    USER_ARTICLES: '/articles/user',
    DETAIL: '/articles/:id',
    UPDATE: '/articles/:id',
    DELETE: '/articles/:id',
    BLOCK: '/articles/:id/block',
    LIKE: '/articles/:id/like',
    DISLIKE: '/articles/:id/dislike'
  }
};

export const BASE_URL = process.env.REACT_APP_API_URL || 'https://4blogs.fun/user'; 