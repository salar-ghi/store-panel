import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CreateBrandRequest, Brand } from "@/types/brand";
import { useEffect, useState } from "react";
import { Upload, ImageIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { uploadImage } from "@/lib/image-upload";
import { toast } from "@/components/ui/use-toast";

const brandFormSchema = z.object({
  name: z.string().min(2, { message: "نام برند باید حداقل ۲ کاراکتر باشد" }),
  description: z.string().min(10, { message: "توضیحات باید حداقل ۱۰ کاراکتر باشد" }),
  logo: z.string().optional(),
});

export type BrandFormValues = z.infer<typeof brandFormSchema>;

export interface BrandFormProps {
  editingBrand: Brand | null;
  onSuccess: () => void;
}

export function BrandForm({ editingBrand, onSuccess }: BrandFormProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: {
      name: editingBrand?.name || "",
      description: editingBrand?.description || "",
      logo: editingBrand?.logo || "",
    },
  });

  useEffect(() => {
    if (editingBrand) {
      form.reset({
        name: editingBrand.name,
        description: editingBrand.description,
        logo: editingBrand.logo || "",
      });
      if (editingBrand.logo) {
        setLogoPreview(editingBrand.logo);
      }
    }
  }, [editingBrand, form]);

  const handleSubmit = async (data: BrandFormValues) => {
    try {
      setIsUploading(true);
      
      // Upload logo if one was selected
      let logoPath = data.logo;
      if (logoFile) {
        try {
          logoPath = await uploadImage(logoFile, 'brand');
        } catch (error) {
          console.error("Error uploading logo:", error);
          toast({
            title: "خطا در آپلود لوگو",
            description: "لطفا دوباره تلاش کنید",
            variant: "destructive",
          });
          setIsUploading(false);
          return;
        }
      }
      
      const brandRequest: CreateBrandRequest = {
        name: data.name,
        description: data.description,
        logo: logoPath,
      };
      
      // Handle create or update based on whether we have an editingBrand
      if (editingBrand) {
        await BrandService.update(editingBrand.id, brandRequest);
        toast({
          title: "برند با موفقیت ویرایش شد",
          variant: "default",
        });
      } else {
        await BrandService.create(brandRequest);
        toast({
          title: "برند با موفقیت ایجاد شد",
          variant: "default",
        });
      }
      
      onSuccess();
      form.reset();
      setLogoFile(null);
      setLogoPreview(null);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "خطا در ثبت اطلاعات",
        description: "لطفا دوباره تلاش کنید",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        form.setValue("logo", result); // This will be replaced with the server path after upload
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" dir="rtl">
        <FormField
          control={form.control}
          name="logo"
          render={({ field }) => (
            <FormItem className="flex flex-col items-center">
              <FormLabel className="self-start">لوگوی برند</FormLabel>
              <FormControl>
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-24 w-24 border-2 border-dashed border-gray-300 p-1">
                    {logoPreview ? (
                      <AvatarImage src={logoPreview} alt="Brand logo" />
                    ) : (
                      <AvatarFallback className="bg-gray-100">
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <input
                    type="file"
                    id="brand-logo"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("brand-logo")?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {logoPreview ? "تغییر لوگو" : "انتخاب لوگو"}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>نام برند</FormLabel>
              <FormControl>
                <Input placeholder="مثال: سامسونگ" {...field} />
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
              <FormLabel>توضیحات</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="توضیحات برند را وارد کنید" 
                  {...field} 
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <DialogFooter>          
          <Button type="submit" className="mx-2" disabled={isUploading}>
            {isUploading ? "در حال آپلود..." : editingBrand ? "ویرایش برند" : "ایجاد برند"}
          </Button>

          <Button 
            type="button" 
            variant="outline" 
            onClick={onSuccess}
          >
            انصراف
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

// Import here at the bottom to avoid circular dependencies
import { BrandService } from "@/services/brand-service";
