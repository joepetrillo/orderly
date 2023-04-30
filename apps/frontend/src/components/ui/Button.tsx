import * as React from "react";
import Link, { LinkProps } from "next/link";
import { VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "transition duration-100 inline-flex items-center justify-center gap-2 shadow-sm border border-transparent font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-indigo-600 hover:bg-indigo-700 text-white",
        secondary: "bg-indigo-100 hover:bg-indigo-200 text-indigo-700",
        outline: "bg-white hover:bg-gray-50 text-gray-700 border-gray-300",
        tabGray: "hover:bg-gray-100 shadow-none",
        danger:
          "text-white bg-red-500 hover:bg-red-600 focus-visible:ring-red-500",
      },
      size: {
        xs: "px-2.5 py-1.5 text-xs rounded",
        sm: "px-3 py-2 text-sm leading-4 rounded-md",
        default: "px-4 py-2 text-sm rounded-md",
        lg: "px-4 py-2 text-base rounded-md",
        xl: "px-6 py-3 text-base rounded-md",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

type BaseProps = {
  children: React.ReactNode;
  className?: string;
};

type ButtonAsButton = BaseProps &
  VariantProps<typeof buttonVariants> &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    as?: "button";
  };

type ButtonAsLink = BaseProps &
  VariantProps<typeof buttonVariants> &
  Omit<LinkProps, keyof BaseProps> & {
    as: "link";
  };

type ButtonAsExternal = BaseProps &
  VariantProps<typeof buttonVariants> &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> & {
    as: "externalLink";
  };

type ButtonProps = ButtonAsButton | ButtonAsLink | ButtonAsExternal;

const AsLink = React.forwardRef<HTMLAnchorElement, ButtonAsLink>(
  (props, ref) => {
    const { as, className, variant, size, href, ...rest } = props;
    return (
      <Link
        className={cn(buttonVariants({ variant, size, className }))}
        href={href}
        ref={ref}
        {...rest}
      />
    );
  }
);
AsLink.displayName = "Link";

const AsExternalLink = React.forwardRef<HTMLAnchorElement, ButtonAsExternal>(
  (props, ref) => {
    const { as, className, variant, size, ...rest } = props;
    return (
      <a
        className={cn(buttonVariants({ variant, size, className }))}
        target="_blank"
        rel="noopener noreferrer"
        ref={ref}
        {...rest}
      >
        {rest.children}
      </a>
    );
  }
);
AsExternalLink.displayName = "ExternalLink";

const AsButton = React.forwardRef<HTMLButtonElement, ButtonAsButton>(
  (props, ref) => {
    const { as, className, variant, size, ...rest } = props;
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...rest}
      >
        {rest.children}
      </button>
    );
  }
);
AsButton.displayName = "RegularButton";

const Button = React.forwardRef<
  HTMLAnchorElement | HTMLButtonElement,
  ButtonProps
>((props, ref) => {
  if (props.as === "link") {
    return (
      <AsLink ref={ref as React.ForwardedRef<HTMLAnchorElement>} {...props} />
    );
  } else if (props.as === "externalLink") {
    return (
      <AsExternalLink
        ref={ref as React.ForwardedRef<HTMLAnchorElement>}
        {...props}
      />
    );
  } else {
    return (
      <AsButton ref={ref as React.ForwardedRef<HTMLButtonElement>} {...props} />
    );
  }
});
Button.displayName = "Button";

export default Button;

export { buttonVariants };
