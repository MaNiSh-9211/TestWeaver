import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({ className, size = "md" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  return (
    <div className={cn("relative", className)}>
      <div className={cn(
        "animate-spin rounded-full border-2 border-transparent border-t-cyan-400 border-r-purple-500",
        sizeClasses[size]
      )} />
      <div className={cn(
        "absolute inset-0 animate-ping rounded-full border border-cyan-400/20",
        sizeClasses[size]
      )} />
    </div>
  );
}
