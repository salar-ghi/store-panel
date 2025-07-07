
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Image, Plus } from "lucide-react";
import { uploadImage, createImagePreview, validateImageFile } from "@/lib/image-upload";
import { toast } from "sonner";

interface ProductImageUploadProps {
  value: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export function ProductImageUpload({ 
  value = [], 
  onChange, 
  maxImages = 5 
}: ProductImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    if (value.length + files.length > maxImages) {
      toast.error(`حداکثر ${maxImages} تصویر مجاز است`);
      return;
    }

    try {
      setIsUploading(true);
      const uploadPromises = files.map(async (file) => {
        validateImageFile(file);
        return await uploadImage(file, 'product');
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const newImages = [...value, ...uploadedUrls];
      onChange(newImages);
      
      toast.success("تصاویر با موفقیت آپلود شدند");
      
    } catch (error: any) {
      toast.error(error.message || "خطا در آپلود تصاویر");
    } finally {
      setIsUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = value.filter((_, i) => i !== index);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      <Label className="flex items-center gap-2">
        <Image className="h-4 w-4" />
        تصاویر محصول (حداکثر {maxImages} تصویر)
      </Label>
      
      {/* Display uploaded images */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {value.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <img 
                src={imageUrl} 
                alt={`تصویر محصول ${index + 1}`} 
                className="w-full h-32 object-cover rounded-lg border"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveImage(index)}
              >
                <X className="h-3 w-3" />
              </Button>
              {index === 0 && (
                <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                  تصویر اصلی
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {value.length < maxImages && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {value.length === 0 
                ? "برای آپلود تصاویر محصول کلیک کنید" 
                : `${maxImages - value.length} تصویر دیگر می‌توانید اضافه کنید`
              }
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('product-images-input')?.click()}
              disabled={isUploading}
              className="mb-2"
            >
              {isUploading ? (
                "در حال آپلود..."
              ) : (
                <>
                  <Plus className="h-4 w-4 ml-2" />
                  {value.length === 0 ? "انتخاب تصاویر" : "افزودن تصویر"}
                </>
              )}
            </Button>
            {value.length === 0 && (
              <p className="text-xs text-gray-400 mt-2">
                اولین تصویر به عنوان تصویر اصلی محصول استفاده می‌شود
              </p>
            )}
          </div>
        </div>
      )}
      
      <Input
        id="product-images-input"
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
