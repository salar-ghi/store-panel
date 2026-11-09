import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCreateBranch } from "@/hooks/use-finance";
import { useToast } from "@/hooks/use-toast";
import { Branch } from "@/types/finance";

interface BranchFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BranchFormDialog({ open, onOpenChange }: BranchFormDialogProps) {
  const { toast } = useToast();
  const createBranchMutation = useCreateBranch();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState<Branch["type"]>("supermarket");
  const [city, setCity] = useState("");
  const [manager, setManager] = useState("");
  const [isActive, setIsActive] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      toast({ title: "لطفاً نام و کد شعبه را وارد نمایید", variant: "destructive" });
      return;
    }

    try {
      await createBranchMutation.mutateAsync({
        name: name.trim(),
        code: code.trim(),
        type,
        city: city.trim() || undefined,
        manager: manager.trim() || undefined,
        isActive,
      });
      toast({ title: "شعبه جدید با موفقیت ایجاد شد" });
      onOpenChange(false);
      setName("");
      setCode("");
      setCity("");
      setManager("");
      setIsActive(true);
    } catch {
      toast({ title: "خطا در ثبت شعبه جدید", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-md">
        <DialogHeader>
          <DialogTitle>افزودن شعبه جدید</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="branch-name">نام شعبه <span className="text-destructive">*</span></Label>
            <Input
              id="branch-name"
              placeholder="مثال: شعبه مرکزی ولیعصر"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="branch-code">کد شعبه <span className="text-destructive">*</span></Label>
              <Input
                id="branch-code"
                placeholder="BR-101"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>نوع شعبه</Label>
              <Select value={type} onValueChange={(v) => setType(v as Branch["type"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supermarket">سوپرمارکت</SelectItem>
                  <SelectItem value="chain_store">فروشگاه زنجیره‌ای</SelectItem>
                  <SelectItem value="online">فروشگاه آنلاین</SelectItem>
                  <SelectItem value="warehouse">انبار مرکزی</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="branch-city">شهر</Label>
              <Input
                id="branch-city"
                placeholder="تهران"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="branch-manager">سرپرست / مدیر شعبه</Label>
              <Input
                id="branch-manager"
                placeholder="نام مدیر"
                value={manager}
                onChange={(e) => setManager(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
            <span className="text-sm">وضعیت فعالیت شعبه</span>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              انصراف
            </Button>
            <Button type="submit" disabled={createBranchMutation.isPending}>
              {createBranchMutation.isPending ? "در حال ثبت..." : "ثبت شعبه"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
