
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
  { value: "red", label: "Red", class: "bg-red-500" },
  { value: "blue", label: "Blue", class: "bg-blue-500" },
  { value: "green", label: "Green", class: "bg-green-500" },
  { value: "yellow", label: "Yellow", class: "bg-yellow-500" },
  { value: "purple", label: "Purple", class: "bg-purple-500" },
  { value: "pink", label: "Pink", class: "bg-pink-500" },
  { value: "indigo", label: "Indigo", class: "bg-indigo-500" },
  { value: "cyan", label: "Cyan", class: "bg-cyan-500" },
  { value: "orange", label: "Orange", class: "bg-orange-500" },
  { value: "teal", label: "Teal", class: "bg-teal-500" },
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
      await TagService.createTag(data);
      toast.success("Tag created successfully!");
      form.reset();
      onTagAdded();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create tag");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedColor = form.watch("color");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                <Tag className="h-4 w-4 mr-1 text-muted-foreground" />
                Tag Name
              </FormLabel>
              <FormControl>
                <Input placeholder="Enter tag name" {...field} />
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
                <Textarea 
                  placeholder="Enter tag description (optional)" 
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
                <Palette className="h-4 w-4 mr-1 text-muted-foreground" />
                Color
              </FormLabel>
              <FormDescription>
                Choose a color for this tag
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

        <div className="pt-4">
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Creating..." : "Create Tag"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
