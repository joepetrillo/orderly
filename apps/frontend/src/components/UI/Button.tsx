import React from "react";
import { VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex gap-2 cursor-pointer select-none items-center justify-center rounded-md disabled:opacity-50 disabled:pointer-events-none text-[0.6875rem] leading-none font-semibold uppercase tracking-wide text-gray-50 transition-all duration-100",
  {
    variants: {
      variant: {
        default: "bg-indigo-600 hover:bg-indigo-700 ",
        ghost: "hover:bg-indigo-100 text-indigo-600",
      },
      size: {
        default: "min-h-[2.25rem] px-5 py-2.5",
        lg: "min-h-[3rem] px-6 py-3",
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
  ({ className, variant, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export default Button;
