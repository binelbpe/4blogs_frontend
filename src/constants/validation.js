export const VALIDATION_RULES = {
  EMAIL: /^[a-zA-Z0-9._-]+@[a-z]+\.[a-z]{2,}$/,
  PHONE: /^\d{10}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  IMAGE: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif']
  }
};

export const ERROR_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid 10-digit phone number',
  INVALID_PASSWORD: 'Password must include uppercase, lowercase, number and special character',
  PASSWORDS_DONT_MATCH: 'Passwords must match',
  IMAGE_TOO_LARGE: 'Image must be less than 5MB',
  INVALID_IMAGE_TYPE: 'Please upload a valid image file'
}; 