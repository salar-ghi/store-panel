import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { MapPin, Plus, Edit, Trash, PackageSearch, MoreHorizontal } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

// Define the Location type to ensure consistency
interface Location {
  id: number;
  name: string;
  address: string;
  capacity: number;
  used: number;
}

// Mock data for inventory locations
const mockLocations: Location[] = [
  { id: 1, name: "انبار مرکزی", address: "تهران، خیابان ولیعصر", capacity: 2000, used: 1450 },
  { id: 2, name: "انبار شرق", address: "مشهد، بلوار پیروزی", capacity: 1500, used: 980 },
  { id: 3, name: "انبار غرب", address: "تبریز، خیابان امام", capacity: 1000, used: 750 },
  { id: 4, name: "انبار شمال", address: "رشت، خیابان لاکانی", capacity: 800, used: 320 },
  { id: 5, name: "انبار جنوب", address: "شیراز، بلوار ارم", capacity: 1200, used: 890 },
];

const locationFormSchema = z.object({
  name: z.string().min(2, { message: "نام مکان باید حداقل ۲ کاراکتر باشد" }),
  address: z.string().min(5, { message: "آدرس باید حداقل ۵ کاراکتر باشد" }),
  capacity: z.coerce.number().positive({ message: "ظرفیت باید عدد مثبت باشد" }),
});

type LocationFormValues = z.infer<typeof locationFormSchema>;

export default function InventoryLocations() {
  const [locations, setLocations] = useState<Location[]>(mockLocations);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: {
      name: "",
      address: "",
      capacity: 0,
    },
  });

  const onSubmit = (data: LocationFormValues) => {
    if (editingLocation) {
      // Update existing location
      setLocations(
        locations.map((loc) =>
          loc.id === editingLocation.id
            ? { ...loc, ...data }
            : loc
        )
      );
      toast.success("مکان انبار با موفقیت به‌روزرسانی شد");
    } else {
      // Add new location with required fields
      const newLocation: Location = {
        id: locations.length + 1,
        name: data.name,
        address: data.address,
        capacity: data.capacity,
        used: 0,
      };
      setLocations([...locations, newLocation]);
      toast.success("مکان انبار با موفقیت اضافه شد");
    }
    setIsDialogOpen(false);
    form.reset();
    setEditingLocation(null);
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    form.reset({
      name: location.name,
      address: location.address,
      capacity: location.capacity,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("آیا از حذف این مکان انبار اطمینان دارید؟")) {
      setLocations(locations.filter((loc) => loc.id !== id));
      toast.success("مکان انبار با موفقیت حذف شد");
    }
  };

  const openNewDialog = () => {
    setEditingLocation(null);
    form.reset({
      name: "",
      address: "",
      capacity: 0,
    });
    setIsDialogOpen(true);
  };

  const filteredLocations = locations.filter((loc) =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">مکان‌های انبار</h1>
          <p className="text-muted-foreground">مدیریت و سازماندهی مکان‌های نگهداری محصولات</p>
        </div>
        <Button onClick={openNewDialog} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          افزودن مکان جدید
        </Button>
      </div>

      <Card className="bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>مکان‌های انبار</CardTitle>
          <div className="flex items-center w-72">
            <Input
              placeholder="جستجو در مکان‌ها..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <PackageSearch className="h-4 w-4 text-muted-foreground absolute mr-3" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>نام مکان</TableHead>
                  <TableHead>آدرس</TableHead>
                  <TableHead>ظرفیت</TableHead>
                  <TableHead>استفاده شده</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead className="text-left">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLocations.map((location) => {
                  const usagePercent = Math.round((location.used / location.capacity) * 100);
                  return (
                    <TableRow key={location.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-indigo-500" />
                          <span className="font-medium">{location.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{location.address}</TableCell>
                      <TableCell>{location.capacity.toLocaleString()} واحد</TableCell>
                      <TableCell>{location.used.toLocaleString()} واحد</TableCell>
                      <TableCell>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                          <div 
                            className={`h-2.5 rounded-full ${
                              usagePercent < 50 ? 'bg-green-500' : 
                              usagePercent < 80 ? 'bg-yellow-500' : 
                              'bg-red-500'
                            }`}
                            style={{ width: `${usagePercent}%` }}
                          ></div>
                        </div>
                        <div className="text-xs mt-1 text-muted-foreground">
                          {usagePercent}% استفاده شده
                        </div>
                      </TableCell>
                      <TableCell className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(location)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDelete(location.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {filteredLocations.length === 0 && (
              <div className="py-6 text-center text-muted-foreground">
                هیچ مکانی با این مشخصات پیدا نشد
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingLocation ? "ویرایش مکان انبار" : "افزودن مکان انبار جدید"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" dir="rtl">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نام مکان</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: انبار مرکزی" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>آدرس</FormLabel>
                    <FormControl>
                      <Input placeholder="آدرس مکان را وارد کنید" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ظرفیت (واحد)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="مثال: 1000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit">
                  {editingLocation ? "به‌روزرسانی" : "افزودن مکان"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
