
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft,
  Package,
  Mail,
  Phone,
  Globe,
  MapPin,
  CheckCircle,
  AlertCircle,
  Calendar
} from "lucide-react";

import { SupplierService } from "@/services/supplier-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

export default function SupplierDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const supplierId = parseInt(id || "0");

  const { data: supplier, isLoading: isLoadingSupplier } = useQuery({
    queryKey: ["supplier", supplierId],
    queryFn: () => SupplierService.getById(supplierId),
    enabled: !!supplierId,
  });

  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["supplierProducts", supplierId],
    queryFn: () => SupplierService.getSupplierProducts(supplierId),
    enabled: !!supplierId,
  });

  if (isLoadingSupplier) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <p className="text-muted-foreground">در حال بارگذاری اطلاعات تامین‌کننده...</p>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] gap-4">
        <p className="text-muted-foreground">تامین‌کننده مورد نظر یافت نشد</p>
        <Button onClick={() => navigate("/suppliers")}>
          بازگشت به لیست تامین‌کنندگان
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => navigate("/suppliers")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">{supplier.name}</h2>
        {supplier.isApproved !== false ? (
          <Badge variant="outline" className="bg-green-900/20 text-green-500 border-green-500/50">
            فعال
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-yellow-900/20 text-yellow-500 border-yellow-500/50">
            غیرفعال
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>اطلاعات تماس</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {supplier.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{supplier.email}</span>
                </div>
              )}
              
              {supplier.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{supplier.phone}</span>
                </div>
              )}
              
              {supplier.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={supplier.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {supplier.website}
                  </a>
                </div>
              )}
              
              {supplier.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{supplier.address}</span>
                </div>
              )}
              
              {supplier.joinDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>تاریخ عضویت: {format(new Date(supplier.joinDate), 'yyyy/MM/dd')}</span>
                </div>
              )}
            </div>

            {supplier.description && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-medium mb-2">توضیحات</h3>
                  <p className="text-sm text-muted-foreground">{supplier.description}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>اطلاعات تکمیلی</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">وضعیت</span>
              <div className="flex items-center gap-2">
                {supplier.isApproved !== false ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-green-500">فعال</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <span className="text-yellow-500">غیرفعال</span>
                  </>
                )}
              </div>
            </div>
            
            {supplier.rating !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">امتیاز</span>
                <span className="font-semibold">{supplier.rating}/5</span>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">کد تامین‌کننده</span>
              <span className="font-semibold">{supplier.id}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>محصولات</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingProducts ? (
            <div className="flex justify-center py-8">
              <p className="text-muted-foreground">در حال بارگذاری محصولات...</p>
            </div>
          ) : products && products.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>کد محصول</TableHead>
                  <TableHead>نام محصول</TableHead>
                  <TableHead>قیمت</TableHead>
                  <TableHead>موجودی</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.id}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.price ? `${product.price.toLocaleString()} تومان` : '-'}</TableCell>
                    <TableCell>{product.stock || 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <Package className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">این تامین‌کننده محصولی ندارد</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
