
import { useState } from "react";
import { UsersHeader } from "@/components/users/UsersHeader";
import { UsersTabContent, RolesTabContent } from "@/components/users/UsersTabContent";
import { UserDetailsDialog } from "@/components/users/UserDetailsDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { UserService } from "@/services/user-service";

export default function Users() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);
  
  const { refetch: refetchUsers } = useQuery({
    queryKey: ['users', refreshCounter],
    queryFn: UserService.getAllUsers,
    enabled: false // We'll manually trigger this when needed
  });
  
  const { refetch: refetchRoles } = useQuery({
    queryKey: ['roles', refreshCounter],
    queryFn: UserService.getAllRoles,
    enabled: false // We'll manually trigger this when needed
  });

  const handleUserAdded = () => {
    refetchUsers();
    setRefreshCounter(prev => prev + 1);
  };

  const handleRoleAdded = () => {
    refetchRoles();
    setRefreshCounter(prev => prev + 1);
  };

  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId);
  };

  // Close dialog handler
  const handleCloseDialog = () => {
    setSelectedUserId(null);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <UsersHeader 
        onUserAdded={handleUserAdded} 
        onRoleAdded={handleRoleAdded}
      />

      <Tabs defaultValue="users" className="w-full" dir="rtl">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="users">لیست کاربران</TabsTrigger>
          <TabsTrigger value="roles">مدیریت نقش‌ها</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" dir="rtl">
          <UsersTabContent onUserClick={handleUserClick} />
        </TabsContent>
        
        <TabsContent value="roles" dir="rtl">
          <RolesTabContent onRoleAdded={handleRoleAdded} />
        </TabsContent>
      </Tabs>

      {selectedUserId && (
        <UserDetailsDialog 
          userId={selectedUserId} 
          open={!!selectedUserId}
          onClose={handleCloseDialog} 
        />
      )}
    </div>
  );
}
