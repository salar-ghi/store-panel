
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserService } from "@/services/user-service";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowUpDown } from "lucide-react";
import { DataTablePagination } from "@/components/ui/data-table-pagination";

interface UsersListProps {
  onUserClick: (userId: string) => void;
}

export function UsersList({ onUserClick }: UsersListProps) {
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("username_asc");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPageIndex(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['users', 'paged', pageIndex, pageSize, debouncedSearch, sortBy],
    queryFn: () => UserService.getPagedUsers({
      pageIndex,
      pageSize,
      search: debouncedSearch.trim() || undefined,
      sortBy,
    }),
  });

  const users = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="جستجو بر اساس نام، نام کاربری یا ایمیل..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>

        <div className="w-full sm:w-48">
          <Select
            value={sortBy}
            onValueChange={(val) => {
              setSortBy(val);
              setPageIndex(1);
            }}
          >
            <SelectTrigger>
              <div className="flex items-center gap-1.5 truncate">
                <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="مرتب‌سازی" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="username_asc">نام کاربری (الف-ی)</SelectItem>
              <SelectItem value="username_desc">نام کاربری (ی-الف)</SelectItem>
              <SelectItem value="recent">جدیدترین کاربران</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table dir="rtl">
          <TableHeader>
            <TableRow>
              <TableHead>نام کاربری</TableHead>
              <TableHead>ایمیل</TableHead>
              <TableHead>شماره تلفن</TableHead>
              <TableHead>نقش‌ها</TableHead>
              <TableHead className="text-center">مدیر</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5} className="p-4">
                    <Skeleton className="h-7 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="text-destructive text-center py-8">
                  خطا در بارگذاری کاربران
                </TableCell>
              </TableRow>
            ) : users.length > 0 ? (
              users.map((user) => (
                <TableRow
                  key={user.id}
                  className="cursor-pointer hover:bg-muted/60"
                  onClick={() => onUserClick(user.id)}
                >
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.email || "ندارد"}</TableCell>
                  <TableCell>{user.phoneNumber}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles && user.roles.length > 0 ? (
                        user.roles.map((role, index) => (
                          <Badge key={index} variant="outline" className="ml-1">
                            {role}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground">بدون نقش</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {user.isAdmin && (
                      <Badge variant="default" className="bg-purple-500">مدیر</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  کاربری یافت نشد
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination
        pageIndex={pageIndex}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={setPageIndex}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPageIndex(1);
        }}
        isLoading={isLoading}
      />
    </div>
  );
}
