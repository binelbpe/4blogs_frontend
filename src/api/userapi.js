import api from "./api";
import axios from "axios";

export const register = async (userData) => {
  try {
    console.log("Registering user with data:", {
      ...userData,
      image: userData.get("image") ? "File present" : "No file",
    });

    const response = await api.post("register", userData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("Registration response:", response.data);

    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error("Registration error:", error.response?.data || error);
    throw error;
  }
};

export const login = async (credentials) => {
  try {
    console.log("Login attempt with:", credentials);
    const response = await api.post("/login", credentials, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (response.data.success && response.data.data.token) {
      localStorage.setItem("token", response.data.data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.token}`;
    }
    return response.data;
  } catch (error) {
    console.error("Login error in service:", error.response?.data || error.message);
    throw error;
  }
};

export const getProfile = async () => {
  const response = await api.get("profile");
  return response.data;
};

export const logout = () => {
  localStorage.removeItem("token");
};

export const getUserProfile = async (userId) => {
  try {
    const response = await api.get(`/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export const getArticlesByUser = async (userId) => {
  try {
    const response = await api.get(`/${userId}/articles`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user articles:", error);
    throw error;
  }
};

export const updateProfile = async (userData) => {
  try {
    const response = await api.put("/update_profile", userData);
    return response.data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

export const createArticle = async (articleData) => {
  try {
    console.log("Creating article with data:", {
      title: articleData.get("title"),
      description: articleData.get("description"),
      category: articleData.get("category"),
      hasImage: articleData.get("image") ? "Yes" : "No",
      tags: articleData.get("tags"),
    });

    const response = await api.post("/articles", articleData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to create article");
    }

    return response.data;
  } catch (error) {
    console.error("Error in createArticle:", error.response?.data || error);
    throw error;
  }
};

export const getArticles = async () => {
  const response = await api.get("/articles");
  return response.data;
};

export const getUserArticles = async () => {
  const response = await api.get("/articles/user");
  return response.data;
};

export const getArticlesByUserAndId = async (userId) => {
  const response = await api.get(`/articles/user/${userId}`);
  return response.data;
};

export const getArticleById = async (id) => {
  const response = await api.get(`/articles/${id}`);
  return response.data;
};

export const getArticleByUserAndId = async (id) => {
  const response = await api.get(`/articles/user/${id}`);
  return response.data;
};

export const updateArticle = async (id, formData) => {
  try {
    const response = await api.put(`/articles/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error(
      "Error in updateArticle:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const deleteArticle = async (id) => {
  const response = await api.delete(`/articles/${id}`);
  return response.data;
};

export const blockArticle = async (id) => {
  const response = await api.post(`/articles/${id}/block`);
  return response.data;
};

export const getDeletedArticles = async () => {
  const response = await api.get("/articles/deleted");
  return response.data;
};

export const likeArticle = async (articleId) => {
  try {
    const response = await axios.post(`/api/articles/${articleId}/like`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const dislikeArticle = async (articleId) => {
  try {
    const response = await axios.post(`/api/articles/${articleId}/dislike`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
