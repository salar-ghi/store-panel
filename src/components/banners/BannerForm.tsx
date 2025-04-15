
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BannerService } from "@/services/banner-service";
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
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Image, Link2, LayoutTemplate, Megaphone, CircleHelp } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { BannerSize, BannerTargetLocation, BannerType } from "@/types/banner";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  imageUrl: z.string().url("Please enter a valid image URL"),
  linkUrl: z.string().url("Please enter a valid URL").optional(),
  targetLocation: z.string() as z.ZodType<BannerTargetLocation>,
  size: z.string() as z.ZodType<BannerSize>,
  type: z.string() as z.ZodType<BannerType>,
  active: z.boolean().default(true),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

interface BannerFormProps {
  onBannerAdded: () => void;
  initialData?: z.infer<typeof formSchema>;
}

export function BannerForm({ onBannerAdded, initialData }: BannerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      imageUrl: "",
      linkUrl: "",
      targetLocation: "homepage",
      size: "medium",
      type: "promotional",
      active: true,
      startDate: undefined,
      endDate: undefined,
    },
  });

  const handleImageUrlChange = (url: string) => {
    if (url && url.startsWith("http")) {
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await BannerService.createBanner(data);
      toast.success("Banner created successfully!");
      form.reset();
      setImagePreview(null);
      onBannerAdded();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create banner");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banner Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter banner title" {...field} />
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
                      placeholder="Enter banner description (optional)" 
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
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <Image className="h-4 w-4 mr-1 text-muted-foreground" />
                    Image URL
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com/banner-image.jpg" 
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleImageUrlChange(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="linkUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <Link2 className="h-4 w-4 mr-1 text-muted-foreground" />
                    Link URL (optional)
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com/landing-page" 
                      {...field}
                      value={field.value || ""} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            {imagePreview && (
              <div className="rounded-lg overflow-hidden border bg-background aspect-video relative">
                <img 
                  src={imagePreview} 
                  alt="Banner preview" 
                  className="w-full h-full object-cover"
                  onError={() => setImagePreview(null)} 
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                  Banner Preview
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="targetLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <LayoutTemplate className="h-4 w-4 mr-1 text-muted-foreground" />
                    Display Location
                  </FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select where to display the banner" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="homepage">Homepage</SelectItem>
                      <SelectItem value="product-list">Product Listing</SelectItem>
                      <SelectItem value="category-page">Category Pages</SelectItem>
                      <SelectItem value="checkout">Checkout</SelectItem>
                      <SelectItem value="all-pages">All Pages</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banner Size</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select banner size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="full-width">Full Width</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <Megaphone className="h-4 w-4 mr-1 text-muted-foreground" />
                    Banner Type
                  </FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select banner type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="promotional">Promotional</SelectItem>
                      <SelectItem value="informational">Informational</SelectItem>
                      <SelectItem value="seasonal">Seasonal</SelectItem>
                      <SelectItem value="featured-product">Featured Product</SelectItem>
                      <SelectItem value="category-highlight">Category Highlight</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          disabled={(date) => {
                            const startDate = form.getValues("startDate");
                            return startDate ? date < startDate : false;
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Active Status</FormLabel>
                    <FormDescription>
                      Make this banner visible on the site
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Creating..." : "Create Banner"}
        </Button>
      </form>
    </Form>
  );
}
