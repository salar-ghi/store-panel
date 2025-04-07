
import { useQuery } from "@tanstack/react-query";
import { UserService } from "@/services/user-service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface UserDetailsDialogProps {
  userId: string;
  open: boolean;
  onClose: () => void;
}

export function UserDetailsDialog({ userId, open, onClose }: UserDetailsDialogProps) {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => UserService.getUserById(userId),
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-destructive text-center py-4">
            Failed to load user details
          </div>
        ) : user ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Username</p>
                <p className="text-sm font-semibold">{user.username}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Role</p>
                <Badge variant="outline">{user.role}</Badge>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-sm">{user.email || "N/A"}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p className="text-sm">{user.phoneNumber}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">User ID</p>
                <p className="text-sm text-muted-foreground">{user.id}</p>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
