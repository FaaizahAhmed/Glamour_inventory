import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ style, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    style={{
      position: "fixed",
      inset: "0",
      zIndex: "50",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      ...style,
    }}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ children, style, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      style={{
        position: "fixed",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: "50",
        display: "grid",
        width: "100%",
        maxWidth: "32rem",
        gap: "16px",
        border: "1px solid #e5e7eb",
        backgroundColor: "white",
        padding: "24px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        borderRadius: "8px",
        ...style,
      }}
      {...props}
    >
      {children}
      <DialogPrimitive.Close style={{
        position: "absolute",
        right: "16px",
        top: "16px",
        borderRadius: "4px",
        opacity: 0.7,
        cursor: "pointer",
        border: "none",
        backgroundColor: "transparent",
        padding: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <X style={{ width: "16px", height: "16px" }} />
        <span style={{ position: "absolute", width: "1px", height: "1px", padding: "0", margin: "-1px", overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", borderWidth: "0" }}>Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    textAlign: "center",
    ...style,
  }} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{
    display: "flex",
    flexDirection: "row-reverse",
    justifyContent: "flex-end",
    gap: "8px",
    ...style,
  }} {...props} />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ style, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    style={{
      fontSize: "18px",
      fontWeight: "600",
      lineHeight: "1",
      letterSpacing: "-0.02em",
      ...style,
    }}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ style, ...props }, ref) => (
  <DialogPrimitive.Description 
    ref={ref} 
    style={{
      fontSize: "14px",
      color: "#6b7280",
      ...style,
    }} 
    {...props} 
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
