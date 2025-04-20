import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TagService } from "@/services/tag-service";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tag, Palette } from "lucide-react";

const COLORS = [
  { value: "red", label: "قرمز", class: "bg-red-500" },
  { value: "blue", label: "آبی", class: "bg-blue-500" },
  { value: "green", label: "سبز", class: "bg-green-500" },
  { value: "yellow", label: "زرد", class: "bg-yellow-500" },
  { value: "purple", label: "بنفش", class: "bg-purple-500" },
  { value: "pink", label: "صورتی", class: "bg-pink-500" },
  { value: "indigo", label: "نیلی", class: "bg-indigo-500" },
  { value: "cyan", label: "فیروزه‌ای", class: "bg-cyan-500" },
  { value: "orange", label: "نارنجی", class: "bg-orange-500" },
  { value: "teal", label: "سبز آبی", class: "bg-teal-500" },
];

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  color: z.string().optional(),
});

interface TagFormProps {
  onTagAdded: () => void;
  initialData?: z.infer<typeof formSchema>;
}

export function TagForm({ onTagAdded, initialData }: TagFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      color: "blue",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const tagData = {
        name: data.name,
        description: data.description,
        color: data.color
      };
      await TagService.createTag(tagData);
      toast.success("برچسب ایجاد شد!");
      form.reset();
      onTagAdded();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "برچسب ایجاد نشد");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedColor = form.watch("color");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} dir="rtl" className="space-y-6 pt-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                <Tag className="h-4 w-4 ml-1 text-muted-foreground" />
                نام برچسب
              </FormLabel>
              <FormControl>
                <Input placeholder="نام برچسب را وارد کنید" {...field} />
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
                  placeholder="توضیحات برچسب را وارد کنید (اختیاری)" 
                  className="resize-none min-h-[80px]"
                  {...field} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                <Palette className="h-4 w-4 ml-1 text-muted-foreground" />
                رنگ
              </FormLabel>
              <FormDescription>
                یک رنگ برای این برچسب انتخاب کنید
              </FormDescription>
              <div className="grid grid-cols-5 gap-2 pt-2">
                {COLORS.map((color) => (
                  <div 
                    key={color.value}
                    className={`
                      h-10 rounded-md flex items-center justify-center cursor-pointer
                      ${color.class} transition-all
                      ${selectedColor === color.value ? 'ring-2 ring-offset-2 ring-black' : 'opacity-60 hover:opacity-100'}
                    `}
                    onClick={() => form.setValue("color", color.value)}
                  >
                    {selectedColor === color.value && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
          {isSubmitting ? "در حال ایجاد..." : "ایجاد برچسب"}
        </Button>
      </form>
    </Form>
  );
}
