
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Customers() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
          <p className="text-muted-foreground">Manage your customer base</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
              <DialogDescription>
                Enter the customer details below to create a new customer record.
              </DialogDescription>
            </DialogHeader>
            {/* Customer form would go here */}
            <div className="space-y-4 py-4">
              <p className="text-center text-muted-foreground">
                Customer creation form would be implemented here
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle>Customer Database</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 pb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search customers..."
                className="w-full pl-8"
              />
            </div>
          </div>
          
          <div className="flex h-[50vh] items-center justify-center rounded-md border border-dashed bg-muted/20">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium">No customers found</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Get started by adding your first customer
              </p>
              <Button 
                onClick={() => setIsDialogOpen(true)} 
                variant="outline" 
                className="mt-2"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
