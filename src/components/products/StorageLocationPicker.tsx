import { UseFormReturn } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Layers, Boxes } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StorageService } from "@/services/storage-service";
import { StorageSpace, StorageSpaceTypeLabels } from "@/types/storage";

interface StorageLocationPickerProps {
  form: UseFormReturn<any>;
  spaces: StorageSpace[];
}

export function StorageLocationPicker({ form, spaces }: StorageLocationPickerProps) {
  const spaceId = Number(form.watch("stock.spaceId") ?? 0);
  const zoneId = Number(form.watch("stock.zoneId") ?? 0);
  const shelfId = Number(form.watch("stock.shelfId") ?? 0);

  const { data: zones = [] } = useQuery({
    queryKey: ["storage", "zones", spaceId],
    queryFn: () => StorageService.getZones(spaceId || undefined),
    enabled: spaceId > 0,
  });

  const { data: shelves = [] } = useQuery({
    queryKey: ["storage", "shelves", spaceId, zoneId],
    queryFn: () =>
      StorageService.getShelves({
        spaceId: spaceId || undefined,
        zoneId: zoneId || undefined,
      }),
    enabled: spaceId > 0,
  });

  const selectedSpace = spaces.find((s) => s.id === spaceId);
  const selectedShelf = shelves.find((s) => s.id === shelfId);

  const shelfUsagePct = selectedShelf
    ? Math.min(100, Math.round((selectedShelf.used / Math.max(1, selectedShelf.capacity)) * 100))
    : 0;

  return (
    <Card className="border-r-4 border-r-primary/70 shadow-sm">
      <CardHeader className="py-4">
        <CardTitle className="text-base flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
            ۲
          </span>
          محل نگهداری
        </CardTitle>
        <CardDescription>
          فضای ذخیره‌سازی، بخش (اختیاری) و قفسه دقیق محصول را انتخاب کنید
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Space */}
          <FormField
            control={form.control}
            name="stock.spaceId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  فضای ذخیره‌سازی
                </FormLabel>
                <Select
                  onValueChange={(v) => {
                    field.onChange(Number(v));
                    form.setValue("stock.zoneId", undefined);
                    form.setValue("stock.shelfId", 0);
                  }}
                  value={field.value ? field.value.toString() : undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب فضا" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {spaces.length === 0 && (
                      <div className="px-3 py-2 text-xs text-muted-foreground">
                        ابتدا از بخش انبار، فضا تعریف کنید
                      </div>
                    )}
                    {spaces.map((sp) => (
                      <SelectItem key={sp.id} value={sp.id.toString()}>
                        <div className="flex flex-col text-right">
                          <span className="font-medium">{sp.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {StorageSpaceTypeLabels[sp.type]}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Zone (optional) */}
          <FormField
            control={form.control}
            name="stock.zoneId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-primary" />
                  بخش / راهرو
                  <span className="text-xs text-muted-foreground font-normal">(اختیاری)</span>
                </FormLabel>
                <Select
                  onValueChange={(v) => {
                    field.onChange(v === "_none" ? undefined : Number(v));
                    form.setValue("stock.shelfId", 0);
                  }}
                  value={field.value ? field.value.toString() : "_none"}
                  disabled={!spaceId}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="بدون بخش" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="_none">— بدون بخش —</SelectItem>
                    {zones.map((z) => (
                      <SelectItem key={z.id} value={z.id.toString()}>
                        {z.name} {z.code && <span className="text-muted-foreground">({z.code})</span>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>برای فضاهای بزرگ مثل انبار آنلاین</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Shelf */}
          <FormField
            control={form.control}
            name="stock.shelfId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5">
                  <Boxes className="h-3.5 w-3.5 text-primary" />
                  قفسه
                </FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(Number(v))}
                  value={field.value ? field.value.toString() : undefined}
                  disabled={!spaceId}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب قفسه" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {shelves.length === 0 && (
                      <div className="px-3 py-2 text-xs text-muted-foreground">
                        قفسه‌ای در این فضا تعریف نشده
                      </div>
                    )}
                    {shelves.map((sh) => {
                      const pct = Math.min(
                        100,
                        Math.round((sh.used / Math.max(1, sh.capacity)) * 100)
                      );
                      return (
                        <SelectItem key={sh.id} value={sh.id.toString()}>
                          <div className="flex flex-col text-right">
                            <span className="font-medium">
                              {sh.code} {sh.name && <span className="text-muted-foreground">— {sh.name}</span>}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ظرفیت: {sh.used}/{sh.capacity} ({pct}%)
                            </span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Live preview of selected shelf */}
        {selectedSpace && selectedShelf && (
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="secondary" className="gap-1">
                  <MapPin className="h-3 w-3" />
                  {selectedSpace.name}
                </Badge>
                {zoneId > 0 && (
                  <>
                    <span className="text-muted-foreground">/</span>
                    <Badge variant="outline" className="gap-1">
                      <Layers className="h-3 w-3" />
                      {zones.find((z) => z.id === zoneId)?.name}
                    </Badge>
                  </>
                )}
                <span className="text-muted-foreground">/</span>
                <Badge className="gap-1">
                  <Boxes className="h-3 w-3" />
                  {selectedShelf.code}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                ظرفیت قفسه: {selectedShelf.used} از {selectedShelf.capacity}
              </span>
            </div>
            <Progress value={shelfUsagePct} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
