export const validateImage = (file) => {
  // Check if file exists
  if (!file) {
    return { isValid: false, error: 'Image is required' };
  }

  // Check file type
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: 'Invalid file type. Only JPG, PNG, GIF and WEBP images are allowed' 
    };
  }

  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return { 
      isValid: false, 
      error: 'Image size must be less than 5MB' 
    };
  }

  // Check image dimensions (optional)
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      
      // Minimum dimensions (e.g., 200x200 pixels)
      if (img.width < 200 || img.height < 200) {
        resolve({
          isValid: false,
          error: 'Image dimensions must be at least 200x200 pixels'
        });
        return;
      }

      // Maximum dimensions (e.g., 4000x4000 pixels)
      if (img.width > 4000 || img.height > 4000) {
        resolve({
          isValid: false,
          error: 'Image dimensions must not exceed 4000x4000 pixels'
        });
        return;
      }

      resolve({ isValid: true });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        isValid: false,
        error: 'Invalid image file'
      });
    };

    img.src = objectUrl;
  });
};

// Helper function for handling image change events
export const handleImageValidation = async (file, setError, setImage, setPreview, setToast = null) => {
  try {
    const validation = await validateImage(file);
    
    if (!validation.isValid) {
      setError(validation.error);
      // Show toast if setToast function is provided
      if (setToast) {
        setToast({
          message: validation.error,
          type: 'error'
        });
      }
      return false;
    }

    // If validation passes, create preview and set image
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    setImage(file);
    setError('');
    return true;
  } catch (error) {
    const errorMessage = 'Error validating image';
    setError(errorMessage);
    if (setToast) {
      setToast({
        message: errorMessage,
        type: 'error'
      });
    }
    return false;
  }
}; 