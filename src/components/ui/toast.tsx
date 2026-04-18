import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { X } from "lucide-react";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ style, ...props }, ref) => {
  React.useEffect(() => {
    if (!document.querySelector('style[data-toast-viewport]')) {
      const styleEl = document.createElement('style');
      styleEl.setAttribute('data-toast-viewport', 'true');
      styleEl.textContent = `
        @media (min-width: 640px) {
          [data-toast-viewport] {
            bottom: 0;
            right: 0;
            top: auto;
            flex-direction: column;
          }
        }
      `;
      document.head.appendChild(styleEl);
    }
  }, []);
  return (
    <ToastPrimitives.Viewport
      ref={ref}
      data-toast-viewport
      style={{
        position: "fixed",
        top: "0",
        right: "0",
        zIndex: 100,
        display: "flex",
        maxHeight: "100vh",
        width: "450px",
        flexDirection: "column-reverse",
        padding: "16px",
        pointerEvents: "none",
        alignItems: "flex-end",
        ...style,
      }}
      {...props}
    />
  );
});
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const getToastStyles = (variant: "default" | "destructive" = "default"): React.CSSProperties => {
  if (variant === "destructive") {
    return {
      border: "1px solid #991b1b",
      backgroundColor: "#7f1d1d",
      color: "#fecaca",
    };
  }
  return {
    border: "1px solid #e5e7eb",
    backgroundColor: "white",
    color: "#1f2937",
  };
};

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & {
    variant?: "default" | "destructive";
  }
>(({ style, variant = "default", ...props }, ref) => {
  React.useEffect(() => {
    if (!document.querySelector('style[data-toast]')) {
      const styleEl = document.createElement('style');
      styleEl.setAttribute('data-toast', 'true');
      styleEl.textContent = `
        @keyframes slideInFromTop {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }
        @keyframes slideOutToRight {
          from { transform: translateX(0); }
          to { transform: translateX(100%); }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0.2; }
        }
        [data-toast][data-state="open"] {
          animation: slideInFromTop 0.3s ease-out;
        }
        @media (min-width: 640px) {
          [data-toast][data-state="open"] {
            animation: slideInFromTop 0.3s ease-out;
          }
        }
        [data-toast][data-state="closed"] {
          animation: slideOutToRight 0.3s ease-out;
          opacity: 0.2;
        }
      `;
      document.head.appendChild(styleEl);
    }
  }, []);
  return (
    <ToastPrimitives.Root
      ref={ref}
      data-toast
      style={{
        pointerEvents: "auto",
        position: "relative",
        display: "flex",
        width: "100%",
        maxWidth: "400px",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        overflow: "hidden",
        borderRadius: "6px",
        padding: "24px",
        paddingRight: "32px",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        transitionProperty: "all",
        transitionDuration: "200ms",
        ...getToastStyles(variant),
        ...style,
      }}
      {...props}
    />
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ style, ...props }, ref) => {
  React.useEffect(() => {
    if (!document.querySelector('style[data-toast-action]')) {
      const styleEl = document.createElement('style');
      styleEl.setAttribute('data-toast-action', 'true');
      styleEl.textContent = `
        [data-toast-action]:hover {
          background-color: #e5e7eb;
        }
        [data-toast-action]:focus {
          outline: none;
          box-shadow: 0 0 0 2px white, 0 0 0 4px rgba(59, 130, 246, 0.5);
        }
        [data-toast-action][disabled] {
          pointer-events: none;
          opacity: 0.5;
        }
      `;
      document.head.appendChild(styleEl);
    }
  }, []);
  return (
    <ToastPrimitives.Action
      ref={ref}
      data-toast-action
      style={{
        display: "inline-flex",
        height: "32px",
        flexShrink: "0",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "6px",
        border: "1px solid #d1d5db",
        backgroundColor: "transparent",
        paddingLeft: "12px",
        paddingRight: "12px",
        fontSize: "14px",
        fontWeight: "500",
        ...style,
      }}
      {...props}
    />
  );
});
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ style, ...props }, ref) => {
  React.useEffect(() => {
    if (!document.querySelector('style[data-toast-close]')) {
      const styleEl = document.createElement('style');
      styleEl.setAttribute('data-toast-close', 'true');
      styleEl.textContent = `
        [data-toast-close] {
          opacity: 0;
          transition: opacity 200ms;
        }
        [data-toast]:hover [data-toast-close],
        [data-toast]:focus-within [data-toast-close] {
          opacity: 1;
        }
        [data-toast-close]:hover {
          color: #1f2937;
        }
        [data-toast-close]:focus {
          outline: none;
          box-shadow: 0 0 0 2px white, 0 0 0 4px rgba(59, 130, 246, 0.5);
        }
      `;
      document.head.appendChild(styleEl);
    }
  }, []);
  return (
    <ToastPrimitives.Close
      ref={ref}
      data-toast-close
      style={{
        position: "absolute",
        right: "8px",
        top: "8px",
        borderRadius: "4px",
        padding: "4px",
        color: "rgba(31, 41, 55, 0.5)",
        transitionProperty: "opacity",
        transitionDuration: "200ms",
        cursor: "pointer",
        ...style,
      }}
      {...props}
    >
      <X style={{ height: "16px", width: "16px" }} />
    </ToastPrimitives.Close>
  );
});
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ style, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    style={{
      fontSize: "14px",
      fontWeight: "600",
      ...style,
    }}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ style, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    style={{
      fontSize: "14px",
      opacity: 0.9,
      ...style,
    }}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
