"use client";

import { ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Database } from "@/types/database";
import type { UserRole } from "@/lib/dashboard-config";

type FanPurchaseRow = Database["public"]["Tables"]["fan_purchases"]["Row"];

type Props = {
  purchases: FanPurchaseRow[];
  role: UserRole;
  userId: string | null;
};

function statusVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "completed":
      return "default";
    case "pending":
      return "secondary";
    case "refunded":
      return "destructive";
    default:
      return "outline";
  }
}

function formatAmount(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export function FanPurchasesSection({ purchases, role }: Props) {
  const isAdmin = role === "admin";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black uppercase sm:text-3xl">
          {isAdmin ? "All Purchases" : "My Purchases"}
        </h2>
        <p className="text-xs text-muted-foreground sm:text-sm">
          {isAdmin ? "View all fan purchase history." : "View your ticket and merchandise purchases."}
        </p>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {isAdmin && <TableHead>User ID</TableHead>}
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    {isAdmin && (
                      <TableCell className="max-w-[120px] truncate font-mono text-xs text-muted-foreground">
                        {purchase.user_id}
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge variant={purchase.purchase_type === "ticket" ? "default" : "secondary"}>
                        {purchase.purchase_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {purchase.description || "—"}
                    </TableCell>
                    <TableCell className="font-bold">
                      {formatAmount(purchase.amount_cents, purchase.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(purchase.status)}>
                        {purchase.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                      {new Date(purchase.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
                {purchases.length === 0 && (
                  <TableRow>
                    <TableCell className="py-12 text-center text-muted-foreground italic" colSpan={isAdmin ? 6 : 5}>
                      <ShoppingBag className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                      No purchases found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
