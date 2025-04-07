
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";

export default function Products() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Products</h2>
        <Button className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="w-full pl-8"
          />
        </div>
      </div>
      
      <div className="flex h-[50vh] items-center justify-center rounded-md border border-dashed">
        <div className="text-center">
          <h3 className="text-lg font-medium">No products found</h3>
          <p className="text-sm text-muted-foreground">
            Get started by adding your first product
          </p>
          <Button className="mt-4 flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>
    </div>
  );
}
