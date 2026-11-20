"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/alert-dialog";
import type { OrderStatus } from "@/lib/orders";

function Spinner() {
  return <Loader2 className="size-4 animate-spin" aria-hidden />;
}

export function OrderActions({
  status,
  isPending,
  onAdvance,
  onCancel,
}: {
  status: OrderStatus;
  isPending: boolean;
  onAdvance: (next: OrderStatus) => void;
  onCancel: () => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (status === "SHIPPED") {
    return (
      <p className="text-xs text-muted-foreground">
        This order has shipped. No further actions are available.
      </p>
    );
  }

  if (status === "CANCELLED") {
    return (
      <p className="text-xs text-muted-foreground">
        This order was cancelled and stock was restored. No further actions
        are available.
      </p>
    );
  }

  const next: OrderStatus = status === "PLACED" ? "PACKED" : "SHIPPED";
  const advanceLabel =
    status === "PLACED" ? "Mark as Packed" : "Mark as Shipped";

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={() => onAdvance(next)}
        disabled={isPending}
        className="w-full"
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
            variant="outline"
            disabled={isPending}
            className="w-full border-destructive text-destructive hover:text-destructive"
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
              disabled={isPending}
              onClick={(e) => {
                e.preventDefault();
                onCancel();
                setConfirmOpen(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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

