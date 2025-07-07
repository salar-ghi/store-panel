
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Image } from "lucide-react";
import { uploadImage, createImagePreview, validateImageFile } from "@/lib/image-upload";
import { toast } from "sonner";

interface ImageUploadProps {
  onImageUpload: (url: string) => void;
  entityType: 'category' | 'brand' | 'product' | 'banner';
  currentImage?: string;
  label?: string;
  className?: string;
}

export function ImageUpload({ 
  onImageUpload, 
  entityType, 
  currentImage, 
  label = "تصویر",
  className = ""
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Validate the file
      validateImageFile(file);
      
      // Create preview
      const preview = createImagePreview(file);
      setPreviewUrl(preview);
      
      // Upload to backend
      setIsUploading(true);
      const uploadedUrl = await uploadImage(file, entityType);
      
      // Call the callback with the uploaded URL
      onImageUpload(uploadedUrl);
      toast.success("تصویر با موفقیت آپلود شد");
      
    } catch (error: any) {
      toast.error(error.message || "خطا در آپلود تصویر");
      setPreviewUrl(currentImage || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageUpload("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="flex items-center gap-2">
        <Image className="h-4 w-4" />
        {label}
      </Label>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        {previewUrl ? (
          <div className="relative">
            <img 
              src={previewUrl} 
              alt="پیش‌نمایش تصویر" 
              className="w-full h-48 object-cover rounded-lg"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleRemoveImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">برای آپلود تصویر کلیک کنید</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? "در حال آپلود..." : "انتخاب تصویر"}
            </Button>
          </div>
        )}
      </div>
      
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
