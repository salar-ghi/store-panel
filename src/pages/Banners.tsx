
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BannerService } from "@/services/banner-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { BannerHeader } from "@/components/banners/BannerHeader";
import { BannerTable } from "@/components/banners/BannerTable";

export default function Banners() {
  const [selectedBannerId, setSelectedBannerId] = useState<string | null>(null);

  const { data: banners, isLoading, error, refetch } = useQuery({
    queryKey: ['banners'],
    queryFn: BannerService.getAllBanners,
  });

  const handleBannerAdded = () => {
    refetch();
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await BannerService.toggleBannerStatus(id, !currentStatus);
      toast.success(`بنر ${!currentStatus ? 'فعال' : 'غیرفعال'} شد`);
      refetch();
    } catch (error) {
      toast.error("خطا در تغییر وضعیت بنر");
    }
  };

  return (
    <div className="space-y-6 py-6">
      <BannerHeader onBannerAdded={handleBannerAdded} />

      <Card className="border shadow-sm bg-black text-white">
        <CardHeader>
          <CardTitle>لیست بنرها</CardTitle>
        </CardHeader>
        <CardContent>
          <BannerTable 
            banners={banners || []} 
            isLoading={isLoading} 
            onToggleStatus={handleToggleStatus} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
