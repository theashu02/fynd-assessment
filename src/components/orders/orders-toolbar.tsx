"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { OrderStatus } from "@/lib/orders";

export type StatusFilter = "ALL" | OrderStatus;

export const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PLACED", label: "Placed" },
  { value: "PACKED", label: "Packed" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "CANCELLED", label: "Cancelled" },
];

function CountBadge({ count }: { count: number }) {
  return (
    <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center bg-secondary px-1 text-[11px] font-semibold text-secondary-foreground">
      {count}
    </span>
  );
}

export function OrdersToolbar({
  searchInput,
  onSearchChange,
  status,
  onStatusChange,
  counts,
}: {
  searchInput: string;
  onSearchChange: (value: string) => void;
  status: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  counts: Record<StatusFilter, number>;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by order reference"
            aria-label="Search by order reference"
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={status}
            onValueChange={(v) => onStatusChange(v as StatusFilter)}
          >
            <SelectTrigger className="flex-1 sm:hidden" aria-label="Filter by status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label} ({counts[opt.value]})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button asChild className="flex-1 sm:flex-none">
            <Link href="/orders/new">New order</Link>
          </Button>
        </div>
      </div>
      <Tabs
        value={status}
        onValueChange={(v) => onStatusChange(v as StatusFilter)}
        className="hidden max-w-full overflow-x-auto sm:block"
      >
        <TabsList aria-label="Filter by status">
          {STATUS_OPTIONS.map((opt) => (
            <TabsTrigger key={opt.value} value={opt.value}>
              {opt.label}
              <CountBadge count={counts[opt.value]} />
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}

