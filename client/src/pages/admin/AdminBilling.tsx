import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { Header } from "@/components/layout/header";

// Mock data for admin billing
const mockMetrics = {
  totalRevenue: 125460,
  activeSubscriptions: 847,
  failedPayments: 23,
  refundsIssued: 12,
};

const mockInvoices = [
  {
    id: "INV-001",
    userId: "user-123",
    username: "john_doe",
    amount: 29.99,
    status: "paid",
    date: "2024-01-15",
    plan: "Pro Plan",
  },
  {
    id: "INV-002",
    userId: "user-456",
    username: "jane_smith",
    amount: 99.99,
    status: "failed",
    date: "2024-01-14",
    plan: "Enterprise Plan",
  },
  {
    id: "INV-003",
    userId: "user-789",
    username: "bob_wilson",
    amount: 9.99,
    status: "pending",
    date: "2024-01-13",
    plan: "Basic Plan",
  },
  {
    id: "INV-004",
    userId: "user-101",
    username: "alice_johnson",
    amount: 49.99,
    status: "paid",
    date: "2024-01-12",
    plan: "Business Plan",
  },
  {
    id: "INV-005",
    userId: "user-202",
    username: "charlie_brown",
    amount: 29.99,
    status: "refunded",
    date: "2024-01-11",
    plan: "Pro Plan",
  },
];

export default function AdminBilling() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [selectedUser, setSelectedUser] = useState("");
  const [adjustAmount, setAdjustAmount] = useState("");

  // Using mock data instead of API calls
  const metrics = mockMetrics;
  const invoices = mockInvoices;

  // Mock mutations for admin actions (just show toast messages)
  const adjustBalanceMutation = {
    mutate: ({ userId, amount }: { userId: string; amount: number }) => {
      toast({
        title: "Balance Adjusted",
        description: `User ${userId}: ${amount > 0 ? "+" : ""}$${amount}`,
        variant: "default",
      });
      setSelectedUser("");
      setAdjustAmount("");
    },
  };

  const retryPaymentMutation = {
    mutate: (invoiceId: string) => {
      toast({
        title: "Payment Retry",
        description: `Retry triggered for ${invoiceId}`,
        variant: "default",
      });
    },
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "failed":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      case "refunded":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* <Sidebar /> */}

      <div className="flex-1 overflow-auto">
        <Header
          title="Admin Billing"
          description="Manage users’ subscriptions, invoices, refunds, and errors"
        />

        <main className="p-6 space-y-6">
          {/* Dashboard Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-2xl font-bold">
                  ${metrics.totalRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {metrics.activeSubscriptions.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Active Subscriptions
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.failedPayments}</p>
                <p className="text-sm text-muted-foreground">Failed Payments</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.refundsIssued}</p>
                <p className="text-sm text-muted-foreground">Refunds</p>
              </div>
            </CardContent>
          </Card>

          {/* Admin Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="User ID"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                />
                <Input
                  placeholder="User Email"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                />
                <Input
                  placeholder="User Name"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                />
                <Input
                  placeholder="Adjust Balance (+/-)"
                  type="number"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                />
                {/* <Button
                  onClick={() =>
                    adjustBalanceMutation.mutate({
                      userId: selectedUser,
                      amount: Number(adjustAmount),
                    })
                  }
                  disabled={!selectedUser || !adjustAmount}>
                  Adjust Balance
                </Button> */}
              </div>

              <div className="flex gap-4">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upgrade">Force Upgrade</SelectItem>
                    <SelectItem value="downgrade">Force Downgrade</SelectItem>
                    <SelectItem value="cancel">Cancel Subscription</SelectItem>
                    <SelectItem value="pause">Pause Subscription</SelectItem>
                    <SelectItem value="adjust">Adjust Balance</SelectItem>
                  </SelectContent>
                </Select>
                <Button disabled={!selectedUser}>Apply</Button>
              </div>
            </CardContent>
          </Card>

          {/* Invoices & Payments */}
          <Card>
            <CardHeader>
              <CardTitle>Invoices & Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {inv.id} - ${inv.amount} ({inv.username})
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {inv.plan} - {inv.date}
                      </p>
                      <Badge className={getStatusColor(inv.status)}>
                        {inv.status.charAt(0).toUpperCase() +
                          inv.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      {inv.status === "failed" && (
                        <Button
                          size="sm"
                          onClick={() => retryPaymentMutation.mutate(inv.id)}>
                          Retry
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Errors & Issues */}
          <Card>
            <CardHeader>
              <CardTitle>Error & Issue Handling</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Show transaction error logs here…
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
