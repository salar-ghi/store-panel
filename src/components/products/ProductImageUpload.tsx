
import { ImageUpload } from "@/components/ui/image-upload";

interface ProductImageUploadProps {
  onImageUpload: (url: string) => void;
  currentImage?: string;
}

export function ProductImageUpload({ onImageUpload, currentImage }: ProductImageUploadProps) {
  return (
    <ImageUpload
      onImageUpload={onImageUpload}
      entityType="product"
      currentImage={currentImage}
      label="تصویر محصول"
    />
  );
}
