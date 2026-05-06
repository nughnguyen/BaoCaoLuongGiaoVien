import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return <input className={cn("clay-inset px-3 py-2 outline-none", className)} ref={ref} {...props} />;
});
Input.displayName = "Input";

export { Input };
