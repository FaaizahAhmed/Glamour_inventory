import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

const getButtonStyles = (variant: string = "default", size: string = "default"): React.CSSProperties => {
  const baseStyles: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    whiteSpace: "nowrap",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    transition: "background-color 0.2s",
    cursor: "pointer",
    border: "none",
  };

  const variantStyles: { [key: string]: React.CSSProperties } = {
    default: {
      borderColor: "transparent",
      backgroundColor: "hsl(var(--primary))",
      color: "white",
    },
    destructive: {
      backgroundColor: "#ef4444",
      color: "white",
    },
    outline: {
      border: "1px solid #e5e7eb",
      backgroundColor: "white",
      color: "#1f2937",
    },
    secondary: {
      backgroundColor: "#f3f4f6",
      color: "#1f2937",
    },
    ghost: {
      backgroundColor: "transparent",
      color: "#1f2937",
    },
    link: {
      backgroundColor: "transparent",
      color: "hsl(var(--primary))",
      textDecoration: "underline",
    },
  };

  const sizeStyles: { [key: string]: React.CSSProperties } = {
    default: {
      height: "40px",
      paddingLeft: "16px",
      paddingRight: "16px",
      paddingTop: "8px",
      paddingBottom: "8px",
    },
    sm: {
      height: "36px",
      paddingLeft: "12px",
      paddingRight: "12px",
      borderRadius: "6px",
    },
    lg: {
      height: "44px",
      paddingLeft: "32px",
      paddingRight: "32px",
      borderRadius: "6px",
    },
    icon: {
      height: "40px",
      width: "40px",
    },
  };

  return {
    ...baseStyles,
    ...variantStyles[variant],
    ...sizeStyles[size],
  };
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "default", size = "default", asChild = false, style, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp style={{ ...getButtonStyles(variant, size), ...style }} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button };
