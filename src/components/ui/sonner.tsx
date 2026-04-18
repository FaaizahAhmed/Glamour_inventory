import React from "react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  React.useEffect(() => {
    if (!document.querySelector('style[data-sonner-toaster]')) {
      const styleEl = document.createElement('style');
      styleEl.setAttribute('data-sonner-toaster', 'true');
      styleEl.textContent = `
        .toaster {
          position: fixed;
          top: 0;
          right: 0;
          z-index: 100;
          display: flex;
          max-height: 100vh;
          width: 100%;
          flex-direction: column-reverse;
          padding: 16px;
          max-width: 100%;
        }
        @media (min-width: 640px) {
          .toaster {
            bottom: 0;
            right: 0;
            top: auto;
            flex-direction: column;
            max-width: 420px;
          }
        }
        .sonner-toast {
          background-color: white;
          color: #1f2937;
          border: 1px solid #e5e7eb;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          padding: 24px;
          border-radius: 8px;
        }
        .sonner-description {
          color: #6b7280;
        }
        .sonner-action {
          background-color: #3b82f6;
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 14px;
        }
        .sonner-action:hover {
          background-color: #2563eb;
        }
        .sonner-cancel {
          background-color: #f3f4f6;
          color: #6b7280;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 14px;
        }
        .sonner-cancel:hover {
          background-color: #e5e7eb;
        }
      `;
      document.head.appendChild(styleEl);
    }
  }, []);

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster"
      toastOptions={{
        classNames: {
          toast: "sonner-toast",
          description: "sonner-description",
          actionButton: "sonner-action",
          cancelButton: "sonner-cancel",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
