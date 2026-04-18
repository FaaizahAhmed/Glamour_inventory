import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ style, ...props }, ref) => (
  <LabelPrimitive.Root 
    ref={ref} 
    style={{
      fontSize: "14px",
      fontWeight: "500",
      lineHeight: "1",
      ...style,
    }} 
    {...props} 
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
