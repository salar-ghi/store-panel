
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Promotions() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Promotions</h2>
        <Button className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Create Promotion
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search promotions..."
            className="w-full pl-8"
          />
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Summer Sale</CardTitle>
                <CardDescription>20% off selected products</CardDescription>
              </div>
              <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/20">Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Code:</span>
                <span className="font-medium">SUMMER20</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Validity:</span>
                <span className="font-medium">Jun 1 - Aug 31, 2023</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Orders:</span>
                <span className="font-medium">132</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">
              Edit Promotion
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Welcome Discount</CardTitle>
                <CardDescription>10% off first order</CardDescription>
              </div>
              <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/20">Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Code:</span>
                <span className="font-medium">WELCOME10</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Validity:</span>
                <span className="font-medium">Ongoing</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Orders:</span>
                <span className="font-medium">287</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">
              Edit Promotion
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Flash Sale</CardTitle>
                <CardDescription>30% off electronics</CardDescription>
              </div>
              <Badge className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20">Expired</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Code:</span>
                <span className="font-medium">FLASH30</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Validity:</span>
                <span className="font-medium">Mar 15 - Mar 17, 2023</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Orders:</span>
                <span className="font-medium">96</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">
              Edit Promotion
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
