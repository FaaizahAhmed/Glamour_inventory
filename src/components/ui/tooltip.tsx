import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ style, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    style={{
      zIndex: "50",
      overflow: "hidden",
      borderRadius: "6px",
      border: "1px solid #e5e7eb",
      backgroundColor: "white",
      paddingLeft: "12px",
      paddingRight: "12px",
      paddingTop: "6px",
      paddingBottom: "6px",
      fontSize: "14px",
      color: "#1f2937",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      ...style,
    }}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
