import { cn } from "@/lib/utils";

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "default" | "sm" | "lg";
}

export function LoadingSpinner({
  className,
  size = "default",
  ...props
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center w-full",
        {
          "min-h-[100px]": size === "default",
          "min-h-[50px]": size === "sm",
          "min-h-[200px]": size === "lg",
        },
        className
      )}
      {...props}
    >
      <div
        className={cn("animate-spin rounded-full border-t-2 border-primary", {
          "h-6 w-6": size === "default",
          "h-4 w-4": size === "sm",
          "h-8 w-8": size === "lg",
        })}
      />
    </div>
  );
}
