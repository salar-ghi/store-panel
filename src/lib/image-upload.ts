
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
  
  // If it's a URL, return as is
  if (base64String.startsWith('http://') || base64String.startsWith('https://') || base64String.startsWith('/')) {
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
    
    // For now, just return the base64 string directly
    // The backend will receive this and can store it
    return base64String;
    
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

/**
 * Creates a preview URL for a file before upload
 */
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Validates if a file is a valid image - supports all common image formats
 */
export function validateImageFile(file: File): boolean {
  const validTypes = [
    'image/jpeg', 
    'image/jpg', 
    'image/png', 
    'image/gif', 
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/tiff',
    'image/avif',
    'image/heic',
    'image/heif'
  ];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  // Also check by extension if type is empty or generic
  const extension = file.name.split('.').pop()?.toLowerCase();
  const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'avif', 'heic', 'heif'];
  
  const isValidType = validTypes.includes(file.type) || 
                      (extension && validExtensions.includes(extension)) ||
                      file.type.startsWith('image/');
  
  if (!isValidType) {
    throw new Error('فرمت فایل نامعتبر است. لطفا یک تصویر معتبر آپلود کنید.');
  }
  
  if (file.size > maxSize) {
    throw new Error('حجم فایل بیش از حد مجاز است. لطفا تصویری کمتر از ۱۰ مگابایت آپلود کنید.');
  }
  
  return true;
}

/**
 * Gets the full image URL for display from base64
 */
export function getImageUrl(base64String: string): string {
  return base64ToImageUrl(base64String);
}
