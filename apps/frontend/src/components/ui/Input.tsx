import { ExclamationCircleIcon } from "@heroicons/react/20/solid";
import React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    inputId: string;
    label?: string;
    errorMessage?: string;
  }
>(({ className, inputId, label, errorMessage, ...props }, ref) => {
  return (
    <div>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <div className="relative rounded-md shadow-sm">
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(errorMessage)}
          aria-describedby={`${inputId}-error`}
          className={cn(
            "form-input block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 sm:text-sm",
            className
          )}
          {...props}
        />
        {errorMessage && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ExclamationCircleIcon
              className="h-5 w-5 text-red-500"
              aria-hidden="true"
            />
          </div>
        )}
      </div>
      {errorMessage && (
        <p className="mt-2 text-xs text-red-500" id={`${inputId}-error`}>
          {errorMessage}
        </p>
      )}
    </div>
  );
});

Input.displayName = "Input";

export default Input;
