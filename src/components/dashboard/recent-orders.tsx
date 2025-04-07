
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const orders = [
  {
    id: "ORD-001",
    customer: "John Doe",
    product: "Wireless Headphones",
    total: "$129.99",
    status: "completed",
    date: "2023-04-05",
  },
  {
    id: "ORD-002",
    customer: "Jane Smith",
    product: "Smart Watch",
    total: "$249.99",
    status: "processing",
    date: "2023-04-05",
  },
  {
    id: "ORD-003",
    customer: "Robert Johnson",
    product: "Laptop Stand",
    total: "$39.99",
    status: "completed",
    date: "2023-04-04",
  },
  {
    id: "ORD-004",
    customer: "Emily Davis",
    product: "Bluetooth Speaker",
    total: "$79.99",
    status: "shipped",
    date: "2023-04-04",
  },
  {
    id: "ORD-005",
    customer: "Michael Wilson",
    product: "Mechanical Keyboard",
    total: "$149.99",
    status: "processing",
    date: "2023-04-03",
  },
];

export function RecentOrders() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <CardDescription>Latest customer purchases</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.product}</TableCell>
                <TableCell>{order.total}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      order.status === "completed"
                        ? "bg-success/10 text-success border-success/20"
                        : order.status === "processing"
                        ? "bg-warning/10 text-warning border-warning/20"
                        : "bg-info/10 text-info border-info/20"
                    }
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{order.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
