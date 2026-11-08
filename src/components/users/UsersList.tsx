import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, ChevronRight, ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface UsersListProps {
  onUserClick: (userId: string) => void;
}

export function UsersList({ onUserClick }: UsersListProps) {
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ['users', pageIndex, pageSize, appliedSearch],
    queryFn: () => UserService.getPagedUsers({ pageIndex, pageSize, search: appliedSearch }),
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPageIndex(1);
    setAppliedSearch(searchInput);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive text-center py-8">
        خطا در بارگذاری کاربران
      </div>
    );
  }

  const items = data?.items || [];

  return (
    <div className="space-y-4" dir="rtl">
      <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="جستجو بر اساس نام کاربری..."
            className="pr-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <Button type="submit" variant="secondary" size="sm">جستجو</Button>
      </form>

      <div className="border rounded-lg overflow-hidden">
        <Table dir="rtl">
          <TableHeader>
            <TableRow>
              <TableHead>نام کاربری</TableHead>
              <TableHead>ایمیل</TableHead>
              <TableHead>شماره تلفن</TableHead>
              <TableHead>نقش‌ها</TableHead>
              <TableHead className="">مدیر</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length > 0 ? (
              items.map((user) => (
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

        {data && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 border-t bg-muted/20 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>تعداد در صفحه:</span>
              <Select
                value={String(pageSize)}
                onValueChange={(val) => {
                  setPageSize(Number(val));
                  setPageIndex(1);
                }}
              >
                <SelectTrigger className="w-16 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">۵</SelectItem>
                  <SelectItem value="10">۱۰</SelectItem>
                  <SelectItem value="25">۲۵</SelectItem>
                </SelectContent>
              </Select>
              <span>
                صفحه {data.pageIndex.toLocaleString("fa-IR")} از {data.totalPages.toLocaleString("fa-IR")} ({data.totalCount.toLocaleString("fa-IR")} کاربر)
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1"
                disabled={!data.hasPreviousPage}
                onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
              >
                <ChevronRight className="h-3.5 w-3.5" />
                قبلی
              </Button>
              <span className="px-2 font-mono">{data.pageIndex}</span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1"
                disabled={!data.hasNextPage}
                onClick={() => setPageIndex((p) => Math.min(data.totalPages, p + 1))}
              >
                بعدی
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
