
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
import { Loader2 } from "lucide-react";

interface BrandsCardProps {
  brands: Brand[];
  isLoading: boolean;
  onEdit: (brand: Brand) => void;
  onAddBrand: () => void;
}

export function BrandsCard({ brands, isLoading, onEdit, onAddBrand }: BrandsCardProps) {
  return (
    <Card className="border border-border shadow-sm bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-foreground">مدیریت برندها</CardTitle>
        <CardDescription className="text-muted-foreground">
          مشاهده و مدیریت تمامی برندهای محصولات
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8 gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>در حال بارگذاری برندها...</span>
          </div>
        ) : brands.length === 0 ? (
          <EmptyBrandState onAddBrand={onAddBrand} />
        ) : (
          <BrandList brands={brands} onEdit={onEdit} />
        )}
      </CardContent>
    </Card>
  );
}
