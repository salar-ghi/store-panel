
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash, Pencil, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { BrandService } from "@/services/brand-service";
import { Brand } from "@/types/brand";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Brand name must be at least 2 characters.",
  }),
  description: z.string().min(5, {
    message: "Description must be at least 5 characters.",
  }),
});

type FormData = z.infer<typeof formSchema>;

export default function Brands() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Reset form when editingBrand changes
  useEffect(() => {
    if (editingBrand) {
      form.reset({
        name: editingBrand.name,
        description: editingBrand.description,
      });
    } else {
      form.reset({
        name: "",
        description: "",
      });
    }
  }, [editingBrand, form]);

  const { data: brands = [], isLoading } = useQuery({
    queryKey: ["brands"],
    queryFn: BrandService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (data: FormData) => {
      // Ensure the data meets the CreateBrandRequest requirements
      return BrandService.create({
        name: data.name,
        description: data.description
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      toast.success("Brand created successfully");
      setIsOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create brand");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => {
      // Ensure the data meets the CreateBrandRequest requirements
      return BrandService.update(id, {
        name: data.name,
        description: data.description
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      toast.success("Brand updated successfully");
      setIsOpen(false);
      setEditingBrand(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update brand");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: BrandService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      toast.success("Brand deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete brand");
    },
  });

  function onSubmit(data: FormData) {
    if (editingBrand) {
      updateMutation.mutate({ id: editingBrand.id, data });
    } else {
      createMutation.mutate(data);
    }
  }

  function handleEdit(brand: Brand) {
    setEditingBrand(brand);
    setIsOpen(true);
  }

  function handleDelete(id: number) {
    if (confirm("Are you sure you want to delete this brand?")) {
      deleteMutation.mutate(id);
    }
  }

  function openDialog() {
    setEditingBrand(null);
    form.reset({
      name: "",
      description: "",
    });
    setIsOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Brands</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={openDialog} className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Add Brand
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingBrand ? "Edit Brand" : "Add New Brand"}</DialogTitle>
              <DialogDescription>
                {editingBrand 
                  ? "Update the brand details below"
                  : "Fill in the details for the new brand"
                }
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter brand name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter brand description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingBrand 
                      ? updateMutation.isPending ? "Updating..." : "Update Brand" 
                      : createMutation.isPending ? "Creating..." : "Add Brand"
                    }
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Brands</CardTitle>
          <CardDescription>
            View and manage all your product brands here
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">Loading brands...</div>
          ) : brands.length === 0 ? (
            <div className="flex h-[200px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
              <h3 className="text-lg font-medium">No brands found</h3>
              <p className="text-sm text-muted-foreground">
                Get started by creating your first brand
              </p>
              <Button 
                className="mt-4" 
                variant="outline" 
                onClick={openDialog}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Brand
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brands.map((brand) => (
                  <TableRow key={brand.id}>
                    <TableCell className="font-medium">{brand.name}</TableCell>
                    <TableCell>{brand.description}</TableCell>
                    <TableCell>{new Date(brand.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(brand)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(brand.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
