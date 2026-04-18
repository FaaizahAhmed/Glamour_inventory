import * as React from "react";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ style, ...props }, ref) => (
  <div ref={ref} style={{ borderRadius: "8px", border: "1px solid #e5e7eb", backgroundColor: "white", color: "#1f2937", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)", ...style }} {...props} />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (({ style, ...props }, ref) => (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "24px", ...style }} {...props} />
  )) as any
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  (({ style, ...props }, ref) => (
    <h3 ref={ref} style={{ fontSize: "24px", fontWeight: "600", lineHeight: "1", letterSpacing: "-0.02em", ...style }} {...props} />
  )) as any
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  (({ style, ...props }, ref) => (
    <p ref={ref} style={{ fontSize: "14px", color: "#6b7280", ...style }} {...props} />
  )) as any
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (({ style, ...props }, ref) => <div ref={ref} style={{ padding: "24px", paddingTop: "0", ...style }} {...props} />) as any
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (({ style, ...props }, ref) => (
    <div ref={ref} style={{ display: "flex", alignItems: "center", padding: "24px", paddingTop: "0", ...style }} {...props} />
  )) as any
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
