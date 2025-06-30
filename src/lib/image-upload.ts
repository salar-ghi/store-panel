/**
 * Handles image uploads for various entities like products, categories, brands, etc.
 * Sends files to backend API and returns the URL for database storage
 */

// Configuration for backend API
const UPLOAD_CONFIG = {
  apiUrl: 'https://localhost:5000/api/upload', // Backend upload endpoint
  baseImageUrl: 'https://localhost:5000/uploads', // Base URL for accessing uploaded files
};

export async function uploadImage(
  file: File, 
  entityType: 'category' | 'brand' | 'product' | 'banner'
): Promise<string> {
  try {
    // Create FormData to send the file
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityType', entityType);
    
    // Send to backend API
    const response = await fetch(UPLOAD_CONFIG.apiUrl, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    // Return the full URL that will be stored in the database
    return result.url || result.filePath;
    
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Failed to upload image");
  }
}

/**
 * Creates a preview URL for a file before upload
 */
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Validates if a file is a valid image
 */
export function validateImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a valid image file.');
  }
  
  if (file.size > maxSize) {
    throw new Error('File size too large. Please upload an image smaller than 5MB.');
  }
  
  return true;
}

/**
 * Gets the full image URL for display
 */
export function getImageUrl(imagePath: string): string {
  if (!imagePath) return '';
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Otherwise, prepend the base URL
  return `${UPLOAD_CONFIG.baseImageUrl}/${imagePath}`;
}
