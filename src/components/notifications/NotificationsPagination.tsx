
import { ReactElement } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";

type NotificationsPaginationProps = {
  filteredCount: number;
  totalCount: number;
};

export const NotificationsPagination = ({ 
  filteredCount,
  totalCount 
}: NotificationsPaginationProps): ReactElement => {
  if (filteredCount === 0) return null;
  
  return (
    <div className="mt-4 flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        نمایش {filteredCount} از {totalCount} مورد
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" disabled>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" className="h-8 w-8">
          1
        </Button>
        <Button variant="outline" size="icon" disabled>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
