
/**
 * Handles image uploads for various entities like products, categories, brands, etc.
 * Converts images to base64 and sends to backend API
 */

// Configuration for backend API
const UPLOAD_CONFIG = {
  apiUrl: 'https://localhost:5000/api/upload', // Backend upload endpoint
  baseImageUrl: 'https://localhost:5000/uploads', // Base URL for accessing uploaded files
};

/**
 * Converts a file to base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
}

/**
 * Converts base64 string to image URL for display
 */
export function base64ToImageUrl(base64String: string): string {
  if (!base64String) return '';
  
  // If it's already a data URL, return as is
  if (base64String.startsWith('data:')) {
    return base64String;
  }
  
  // If it's a regular base64 string, add the data URL prefix
  return `data:image/jpeg;base64,${base64String}`;
}

export async function uploadImage(
  file: File, 
  entityType: 'category' | 'brand' | 'product' | 'banner'
): Promise<string> {
  try {
    // Validate the file first
    validateImageFile(file);
    
    // Convert file to base64
    const base64String = await fileToBase64(file);
    
    // Send base64 to backend API
    const response = await fetch(UPLOAD_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64String,
        entityType: entityType,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    // Return the base64 string that will be stored in the database
    return result.base64 || base64String;
    
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
 * Gets the full image URL for display from base64
 */
export function getImageUrl(base64String: string): string {
  return base64ToImageUrl(base64String);
}
