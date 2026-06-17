import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function EmptyState({
  icon: Icon,
  title,
  description,
  milestone,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  milestone?: string;
  children?: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-accent/40 text-fin">
        <Icon className="h-7 w-7" />
      </div>
      <div className="max-w-md space-y-1.5">
        <h2 className="text-lg font-semibold text-fin-dark">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {milestone && (
        <Badge variant="outline" className="bg-secondary/60">
          {milestone}
        </Badge>
      )}
      {children}
    </Card>
  );
}
