
import { useQuery } from "@tanstack/react-query";
import { BannerService } from "@/services/banner-service";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BannerHeader } from "@/components/banners/BannerHeader";
import { BannerTable } from "@/components/banners/BannerTable";
import { PlacementManager } from "@/components/banners/PlacementManager";
import { Image, MapPin } from "lucide-react";

export default function Banners() {
  const { data: banners, isLoading, refetch } = useQuery({
    queryKey: ["banners"],
    queryFn: BannerService.getAllBanners,
  });

  return (
    <div className="space-y-6 py-6">
      <BannerHeader onBannerAdded={() => refetch()} />

      <Tabs defaultValue="banners" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="banners" className="gap-2">
            <Image className="h-4 w-4" />
            بنرها
          </TabsTrigger>
          <TabsTrigger value="placements" className="gap-2">
            <MapPin className="h-4 w-4" />
            جایگاه‌ها
          </TabsTrigger>
        </TabsList>

        <TabsContent value="banners" className="mt-4">
          <Card className="border shadow-sm">
            <CardContent className="pt-6">
              <BannerTable
                banners={banners || []}
                isLoading={isLoading}
                onRefresh={() => refetch()}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="placements" className="mt-4">
          <Card className="border shadow-sm">
            <CardContent className="pt-6">
              <PlacementManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
