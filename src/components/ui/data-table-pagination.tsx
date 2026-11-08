import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatPersianNumber } from '@/lib/format';

interface DataTablePaginationProps {
  pageIndex: number; // 1-based index
  pageSize: number;
  totalCount: number;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
  isLoading?: boolean;
}

export function DataTablePagination({
  pageIndex,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 30, 50],
  isLoading = false,
}: DataTablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(Math.max(1, pageIndex), totalPages);

  const startRecord = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-2 text-sm text-muted-foreground select-none" dir="rtl">
      <div className="flex items-center gap-2 text-xs sm:text-sm">
        <span>نمایش</span>
        <span className="font-medium text-foreground">{formatPersianNumber(startRecord)}</span>
        <span>تا</span>
        <span className="font-medium text-foreground">{formatPersianNumber(endRecord)}</span>
        <span>از مجموع</span>
        <span className="font-medium text-foreground">{formatPersianNumber(totalCount)}</span>
        <span>مورد</span>
      </div>

      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm whitespace-nowrap">تعداد در صفحه:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              onPageSizeChange(Number(value));
            }}
            disabled={isLoading}
          >
            <SelectTrigger className="h-8 w-[70px] text-xs">
              <SelectValue placeholder={String(pageSize)} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)} className="text-xs">
                  {formatPersianNumber(size)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center text-xs sm:text-sm">
          <span>صفحه {formatPersianNumber(currentPage)} از {formatPersianNumber(totalPages)}</span>
        </div>

        <div className="flex items-center gap-1">
          {/* In RTL: Right arrow goes backwards (previous), Left arrow goes forwards (next) */}
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(1)}
            disabled={currentPage <= 1 || isLoading}
            title="صفحه اول"
          >
            <span className="sr-only">صفحه اول</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isLoading}
            title="صفحه قبلی"
          >
            <span className="sr-only">صفحه قبلی</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || isLoading}
            title="صفحه بعدی"
          >
            <span className="sr-only">صفحه بعدی</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages || isLoading}
            title="صفحه آخر"
          >
            <span className="sr-only">صفحه آخر</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
