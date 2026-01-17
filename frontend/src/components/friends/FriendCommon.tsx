import { Loader2 } from "lucide-react";

export const LoadingState = () => (
  <div className="flex justify-center py-10">
    <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
  </div>
);

export const EmptyState = ({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) => (
  <div className="text-center py-10 text-muted-foreground border border-dashed rounded-lg bg-muted/10">
    <div className="mx-auto mb-3 opacity-30 w-fit">{icon}</div>
    <p className="text-sm">{text}</p>
  </div>
);
