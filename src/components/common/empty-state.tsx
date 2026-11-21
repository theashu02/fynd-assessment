import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "cn";
import { Card, CardContent } from "@/components/ui";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("border-border bg-card shadow-none", className)}>
      <CardContent className="flex flex-col items-center gap-3 px-4 py-10 text-center">
        <span className="flex size-14 items-center justify-center rounded-md bg-muted">
          <Icon className="size-6 text-muted-foreground" aria-hidden />
        </span>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="max-w-55 text-xs text-muted-foreground">{description}</p>
        {action}
      </CardContent>
    </Card>
  );
}
