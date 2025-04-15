
import { useState, useCallback } from "react";
import { Trash2, Upload, Image as ImageIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductImageUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  maxImages?: number;
}

export function ProductImageUpload({ 
  value = [], 
  onChange, 
  maxImages = 5 
}: ProductImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0 && value.length < maxImages) {
      handleFileChange(e.dataTransfer.files);
    }
  }, [value, maxImages]);

  const handleFileChange = (files: FileList) => {
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - value.length;
    const filesToProcess = Math.min(remainingSlots, files.length);
    
    for (let i = 0; i < filesToProcess; i++) {
      const file = files[i];
      
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            onChange([...value, e.target.result.toString()]);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...value];
    newImages.splice(index, 1);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {value.map((image, index) => (
          <div 
            key={index} 
            className="relative aspect-square rounded-md overflow-hidden border bg-background group"
          >
            <img 
              src={image} 
              alt={`Product image ${index + 1}`} 
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleRemoveImage(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {value.length < maxImages && (
          <div
            className={cn(
              "flex flex-col items-center justify-center border-2 border-dashed rounded-md aspect-square cursor-pointer hover:bg-muted/50 transition-colors",
              dragActive && "border-primary bg-primary/10"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.multiple = true;
              input.accept = 'image/*';
              input.onchange = (e) => {
                const files = (e.target as HTMLInputElement).files;
                if (files) handleFileChange(files);
              };
              input.click();
            }}
          >
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                {dragActive ? (
                  <Upload className="h-5 w-5 text-primary" />
                ) : (
                  <Plus className="h-5 w-5 text-primary" />
                )}
              </div>
              <span className="text-sm font-medium">
                {dragActive ? "Drop image here" : "Add image"}
              </span>
              <span className="text-xs text-center">
                {`${value.length}/${maxImages}`} images
              </span>
            </div>
          </div>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        Drag and drop images or click to browse. Maximum {maxImages} images.
      </p>
    </div>
  );
}
