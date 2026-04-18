import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const SIDEBAR_COOKIE_NAME = "sidebar:state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

type SidebarContext = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContext | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }

  return context;
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }
>(({ defaultOpen = true, open: openProp, onOpenChange: setOpenProp, className, style, children, ...props }, ref) => {
  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }

      // This sets the cookie to keep the sidebar state.
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [setOpenProp, open],
  );

  // Helper to toggle the sidebar.
  const toggleSidebar = React.useCallback(() => {
    return setOpen((open) => !open);
  }, [setOpen]);

  // Adds a keyboard shortcut to toggle the sidebar.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  // We add a state so that we can do data-state="expanded" or "collapsed".
  const state = open ? "expanded" : "collapsed";

  const contextValue = React.useMemo<SidebarContext>(
    () => ({
      state,
      open,
      setOpen,
      isMobile: false,
      openMobile: false,
      setOpenMobile: () => {},
      toggleSidebar,
    }),
    [state, open, setOpen, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              display: "flex",
              minHeight: "100svh",
              width: "100%",
              ...style,
            } as React.CSSProperties
          }
          ref={ref}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
});
SidebarProvider.displayName = "SidebarProvider";

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    side?: "left" | "right";
    variant?: "sidebar" | "floating" | "inset";
    collapsible?: "offcanvas" | "icon" | "none";
  }
>(({ side = "left", variant = "sidebar", collapsible = "offcanvas", style, children, ...props }, ref) => {
  const { state } = useSidebar();

  if (collapsible === "none") {
    return (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "var(--sidebar-width)",
          flexDirection: "column",
          backgroundColor: "#f8f9fa",
          color: "#1f2937",
          ...style,
        }}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      style={{
        color: "#1f2937",
        position: "fixed",
        top: 0,
        bottom: 0,
        zIndex: 10,
        display: "flex",
        height: "100svh",
        width: "var(--sidebar-width)",
        transitionProperty: "left, right, width",
        transitionDuration: "200ms",
        transitionTimingFunction: "linear",
        [side === "left" ? "left" : "right"]: 0,
        ...style,
      }}
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      {...props}
    >
      <div
        data-sidebar="sidebar"
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          flexDirection: "column",
          backgroundColor: "#f8f9fa",
        }}
      >
        {children}
      </div>
    </div>
  );
});
Sidebar.displayName = "Sidebar";

const SidebarTrigger = React.forwardRef<React.ElementRef<typeof Button>, React.ComponentProps<typeof Button>>(
  ({ onClick, ...props }, ref) => {
    const { toggleSidebar } = useSidebar();

    return (
      <Button
        ref={ref}
        data-sidebar="trigger"
        variant="ghost"
        size="icon"
        style={{ height: "28px", width: "28px" }}
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          onClick?.(event);
          toggleSidebar();
        }}
        {...props}
      >
        <PanelLeft />
        <span style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: "0",
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          borderWidth: "0",
        }}>Toggle Sidebar</span>
      </Button>
    );
  },
);
SidebarTrigger.displayName = "SidebarTrigger";

const SidebarRail = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button">>(
  ({ ...props }, ref) => {
    const { toggleSidebar } = useSidebar();

    React.useEffect(() => {
      if (!document.querySelector('style[data-sidebar-rail]')) {
        const styleEl = document.createElement('style');
        styleEl.setAttribute('data-sidebar-rail', 'true');
        styleEl.textContent = `
          [data-sidebar="rail"] {
            position: absolute;
            inset-y: 0;
            z-index: 20;
            hidden: hidden;
            width: 16px;
            transform: translateX(-50%);
            transition: all 200ms linear;
          }
          [data-sidebar="rail"]::after {
            position: absolute;
            inset-y: 0;
            left: 50%;
            width: 2px;
          }
          [data-sidebar="rail"]:hover::after {
            background-color: #e5e7eb;
          }
          [data-side="left"] [data-sidebar="rail"] {
            right: -16px;
          }
          [data-side="right"] [data-sidebar="rail"] {
            left: 0;
          }
          [data-collapsible="offcanvas"] [data-sidebar="rail"] {
            transform: translateX(0);
          }
          [data-collapsible="offcanvas"][data-side="left"] [data-sidebar="rail"] {
            right: -8px;
          }
          [data-collapsible="offcanvas"][data-side="right"] [data-sidebar="rail"] {
            left: -8px;
          }
          @media (max-width: 640px) {
            [data-sidebar="rail"] {
              display: none;
            }
          }
        `;
        document.head.appendChild(styleEl);
      }
    }, []);

    return (
      <button
        ref={ref}
        data-sidebar="rail"
        aria-label="Toggle Sidebar"
        tabIndex={-1}
        onClick={toggleSidebar}
        title="Toggle Sidebar"
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          zIndex: 20,
          display: "none",
          width: "16px",
          transform: "translateX(-50%)",
          transitionProperty: "all",
          transitionDuration: "200ms",
          transitionTimingFunction: "linear",
          cursor: "pointer",
        }}
        {...props}
      />
    );
  },
);
SidebarRail.displayName = "SidebarRail";

const SidebarInset = React.forwardRef<HTMLDivElement, React.ComponentProps<"main">>(({ ...props }, ref) => {
  return (
    <main
      ref={ref}
      style={{
        position: "relative",
        display: "flex",
        minHeight: "100svh",
        flex: "1",
        flexDirection: "column",
        backgroundColor: "white",
      }}
      {...props}
    />
  );
});
SidebarInset.displayName = "SidebarInset";

const SidebarInput = React.forwardRef<React.ElementRef<typeof Input>, React.ComponentProps<typeof Input>>(
  ({ ...props }, ref) => {
    return (
      <Input
        ref={ref}
        data-sidebar="input"
        style={{
          height: "32px",
          width: "100%",
          backgroundColor: "white",
          boxShadow: "none",
        }}
        {...props}
      />
    );
  },
);
SidebarInput.displayName = "SidebarInput";

const SidebarHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({ style, ...props }, ref) => {
  return <div ref={ref} data-sidebar="header" style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "8px", ...style }} {...props} />;
});
SidebarHeader.displayName = "SidebarHeader";

const SidebarFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({ style, ...props }, ref) => {
  return <div ref={ref} data-sidebar="footer" style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "8px", ...style }} {...props} />;
});
SidebarFooter.displayName = "SidebarFooter";

const SidebarSeparator = React.forwardRef<React.ElementRef<typeof Separator>, React.ComponentProps<typeof Separator>>(
  ({ ...props }, ref) => {
    return (
      <Separator
        ref={ref}
        data-sidebar="separator"
        style={{
          marginLeft: "8px",
          marginRight: "8px",
          width: "auto",
          borderColor: "#e5e7eb",
        }}
        {...props}
      />
    );
  },
);
SidebarSeparator.displayName = "SidebarSeparator";

const SidebarContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({ style, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="content"
      style={{
        display: "flex",
        minHeight: "0",
        flex: 1,
        flexDirection: "column",
        gap: "8px",
        overflow: "auto",
        ...style,
      }}
      {...props}
    />
  );
});
SidebarContent.displayName = "SidebarContent";

const SidebarGroup = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({ style, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="group"
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        minWidth: "0",
        flexDirection: "column",
        padding: "8px",
        ...style,
      }}
      {...props}
    />
  );
});
SidebarGroup.displayName = "SidebarGroup";

const SidebarGroupLabel = React.forwardRef<HTMLDivElement, React.ComponentProps<"div"> & { asChild?: boolean }>(
  ({ asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";

    return (
      <Comp
        ref={ref}
        data-sidebar="group-label"
        style={{
          display: "flex",
          height: "32px",
          flexShrink: "0",
          alignItems: "center",
          borderRadius: "6px",
          paddingLeft: "8px",
          paddingRight: "8px",
          fontSize: "12px",
          fontWeight: "500",
          color: "rgba(31, 41, 55, 0.7)",
          outline: "none",
          transitionProperty: "margin, opacity",
          transitionDuration: "200ms",
          transitionTimingFunction: "linear",
        }}
        {...props}
      />
    );
  },
);
SidebarGroupLabel.displayName = "SidebarGroupLabel";

const SidebarGroupAction = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button"> & { asChild?: boolean }>(
  ({ asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        data-sidebar="group-action"
        style={{
          position: "absolute",
          right: "12px",
          top: "14px",
          display: "flex",
          aspectRatio: "1",
          width: "20px",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "6px",
          padding: "0",
          color: "#1f2937",
          outline: "none",
          transitionProperty: "transform",
          cursor: "pointer",
        }}
        {...props}
      />
    );
  },
);
SidebarGroupAction.displayName = "SidebarGroupAction";

const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ ...props }, ref) => (
    <div
      ref={ref}
      data-sidebar="group-content"
      style={{
        width: "100%",
        fontSize: "14px",
      }}
      {...props}
    />
  ),
);
SidebarGroupContent.displayName = "SidebarGroupContent";

const SidebarMenu = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(({ style, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu"
    style={{
      display: "flex",
      width: "100%",
      minWidth: "0",
      flexDirection: "column",
      gap: "4px",
      ...style,
    }}
    {...props}
  />
));
SidebarMenu.displayName = "SidebarMenu";

const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(({ style, ...props }, ref) => (
  <li
    ref={ref}
    data-sidebar="menu-item"
    style={{
      position: "relative",
      ...style,
    }}
    {...props}
  />
));
SidebarMenuItem.displayName = "SidebarMenuItem";

const sidebarMenuButtonVariants = (variant: "default" | "outline" = "default", size: "default" | "sm" | "lg" = "default"): React.CSSProperties => {
  const baseStyles: React.CSSProperties = {
    display: "flex",
    width: "100%",
    alignItems: "center",
    gap: "8px",
    overflow: "hidden",
    borderRadius: "6px",
    paddingTop: "8px",
    paddingBottom: "8px",
    paddingLeft: "8px",
    paddingRight: "8px",
    textAlign: "left",
    fontSize: "14px",
    outline: "none",
    transitionProperty: "width, height, padding",
    transitionDuration: "200ms",
    cursor: "pointer",
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    default: { backgroundColor: "transparent" },
    outline: {
      backgroundColor: "white",
      border: "1px solid #e5e7eb",
    },
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    default: { height: "32px" },
    sm: { height: "28px", fontSize: "12px" },
    lg: { height: "48px" },
  };

  return { ...baseStyles, ...variantStyles[variant], ...sizeStyles[size] };
};

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean;
    isActive?: boolean;
    tooltip?: string | React.ComponentProps<typeof TooltipContent>;
    variant?: "default" | "outline";
    size?: "default" | "sm" | "lg";
  }
>(({ asChild = false, isActive = false, variant = "default", size = "default", tooltip, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  const { state } = useSidebar();

  React.useEffect(() => {
    if (!document.querySelector('style[data-sidebar-menu-button]')) {
      const styleEl = document.createElement('style');
      styleEl.setAttribute('data-sidebar-menu-button', 'true');
      styleEl.textContent = `
        [data-sidebar="menu-button"]:hover {
          background-color: #f3f4f6;
        }
        [data-sidebar="menu-button"]:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px white, 0 0 0 4px rgba(59, 130, 246, 0.5);
        }
        [data-sidebar="menu-button"][data-active="true"] {
          background-color: #f3f4f6;
          font-weight: 500;
        }
        [data-sidebar="menu-button"][disabled] {
          pointer-events: none;
          opacity: 0.5;
        }
      `;
      document.head.appendChild(styleEl);
    }
  }, []);

  const button = (
    <Comp
      ref={ref}
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      style={sidebarMenuButtonVariants(variant, size)}
      {...props}
    />
  );

  if (!tooltip) {
    return button;
  }

  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip,
    };
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right" align="center" hidden={state !== "collapsed"} {...tooltip} />
    </Tooltip>
  );
});
SidebarMenuButton.displayName = "SidebarMenuButton";

const SidebarMenuAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean;
    showOnHover?: boolean;
  }
>(({ asChild = false, showOnHover = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";

  React.useEffect(() => {
    if (!document.querySelector('style[data-sidebar-menu-action]')) {
      const styleEl = document.createElement('style');
      styleEl.setAttribute('data-sidebar-menu-action', 'true');
      styleEl.textContent = `
        [data-sidebar="menu-action"]:hover {
          background-color: #f3f4f6;
        }
        [data-sidebar="menu-action"]:focus {
          outline: none;
          box-shadow: 0 0 0 2px white, 0 0 0 4px rgba(59, 130, 246, 0.5);
        }
        [data-sidebar="menu-action"][disabled] {
          pointer-events: none;
          opacity: 0.5;
        }
      `;
      document.head.appendChild(styleEl);
    }
  }, []);

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-action"
      style={{
        position: "absolute",
        right: "4px",
        top: "6px",
        display: "flex",
        aspectRatio: "1",
        width: "20px",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "6px",
        padding: "0",
        color: "#1f2937",
        outline: "none",
        transitionProperty: "transform",
        cursor: "pointer",
      }}
      {...props}
    />
  );
});
SidebarMenuAction.displayName = "SidebarMenuAction";

const SidebarMenuBadge = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ ...props }, ref) => (
    <div
      ref={ref}
      data-sidebar="menu-badge"
      style={{
        pointerEvents: "none",
        position: "absolute",
        right: "4px",
        display: "flex",
        height: "20px",
        minWidth: "20px",
        userSelect: "none",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "6px",
        paddingLeft: "4px",
        paddingRight: "4px",
        fontSize: "12px",
        fontWeight: "500",
        fontVariantNumeric: "tabular-nums",
        color: "#1f2937",
        top: "6px",
      }}
      {...props}
    />
  ),
);
SidebarMenuBadge.displayName = "SidebarMenuBadge";

const SidebarMenuSkeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    showIcon?: boolean;
  }
>(({ showIcon = false, ...props }, ref) => {
  // Random width between 50 to 90%.
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  }, []);

  return (
    <div
      ref={ref}
      data-sidebar="menu-skeleton"
      style={{
        display: "flex",
        height: "32px",
        alignItems: "center",
        gap: "8px",
        borderRadius: "6px",
        paddingLeft: "8px",
        paddingRight: "8px",
      }}
      {...props}
    >
      {showIcon && <Skeleton style={{ width: "16px", height: "16px", borderRadius: "6px" }} data-sidebar="menu-skeleton-icon" />}
      <Skeleton
        style={{
          height: "16px",
          maxWidth: width,
          flex: 1,
        } as React.CSSProperties}
        data-sidebar="menu-skeleton-text"
      />
    </div>
  );
});
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton";

const SidebarMenuSub = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(
  ({ ...props }, ref) => (
    <ul
      ref={ref}
      data-sidebar="menu-sub"
      style={{
        marginLeft: "14px",
        display: "flex",
        minWidth: "0",
        transform: "translateX(4px)",
        flexDirection: "column",
        gap: "4px",
        borderLeft: "1px solid #e5e7eb",
        paddingLeft: "10px",
        paddingTop: "2px",
        paddingBottom: "2px",
      }}
      {...props}
    />
  ),
);
SidebarMenuSub.displayName = "SidebarMenuSub";

const SidebarMenuSubItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(({ ...props }, ref) => (
  <li ref={ref} {...props} />
));
SidebarMenuSubItem.displayName = "SidebarMenuSubItem";

const SidebarMenuSubButton = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<"a"> & {
    asChild?: boolean;
    size?: "sm" | "md";
    isActive?: boolean;
  }
>(({ asChild = false, size = "md", isActive, ...props }, ref) => {
  const Comp = asChild ? Slot : "a";

  React.useEffect(() => {
    if (!document.querySelector('style[data-sidebar-menu-sub-button]')) {
      const styleEl = document.createElement('style');
      styleEl.setAttribute('data-sidebar-menu-sub-button', 'true');
      styleEl.textContent = `
        [data-sidebar="menu-sub-button"]:hover {
          background-color: #f3f4f6;
          color: #1f2937;
        }
        [data-sidebar="menu-sub-button"]:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px white, 0 0 0 4px rgba(59, 130, 246, 0.5);
        }
        [data-sidebar="menu-sub-button"][data-active="true"] {
          background-color: #f3f4f6;
          color: #1f2937;
        }
        [data-sidebar="menu-sub-button"][disabled] {
          pointer-events: none;
          opacity: 0.5;
        }
      `;
      document.head.appendChild(styleEl);
    }
  }, []);

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      style={{
        display: "flex",
        height: "28px",
        minWidth: "0",
        transform: "translateX(-4px)",
        alignItems: "center",
        gap: "8px",
        overflow: "hidden",
        borderRadius: "6px",
        paddingLeft: "8px",
        paddingRight: "8px",
        color: "#1f2937",
        outline: "none",
        transitionProperty: "background-color, color",
        transitionDuration: "200ms",
        fontSize: size === "sm" ? "12px" : "14px",
        cursor: "pointer",
      }}
      {...props}
    />
  );
});
SidebarMenuSubButton.displayName = "SidebarMenuSubButton";

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
};
