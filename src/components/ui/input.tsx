import * as React from "react";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ type, style, ...props }, ref) => {
    return (
      <input
        type={type}
        style={{
          display: "flex",
          height: "32px",
          width: "auto",
          borderRadius: "6px",
          border: "1px solid #d1d5db",
          backgroundColor: "white",
          paddingLeft: "16px",
          paddingRight: "16px",
          paddingTop: "8px",
          paddingBottom: "8px",
          fontSize: "16px",
          color: "#1f2937",
          ...style,
        }}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
