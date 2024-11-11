const logger = {
  error: (message, error) => {
    console.error(`[ERROR] ${message}:`, {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
      status: error.response?.status
    });
  },

  warn: (message, data = {}) => {
    console.warn(`[WARN] ${message}:`, data);
  },

  info: (message, data = {}) => {
    console.log(`[INFO] ${message}:`, data);
  }
};

export default logger; 