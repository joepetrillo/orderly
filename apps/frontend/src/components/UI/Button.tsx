import React from "react";
import { VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "appearance-none inline-flex gap-2 cursor-pointer select-none items-center justify-center rounded-md disabled:opacity-50 disabled:pointer-events-none leading-none font-semibold uppercase tracking-wide text-gray-50 transition-all duration-100 focus-visible:outline-none focus-visible:ring focus-visible:ring-indigo-400",
  {
    variants: {
      variant: {
        default: "bg-indigo-600 hover:bg-indigo-700",
        ghost: "hover:bg-indigo-200/40 text-indigo-600",
        outline:
          "border border-indigo-600 hover:bg-indigo-200/40 text-indigo-600",
      },
      size: {
        sm: "px-5 py-2.5 text-[0.6875rem]",
        default: "px-6 py-3 text-xs",
        lg: "px-8 py-4 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, size, variant, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export default Button;
