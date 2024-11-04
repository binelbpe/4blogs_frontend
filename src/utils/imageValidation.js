export const handleImageValidation = async (file, setError, setImage, setPreview, setToast) => {
  try {
    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('File must be an image');
      return false;
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return false;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Set the image
    setImage(file);
    return true;
  } catch (error) {
    console.error('Image validation error:', error);
    setError('Failed to process image');
    if (setToast) {
      setToast({
        message: 'Failed to process image. Please try another one.',
        type: 'error'
      });
    }
    return false;
  }
}; 