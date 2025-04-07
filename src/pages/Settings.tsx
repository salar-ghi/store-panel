
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
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function Settings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>
      
      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>
                Update your store details and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="store-name">Store Name</Label>
                <Input id="store-name" defaultValue="My Awesome Store" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="store-email">Email Address</Label>
                <Input id="store-email" defaultValue="contact@myawesomestore.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="store-currency">Currency</Label>
                <Select defaultValue="usd">
                  <SelectTrigger id="store-currency">
                    <SelectValue placeholder="Select a currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD ($)</SelectItem>
                    <SelectItem value="eur">EUR (€)</SelectItem>
                    <SelectItem value="gbp">GBP (£)</SelectItem>
                    <SelectItem value="jpy">JPY (¥)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="store-timezone">Timezone</Label>
                <Select defaultValue="est">
                  <SelectTrigger id="store-timezone">
                    <SelectValue placeholder="Select a timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="est">Eastern Time (ET)</SelectItem>
                    <SelectItem value="cst">Central Time (CT)</SelectItem>
                    <SelectItem value="mst">Mountain Time (MT)</SelectItem>
                    <SelectItem value="pst">Pacific Time (PT)</SelectItem>
                    <SelectItem value="utc">Coordinated Universal Time (UTC)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Customize when and how you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-2">
                <Checkbox id="notify-orders" defaultChecked />
                <div className="grid gap-1.5">
                  <Label
                    htmlFor="notify-orders"
                    className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    New Orders
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications when new orders are placed.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox id="notify-products" defaultChecked />
                <div className="grid gap-1.5">
                  <Label
                    htmlFor="notify-products"
                    className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Low Stock
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications when products are low in stock.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox id="notify-reviews" />
                <div className="grid gap-1.5">
                  <Label
                    htmlFor="notify-reviews"
                    className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Customer Reviews
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for new product reviews.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="payments" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Configure the payment methods your store accepts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-2">
                <Checkbox id="payment-credit" defaultChecked />
                <div className="grid gap-1.5">
                  <Label
                    htmlFor="payment-credit"
                    className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Credit Cards
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Accept Visa, Mastercard, American Express, and Discover.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox id="payment-paypal" defaultChecked />
                <div className="grid gap-1.5">
                  <Label
                    htmlFor="payment-paypal"
                    className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    PayPal
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Accept payments through PayPal.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox id="payment-apple" />
                <div className="grid gap-1.5">
                  <Label
                    htmlFor="payment-apple"
                    className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Apple Pay
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Accept payments through Apple Pay.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Payment Methods</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account's security preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
              <div className="flex items-start space-x-2 pt-4">
                <Checkbox id="two-factor" />
                <div className="grid gap-1.5">
                  <Label
                    htmlFor="two-factor"
                    className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Enable Two-Factor Authentication
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Update Security Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
