import * as React from "react";
import Link, { LinkProps } from "next/link";
import { VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "appearance-none uppercase inline-flex gap-2 cursor-pointer select-none items-center justify-center rounded disabled:opacity-50 disabled:pointer-events-none leading-none font-semibold tracking-wide text-white transition-all duration-100 focus-visible:outline focus-visible:outline-4 focus-visible:outline-indigo-400",
  {
    variants: {
      variant: {
        default: "bg-indigo-600 hover:bg-indigo-700",
        ghost: "hover:bg-indigo-200/60 text-indigo-600",
        outline:
          "ring-2 ring-inset ring-indigo-600 hover:bg-indigo-200/60 text-indigo-600",
        light: "bg-gray-200 hover:bg-gray-300 text-indigo-600",
      },
      size: {
        sm: "px-5 py-2 text-[0.6875rem]",
        default: "px-6 py-3 text-xs",
        lg: "px-6 py-3 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
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
