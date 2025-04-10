
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CategoryService } from "@/services/category-service";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2, Grid3X3, ArrowRightLeft, Hash } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Category } from "@/types/category";
import { toast } from "sonner";

// Mock data for categories with brand relations
const mockCategories: Category[] = [
  {
    id: 1,
    name: "Smartphones",
    description: "Latest mobile devices and accessories",
    createdAt: "2023-01-15T10:30:00Z",
    productCount: 120,
    brandRelations: ["Apple", "Samsung", "Xiaomi", "Google"],
  },
  {
    id: 2,
    name: "Laptops",
    description: "Personal computers for work and entertainment",
    createdAt: "2023-02-05T14:20:00Z",
    productCount: 85,
    brandRelations: ["Dell", "HP", "Lenovo", "Apple"],
  },
  {
    id: 3,
    name: "Smart Home",
    description: "Connected devices for the modern home",
    createdAt: "2023-03-12T09:45:00Z",
    productCount: 63,
    brandRelations: ["Google", "Amazon", "Philips"],
  },
  {
    id: 4,
    name: "Audio",
    description: "Headphones, speakers and audio equipment",
    createdAt: "2023-04-20T11:15:00Z",
    productCount: 97,
    brandRelations: ["Sony", "Bose", "JBL", "Sennheiser"],
  },
  {
    id: 5,
    name: "Gaming",
    description: "Consoles, accessories and gaming peripherals",
    createdAt: "2023-05-01T16:50:00Z",
    productCount: 74,
    brandRelations: ["Sony", "Microsoft", "Nintendo", "Logitech"],
  },
];

export default function Categories() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Fetch categories from API but use mock data for now
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      // In a real app, this would fetch from API
      // return CategoryService.getAllCategories();
      return Promise.resolve(mockCategories);
    },
  });

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
  };

  // Function to determine card border color based on product count
  const getCardBorderColor = (productCount: number = 0) => {
    if (productCount > 100) return "border-purple-500 dark:border-purple-400";
    if (productCount > 50) return "border-green-500 dark:border-green-400";
    return "border-blue-500 dark:border-blue-400";
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Categories</h1>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              {/* Category creation form would go here */}
              <p className="text-muted-foreground">Category creation form will be implemented here</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="text-destructive text-center py-20">
          <p>Failed to load categories</p>
          <Button 
            variant="outline" 
            onClick={() => toast.error("Failed to reload categories")}
            className="mt-4"
          >
            Try again
          </Button>
        </div>
      ) : categories && categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card 
              key={category.id} 
              className={`cursor-pointer hover:shadow-md transition-all border-l-4 ${getCardBorderColor(category.productCount)}`}
              onClick={() => handleCategoryClick(category)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center">
                  <span>{category.name}</span>
                  <Badge variant="outline" className="ml-2 bg-black/5 dark:bg-white/5">
                    <Hash className="h-3 w-3 mr-1" />
                    {category.id}
                  </Badge>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="pb-2">
                <p className="text-muted-foreground text-sm">{category.description}</p>
                
                <div className="mt-3 flex items-center text-sm">
                  <Grid3X3 className="h-4 w-4 mr-1 text-purple-500" />
                  <span className="font-medium">{category.productCount || 0} Products</span>
                </div>
              </CardContent>
              
              <CardFooter className="pt-2 flex-col items-start">
                <div className="flex items-center text-sm mb-2">
                  <ArrowRightLeft className="h-4 w-4 mr-1 text-green-500" />
                  <span className="font-medium">Brand Relations</span>
                </div>
                
                <div className="flex flex-wrap gap-1 mt-1">
                  {category.brandRelations && category.brandRelations.length > 0 ? (
                    category.brandRelations.map((brand, idx) => (
                      <Badge key={idx} variant="outline" className="bg-black/5 dark:bg-white/5">
                        {brand}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-xs">No brand relations</span>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border rounded-lg bg-muted/10">
          <h3 className="text-xl font-medium">No categories found</h3>
          <p className="text-muted-foreground mt-2">Create your first category to get started</p>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="mt-4">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Category</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                {/* Category creation form would go here */}
                <p className="text-muted-foreground">Category creation form will be implemented here</p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {selectedCategory && (
        <Dialog open={!!selectedCategory} onOpenChange={(open) => !open && setSelectedCategory(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedCategory.name} Details</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div>
                <h4 className="font-medium">Description</h4>
                <p className="text-muted-foreground">{selectedCategory.description}</p>
              </div>
              
              <div>
                <h4 className="font-medium">Products</h4>
                <p className="text-muted-foreground">{selectedCategory.productCount || 0} items in this category</p>
              </div>
              
              <div>
                <h4 className="font-medium">Brand Relations</h4>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedCategory.brandRelations && selectedCategory.brandRelations.length > 0 ? (
                    selectedCategory.brandRelations.map((brand, idx) => (
                      <Badge key={idx} variant="outline">{brand}</Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">No brand relations</span>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
