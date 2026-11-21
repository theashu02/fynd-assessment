"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
} from "@/components/ui";
import type { OrderStatus } from "@/lib";

function Spinner() {
  return <Loader2 className="size-4 animate-spin" aria-hidden />;
}

export function OrderActions({
  status,
  isPending,
  onAdvance,
  onCancel,
}: {
  status: "PLACED" | "PACKED";
  isPending: boolean;
  onAdvance: (next: OrderStatus) => void;
  onCancel: () => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const next: OrderStatus = status === "PLACED" ? "PACKED" : "SHIPPED";
  const advanceLabel =
    status === "PLACED" ? "Mark as Packed" : "Mark as Shipped";

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={() => onAdvance(next)}
        disabled={isPending}
        className="w-full text-[14px]"
        size="lg"
      >
        {isPending ? (
          <>
            <Spinner />
            Updating...
          </>
        ) : (
          advanceLabel
        )}
      </Button>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            disabled={isPending}
            className="w-full text-[14px]"
            size="lg"
          >
            Cancel order
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
            <AlertDialogDescription>
              Cancelling will restore stock for every item on this order.
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Keep order</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isPending}
              onClick={(e) => {
                e.preventDefault();
                onCancel();
                setConfirmOpen(false);
              }}
              
            >
              {isPending ? (
                <>
                  <Spinner />
                  Cancelling...
                </>
              ) : (
                "Yes, cancel order"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
