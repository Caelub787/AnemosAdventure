import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-violet-600 text-white hover:bg-violet-500 focus-visible:outline-violet-600",
  secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700 focus-visible:outline-slate-500",
  ghost: "bg-transparent text-slate-100 hover:bg-slate-800 focus-visible:outline-slate-500",
  destructive: "bg-red-600 text-white hover:bg-red-500 focus-visible:outline-red-600",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-3 text-base",
};

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
}
