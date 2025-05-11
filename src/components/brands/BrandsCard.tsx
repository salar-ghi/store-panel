
import { Brand } from "@/types/brand";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { EmptyBrandState } from "@/components/brands/EmptyBrandState";
import { BrandList } from "@/components/brands/BrandList";

interface BrandsCardProps {
  brands: Brand[];
  isLoading: boolean;
  onEdit: (brand: Brand) => void;
  onAddBrand: () => void;
}

export function BrandsCard({ brands, isLoading, onEdit, onAddBrand }: BrandsCardProps) {
  return (
    <Card className="border shadow-sm bg-black text-white">
      <CardHeader className="pb-3">
        <CardTitle>مدیریت برندها</CardTitle>
        <CardDescription className="text-gray-400">
          مشاهده و مدیریت تمامی برندهای محصولات
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8 text-gray-300">در حال بارگذاری برندها...</div>
        ) : brands.length === 0 ? (
          <EmptyBrandState onAddBrand={onAddBrand} />
        ) : (
          <BrandList brands={brands} onEdit={onEdit} />
        )}
      </CardContent>
    </Card>
  );
}
