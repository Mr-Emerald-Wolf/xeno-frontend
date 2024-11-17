"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { AlertCircle, Plus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import Link from "next/link";

interface Customer {
  id: number;
  name: string;
  email: string;
  totalSpending: string;
  createdAt: string;
  updatedAt: string;
}

interface Order {
  id: number;
  customerId: number;
  orderDate: string;
  revenue: string;
  cost: string;
  customer: Customer;
}

export default function OrdersPage() {
  const { data: session, status } = useSession(); // Get session data and status from next-auth
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return; // Don't make the API call while the session is loading
    if (!session) {
      setError("User not authenticated or customer ID not found.");
      setIsLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await axios.get<Order[]>(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/orders/customer/${session.user?.id}`
        );
        setOrders(response.data);
      } catch (err) {
        setError("An error occurred while fetching orders. Please try again later.");
        console.log(err);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchOrders();
  }, [session, status]); // Depend on session and status

  if (status === "loading") {
    return (
      <Card className="mx-auto mt-8 w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="mb-4 h-12 w-full" />
          <Skeleton className="mb-4 h-12 w-full" />
          <Skeleton className="mb-4 h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mx-auto mt-8 max-w-4xl">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="mx-auto mt-8 w-full max-w-4xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold">Orders</CardTitle>
        <Link href="/orders/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create Order
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Profit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.customer.name}</TableCell>
                  <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                  <TableCell>${parseFloat(order.revenue).toFixed(2)}</TableCell>
                  <TableCell>${parseFloat(order.cost).toFixed(2)}</TableCell>
                  <TableCell>${(parseFloat(order.revenue) - parseFloat(order.cost)).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
