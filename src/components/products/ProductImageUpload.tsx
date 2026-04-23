import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, ImageIcon, Plus, Star, Check } from "lucide-react";
import { uploadImage, validateImageFile } from "@/lib/image-upload";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProductImageUploadProps {
  value: string[];
  onChange: (images: string[]) => void;
  coverImage?: string;
  onCoverChange?: (cover: string) => void;
  maxImages?: number;
}

export function ProductImageUpload({
  value = [],
  onChange,
  coverImage,
  onCoverChange,
  maxImages = 5,
}: ProductImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  // Resolve which image is currently the cover. If none is explicitly set,
  // the first uploaded image is treated as the main image by default.
  const resolvedCover = coverImage && value.includes(coverImage) ? coverImage : value[0];

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    if (value.length + files.length > maxImages) {
      toast.error(`حداکثر ${maxImages} تصویر مجاز است`);
      return;
    }

    try {
      setIsUploading(true);
      const uploadedUrls = await Promise.all(
        files.map(async (file) => {
          validateImageFile(file);
          return await uploadImage(file, "product");
        })
      );

      const newImages = [...value, ...uploadedUrls];
      onChange(newImages);

      // If no cover yet, auto-pick the first uploaded image as cover
      if (!resolvedCover && newImages.length > 0 && onCoverChange) {
        onCoverChange(newImages[0]);
      }

      toast.success("تصاویر با موفقیت آپلود شدند");
    } catch (error: any) {
      toast.error(error.message || "خطا در آپلود تصاویر");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    const removed = value[index];
    const newImages = value.filter((_, i) => i !== index);
    onChange(newImages);

    // If we just removed the cover, fall back to the new first image (or empty)
    if (onCoverChange && removed === resolvedCover) {
      onCoverChange(newImages[0] || "");
    }
  };

  const handleSetCover = (img: string) => {
    onCoverChange?.(img);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <ImageIcon className="h-4 w-4 text-primary" />
          تصاویر محصول
        </Label>
        <span className="text-xs text-muted-foreground">
          {value.length} / {maxImages}
        </span>
      </div>

      {value.length > 0 && (
        <>
          <p className="text-xs text-muted-foreground">
            روی هر تصویر کلیک کنید تا به عنوان <span className="font-medium text-foreground">تصویر اصلی</span> انتخاب شود.
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {value.map((imageUrl, index) => {
              const isCover = imageUrl === resolvedCover;
              return (
                <button
                  type="button"
                  key={index}
                  onClick={() => handleSetCover(imageUrl)}
                  className={cn(
                    "relative group aspect-square rounded-xl overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary/40",
                    isCover
                      ? "border-primary shadow-md ring-2 ring-primary/30"
                      : "border-border hover:border-primary/50"
                  )}
                  title={isCover ? "تصویر اصلی" : "انتخاب به عنوان تصویر اصلی"}
                >
                  <img
                    src={imageUrl}
                    alt={`تصویر محصول ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Cover badge */}
                  {isCover && (
                    <div className="absolute top-1.5 right-1.5 flex items-center gap-1 bg-primary text-primary-foreground text-[10px] font-medium px-2 py-0.5 rounded-full shadow">
                      <Star className="h-3 w-3 fill-current" />
                      اصلی
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    {!isCover && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-background/90 text-foreground text-[10px] font-medium px-2 py-1 rounded-full">
                        <Check className="h-3 w-3" />
                        انتخاب اصلی
                      </div>
                    )}
                  </div>

                  {/* Remove */}
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(index);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemoveImage(index);
                      }
                    }}
                    className="absolute top-1.5 left-1.5 h-6 w-6 inline-flex items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity shadow"
                  >
                    <X className="h-3.5 w-3.5" />
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {value.length < maxImages && (
        <div className="border-2 border-dashed border-border hover:border-primary/40 transition-colors rounded-xl p-5 bg-muted/30">
          <div className="flex flex-col items-center text-center">
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
              <Upload className="h-5 w-5" />
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {value.length === 0
                ? "تصاویر محصول را آپلود کنید"
                : `می‌توانید ${maxImages - value.length} تصویر دیگر اضافه کنید`}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById("product-images-input")?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                "در حال آپلود..."
              ) : (
                <>
                  <Plus className="h-4 w-4 ml-1" />
                  {value.length === 0 ? "انتخاب تصاویر" : "افزودن تصویر"}
                </>
              )}
            </Button>
            {value.length === 0 && (
              <p className="text-[11px] text-muted-foreground mt-2">
                اولین تصویر به صورت پیش‌فرض به عنوان تصویر اصلی انتخاب می‌شود
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
