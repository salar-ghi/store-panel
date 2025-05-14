
import { useState } from "react";
import { UsersHeader } from "@/components/users/UsersHeader";
import { UsersTabContent, RolesTabContent } from "@/components/users/UsersTabContent";
import { UserDetailsDialog } from "@/components/users/UserDetailsDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Users() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const handleUserAdded = () => {
    // Refetch users data after a user is added
  };

  const handleRoleAdded = () => {
    // Refetch roles data after a role is added
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
        
        <TabsContent value="roles">
          <RolesTabContent onRoleAdded={handleRoleAdded} />
        </TabsContent>
      </Tabs>

      {selectedUserId && (
        <UserDetailsDialog 
          userId={selectedUserId} 
          open={true}
          onClose={handleCloseDialog} 
        />
      )}
    </div>
  );
}
