import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ArrowDown,
  ArrowUp,
  Heading2,
  ImagePlus,
  Text,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { fileToBase64, validateImageFile, base64ToImageUrl } from "@/lib/image-upload";
import { ProductContentBlock } from "@/types/product";
import { cn } from "@/lib/utils";

interface Props {
  value: ProductContentBlock[];
  onChange: (blocks: ProductContentBlock[]) => void;
}

const newId = () => Math.random().toString(36).slice(2, 10);

export function ProductIntroEditor({ value, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const pendingIndex = useRef<number | null>(null);

  const update = (index: number, patch: Partial<ProductContentBlock>) =>
    onChange(value.map((b, i) => (i === index ? { ...b, ...patch } : b)));

  const add = (type: ProductContentBlock["type"]) =>
    onChange([...value, { id: newId(), type, text: "", image: "", caption: "" }]);

  const remove = (index: number) => onChange(value.filter((_, i) => i !== index));

  const move = (index: number, dir: -1 | 1) => {
    const to = index + dir;
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    [next[index], next[to]] = [next[to], next[index]];
    onChange(next);
  };

  const pickImage = (index: number) => {
    pendingIndex.current = index;
    fileRef.current?.click();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const index = pendingIndex.current;
    e.target.value = "";
    if (!file || index == null) return;
    try {
      validateImageFile(file);
      const base64 = await fileToBase64(file);
      update(index, { image: base64 });
    } catch (err: any) {
      toast.error(err?.message || "خطا در بارگذاری تصویر");
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      {value.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed py-8 text-center text-xs text-muted-foreground">
          هنوز محتوایی اضافه نشده است. با دکمه‌های زیر متن، عنوان یا تصویر اضافه کنید.
        </div>
      ) : (
        <div className="space-y-2.5">
          {value.map((block, index) => (
            <div
              key={block.id ?? index}
              className="rounded-lg border bg-card p-3 space-y-2"
            >
              <div className="flex items-center gap-1.5">
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] gap-1">
                  {block.type === "heading" && <Heading2 className="h-3 w-3" />}
                  {block.type === "paragraph" && <Text className="h-3 w-3" />}
                  {block.type === "image" && <ImagePlus className="h-3 w-3" />}
                  {block.type === "heading"
                    ? "عنوان"
                    : block.type === "paragraph"
                    ? "متن"
                    : "تصویر"}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  بلوک {index + 1}
                </span>
                <div className="ms-auto flex items-center gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    disabled={index === value.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:bg-destructive/10"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {block.type === "heading" && (
                <Input
                  value={block.text || ""}
                  onChange={(e) => update(index, { text: e.target.value })}
                  placeholder="مثال: چرا این محصول را انتخاب کنیم؟"
                  className="h-9 text-sm font-semibold"
                />
              )}

              {block.type === "paragraph" && (
                <Textarea
                  value={block.text || ""}
                  onChange={(e) => update(index, { text: e.target.value })}
                  placeholder="متن معرفی محصول را بنویسید..."
                  className="min-h-[90px] text-sm leading-6"
                />
              )}

              {block.type === "image" && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => pickImage(index)}
                    className={cn(
                      "w-full rounded-lg border border-dashed overflow-hidden transition-colors hover:border-primary/60",
                      !block.image && "py-7 text-xs text-muted-foreground"
                    )}
                  >
                    {block.image ? (
                      <img
                        src={base64ToImageUrl(block.image)}
                        alt={block.caption || "تصویر معرفی محصول"}
                        className="w-full max-h-56 object-contain bg-muted/30"
                      />
                    ) : (
                      <span className="flex items-center justify-center gap-1.5">
                        <ImagePlus className="h-4 w-4" />
                        انتخاب تصویر
                      </span>
                    )}
                  </button>
                  <Input
                    value={block.caption || ""}
                    onChange={(e) => update(index, { caption: e.target.value })}
                    placeholder="زیرنویس تصویر (اختیاری)"
                    className="h-8 text-xs"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => add("heading")}>
          <Heading2 className="h-3.5 w-3.5 ml-1" />
          افزودن عنوان
        </Button>
        <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => add("paragraph")}>
          <Text className="h-3.5 w-3.5 ml-1" />
          افزودن متن
        </Button>
        <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => add("image")}>
          <ImagePlus className="h-3.5 w-3.5 ml-1" />
          افزودن تصویر
        </Button>
      </div>
    </div>
  );
}
