
import { useState } from "react";
import { Plus, Trash2, X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ProductVariant, ProductVariantOption } from "@/types/product";

interface ProductVariantEditorProps {
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
}

const variantTypes: { value: ProductVariant['type']; label: string; icon: string }[] = [
  { value: 'color', label: 'رنگ', icon: '🎨' },
  { value: 'size', label: 'سایز', icon: '📏' },
  { value: 'material', label: 'جنس', icon: '🧵' },
  { value: 'style', label: 'استایل', icon: '👕' },
  { value: 'capacity', label: 'ظرفیت', icon: '📦' },
  { value: 'custom', label: 'سفارشی', icon: '⚙️' },
];

const commonColors = [
  { name: 'قرمز', value: '#ef4444' },
  { name: 'آبی', value: '#3b82f6' },
  { name: 'سبز', value: '#22c55e' },
  { name: 'زرد', value: '#eab308' },
  { name: 'مشکی', value: '#171717' },
  { name: 'سفید', value: '#ffffff' },
  { name: 'خاکستری', value: '#6b7280' },
  { name: 'صورتی', value: '#ec4899' },
  { name: 'بنفش', value: '#a855f7' },
  { name: 'نارنجی', value: '#f97316' },
];

const commonSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const commonCapacities = ['16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB'];

export function ProductVariantEditor({ variants, onChange }: ProductVariantEditorProps) {
  const [newVariantType, setNewVariantType] = useState<ProductVariant['type']>('color');

  const handleAddVariant = () => {
    const newVariant: ProductVariant = {
      name: variantTypes.find(t => t.value === newVariantType)?.label || 'متغیر جدید',
      type: newVariantType,
      options: [],
      required: false,
      displayOrder: variants.length,
    };
    onChange([...variants, newVariant]);
  };

  const handleRemoveVariant = (index: number) => {
    const newVariants = [...variants];
    newVariants.splice(index, 1);
    onChange(newVariants);
  };

  const handleUpdateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const newVariants = [...variants];
    (newVariants[index] as any)[field] = value;
    onChange(newVariants);
  };

  const handleAddOption = (variantIndex: number, option?: Partial<ProductVariantOption>) => {
    const newVariants = [...variants];
    const newOption: ProductVariantOption = {
      name: option?.name || '',
      value: option?.value || '',
      priceAdjustment: option?.priceAdjustment || 0,
      stockQuantity: option?.stockQuantity || 0,
      isAvailable: true,
    };
    newVariants[variantIndex].options.push(newOption);
    onChange(newVariants);
  };

  const handleUpdateOption = (
    variantIndex: number, 
    optionIndex: number, 
    field: keyof ProductVariantOption, 
    value: any
  ) => {
    const newVariants = [...variants];
    (newVariants[variantIndex].options[optionIndex] as any)[field] = value;
    onChange(newVariants);
  };

  const handleRemoveOption = (variantIndex: number, optionIndex: number) => {
    const newVariants = [...variants];
    newVariants[variantIndex].options.splice(optionIndex, 1);
    onChange(newVariants);
  };

  const renderQuickAdd = (variant: ProductVariant, variantIndex: number) => {
    if (variant.type === 'color') {
      return (
        <div className="flex flex-wrap gap-2 mt-2">
          {commonColors.map((color) => (
            <button
              key={color.value}
              type="button"
              className="w-6 h-6 rounded-full border-2 border-border hover:scale-110 transition-transform"
              style={{ backgroundColor: color.value }}
              title={color.name}
              onClick={() => handleAddOption(variantIndex, { name: color.name, value: color.value })}
            />
          ))}
        </div>
      );
    }
    
    if (variant.type === 'size') {
      return (
        <div className="flex flex-wrap gap-2 mt-2">
          {commonSizes.map((size) => (
            <Badge
              key={size}
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => handleAddOption(variantIndex, { name: size, value: size })}
            >
              {size}
            </Badge>
          ))}
        </div>
      );
    }

    if (variant.type === 'capacity') {
      return (
        <div className="flex flex-wrap gap-2 mt-2">
          {commonCapacities.map((cap) => (
            <Badge
              key={cap}
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => handleAddOption(variantIndex, { name: cap, value: cap })}
            >
              {cap}
            </Badge>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Add new variant */}
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <Select value={newVariantType} onValueChange={(v) => setNewVariantType(v as ProductVariant['type'])}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="نوع متغیر" />
          </SelectTrigger>
          <SelectContent>
            {variantTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                <span className="flex items-center gap-2">
                  <span>{type.icon}</span>
                  <span>{type.label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="button" variant="outline" onClick={handleAddVariant}>
          <Plus className="h-4 w-4 ml-1" />
          افزودن متغیر
        </Button>
      </div>

      {/* Variants list */}
      {variants.map((variant, variantIndex) => (
        <Card key={variantIndex} className="border-dashed">
          <CardHeader className="py-3 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
              <Badge variant="outline">
                {variantTypes.find(t => t.value === variant.type)?.icon} {variant.type}
              </Badge>
              <Input
                value={variant.name}
                onChange={(e) => handleUpdateVariant(variantIndex, 'name', e.target.value)}
                className="w-40 h-8"
                placeholder="نام متغیر"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id={`required-${variantIndex}`}
                  checked={variant.required}
                  onCheckedChange={(checked) => handleUpdateVariant(variantIndex, 'required', checked)}
                />
                <Label htmlFor={`required-${variantIndex}`} className="text-sm">اجباری</Label>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveVariant(variantIndex)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Quick add buttons */}
            {renderQuickAdd(variant, variantIndex)}

            {/* Options list */}
            <div className="space-y-2 mt-4">
              {variant.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center gap-3 p-2 bg-background rounded border">
                  {variant.type === 'color' && (
                    <div
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: option.value }}
                    />
                  )}
                  <Input
                    value={option.name}
                    onChange={(e) => handleUpdateOption(variantIndex, optionIndex, 'name', e.target.value)}
                    placeholder="نام (مثال: قرمز)"
                    className="flex-1 h-8"
                  />
                  <Input
                    value={option.value}
                    onChange={(e) => handleUpdateOption(variantIndex, optionIndex, 'value', e.target.value)}
                    placeholder={variant.type === 'color' ? '#ffffff' : 'مقدار'}
                    className="w-28 h-8"
                  />
                  <Input
                    type="number"
                    value={option.priceAdjustment || 0}
                    onChange={(e) => handleUpdateOption(variantIndex, optionIndex, 'priceAdjustment', Number(e.target.value))}
                    placeholder="تفاوت قیمت"
                    className="w-28 h-8"
                  />
                  <Input
                    type="number"
                    value={option.stockQuantity || 0}
                    onChange={(e) => handleUpdateOption(variantIndex, optionIndex, 'stockQuantity', Number(e.target.value))}
                    placeholder="موجودی"
                    className="w-24 h-8"
                  />
                  <Input
                    value={option.sku || ''}
                    onChange={(e) => handleUpdateOption(variantIndex, optionIndex, 'sku', e.target.value)}
                    placeholder="SKU"
                    className="w-28 h-8"
                  />
                  <Switch
                    checked={option.isAvailable !== false}
                    onCheckedChange={(checked) => handleUpdateOption(variantIndex, optionIndex, 'isAvailable', checked)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveOption(variantIndex, optionIndex)}
                    className="h-8 w-8 text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {/* Add custom option */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddOption(variantIndex)}
                className="mt-2"
              >
                <Plus className="h-4 w-4 ml-1" />
                افزودن گزینه سفارشی
              </Button>
            </div>

            {variant.options.length === 0 && (
              <div className="text-center py-6 text-muted-foreground text-sm">
                هنوز گزینه‌ای اضافه نشده. از دکمه‌های بالا استفاده کنید یا گزینه سفارشی اضافه کنید.
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {variants.length === 0 && (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
          <p className="text-sm">هنوز متغیری اضافه نشده است.</p>
          <p className="text-xs mt-1">متغیرها مانند رنگ، سایز یا ظرفیت به مشتریان امکان انتخاب می‌دهند.</p>
        </div>
      )}
    </div>
  );
}
