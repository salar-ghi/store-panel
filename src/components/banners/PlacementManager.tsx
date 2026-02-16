
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BannerService } from "@/services/banner-service";
import { BannerPlacement } from "@/types/banner";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2, Loader2, MapPin, LayoutGrid } from "lucide-react";

export function PlacementManager() {
  const queryClient = useQueryClient();
  const [editingPlacement, setEditingPlacement] = useState<BannerPlacement | null>(null);
  const [formData, setFormData] = useState({ name: "", code: "", recommendedSize: "" });
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: placements, isLoading } = useQuery({
    queryKey: ["banner-placements"],
    queryFn: BannerService.getAllPlacements,
  });

  const createMutation = useMutation({
    mutationFn: BannerService.createPlacement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banner-placements"] });
      toast.success("جایگاه با موفقیت ایجاد شد");
      resetForm();
    },
    onError: () => toast.error("خطا در ایجاد جایگاه"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => BannerService.updatePlacement(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banner-placements"] });
      toast.success("جایگاه با موفقیت بروزرسانی شد");
      resetForm();
    },
    onError: () => toast.error("خطا در بروزرسانی جایگاه"),
  });

  const deleteMutation = useMutation({
    mutationFn: BannerService.deletePlacement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banner-placements"] });
      toast.success("جایگاه حذف شد");
    },
    onError: () => toast.error("خطا در حذف جایگاه"),
  });

  const resetForm = () => {
    setFormData({ name: "", code: "", recommendedSize: "" });
    setEditingPlacement(null);
    setDialogOpen(false);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.code) {
      toast.error("نام و کد الزامی هستند");
      return;
    }
    if (editingPlacement) {
      updateMutation.mutate({ id: editingPlacement.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openEdit = (p: BannerPlacement) => {
    setEditingPlacement(p);
    setFormData({ name: p.name, code: p.code, recommendedSize: p.recommendedSize || "" });
    setDialogOpen(true);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">جایگاه‌های نمایش بنر</h3>
          <Badge variant="secondary" className="text-xs">{placements?.length || 0}</Badge>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openCreate} className="gap-1.5">
              <PlusCircle className="h-4 w-4" />
              جایگاه جدید
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>{editingPlacement ? "ویرایش جایگاه" : "ایجاد جایگاه جدید"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>نام جایگاه</Label>
                <Input
                  placeholder="مثال: صفحه اصلی - بالا"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>کد یکتا</Label>
                <Input
                  placeholder="مثال: homepage-top"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label>اندازه پیشنهادی (اختیاری)</Label>
                <Input
                  placeholder="مثال: 1920x400"
                  value={formData.recommendedSize}
                  onChange={(e) => setFormData({ ...formData, recommendedSize: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <DialogClose asChild>
                <Button variant="outline">انصراف</Button>
              </DialogClose>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                )}
                {editingPlacement ? "بروزرسانی" : "ایجاد"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !placements?.length ? (
        <div className="flex flex-col items-center py-12 text-center border-2 border-dashed border-border rounded-xl">
          <LayoutGrid className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="font-medium text-foreground">هنوز جایگاهی تعریف نشده</p>
          <p className="text-sm text-muted-foreground mt-1">ابتدا جایگاه‌های نمایش بنر را تعریف کنید</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-foreground">نام</TableHead>
                <TableHead className="text-foreground">کد</TableHead>
                <TableHead className="text-foreground">اندازه پیشنهادی</TableHead>
                <TableHead className="text-foreground">تعداد بنرها</TableHead>
                <TableHead className="text-left text-foreground">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {placements.map((p) => (
                <TableRow key={p.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded font-mono">{p.code}</code>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {p.recommendedSize || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{p.banners?.length || 0}</Badge>
                  </TableCell>
                  <TableCell className="text-left">
                    <div className="flex items-center gap-1 justify-end">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => deleteMutation.mutate(p.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
