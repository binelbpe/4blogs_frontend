export const handleImageValidation = async (file, setError, setImage, setPreview, setToast) => {
  try {
   
    if (!file.type.startsWith('image/')) {
      setError('File must be an image');
      return false;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return false;
    }


    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

  
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