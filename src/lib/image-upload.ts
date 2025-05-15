
/**
 * Handles image uploads for various entities like products, categories, brands, etc.
 * Saves files to local storage with unique filenames
 */
export async function uploadImage(
  file: File, 
  entityType: 'category' | 'brand' | 'product' | 'banner'
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Create a unique filename
      const timestamp = new Date().getTime();
      const randomString = Math.random().toString(36).substring(2, 10);
      const extension = file.name.split('.').pop();
      const filename = `${entityType}-${timestamp}-${randomString}.${extension}`;
      
      // Define storage path
      const storagePath = `/uploads/${entityType}s`;
      const fullPath = `${storagePath}/${filename}`;
      
      // In a real production environment, this would use a file storage service
      // For now, we'll simulate by storing to localStorage for demo purposes
      // (This is just a simulation - in a real app we'd use actual file storage)
      
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          // Store file info in localStorage (simulating file storage)
          const fileMap = JSON.parse(localStorage.getItem('fileStorage') || '{}');
          fileMap[fullPath] = {
            name: filename,
            type: file.type,
            size: file.size,
            lastModified: new Date().toISOString(),
            url: reader.result
          };
          localStorage.setItem('fileStorage', JSON.stringify(fileMap));
          
          console.log(`File uploaded to storage path: ${fullPath}`);
          
          // Return the path that would be stored in the database
          // This is the URL that would point to the file in storage
          resolve(fullPath);
        } catch (err) {
          console.error("Error storing file:", err);
          reject(err);
        }
      };
      
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        reject(error);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error in upload process:", error);
      reject(error);
    }
  });
}

/**
 * Retrieves an image from storage by its path
 */
export function getImageFromStorage(path: string): string | null {
  try {
    const fileMap = JSON.parse(localStorage.getItem('fileStorage') || '{}');
    const fileInfo = fileMap[path];
    
    if (fileInfo && fileInfo.url) {
      return fileInfo.url;
    }
    
    console.warn(`Image not found in storage: ${path}`);
    return null;
  } catch (error) {
    console.error("Error retrieving image from storage:", error);
    return null;
  }
}
