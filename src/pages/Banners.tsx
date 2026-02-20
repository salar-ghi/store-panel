
import { useQuery } from "@tanstack/react-query";
import { BannerService } from "@/services/banner-service";
import { Card, CardContent } from "@/components/ui/card";
import { BannerHeader } from "@/components/banners/BannerHeader";
import { BannerTable } from "@/components/banners/BannerTable";

export default function Banners() {
  const { data: banners, isLoading, refetch } = useQuery({
    queryKey: ["banners"],
    queryFn: BannerService.getAllBanners,
  });

  return (
    <div className="space-y-6 py-6">
      <BannerHeader onBannerAdded={() => refetch()} />
      <Card className="border shadow-sm">
        <CardContent className="pt-6">
          <BannerTable
            banners={banners || []}
            isLoading={isLoading}
            onRefresh={() => refetch()}
          />
        </CardContent>
      </Card>
    </div>
  );
}
