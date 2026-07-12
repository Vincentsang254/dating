import * as React from "react";
import { cn } from "@/lib/utils";

const DropdownMenu = ({ children, className, ...props }) => (
  <div className={cn("relative", className)} {...props}>
    {children}
  </div>
);

const DropdownMenuTrigger = ({ asChild = false, children, className, ...props }) => {
  if (asChild) {
    return <div className={className}>{children}</div>;
  }

  return (
    <button type="button" className={cn("inline-flex", className)} {...props}>
      {children}
    </button>
  );
};

const DropdownMenuContent = ({ className, children, ...props }) => (
  <div
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

const DropdownMenuItem = ({ className, ...props }) => (
  <button
    type="button"
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
      className
    )}
    {...props}
  />
);

const DropdownMenuLabel = ({ className, ...props }) => (
  <div className={cn("px-2 py-1.5 text-sm font-semibold", className)} {...props} />
);

const DropdownMenuSeparator = ({ className, ...props }) => (
  <div className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
);

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
};
