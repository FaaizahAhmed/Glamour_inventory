import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, BarChart3, Package, Home, LogOut, User, Tag, Truck, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { logoutUser } from "@/services/authApi";
import { useToast } from "@/hooks/use-toast";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const BASE_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/", icon: <Home style={{ width: "20px", height: "20px" }} /> },
  { label: "Inventory", href: "/inventory", icon: <Package style={{ width: "20px", height: "20px" }} /> },
  { label: "Categories", href: "/categories", icon: <Tag style={{ width: "20px", height: "20px" }} /> },
  { label: "Suppliers", href: "/suppliers", icon: <Truck style={{ width: "20px", height: "20px" }} /> },
  { label: "Profile", href: "/profile", icon: <User style={{ width: "20px", height: "20px" }} /> },
];

const ADMIN_NAV_ITEM: NavItem = {
  label: "Users",
  href: "/users",
  icon: <Users style={{ width: "20px", height: "20px" }} />,
};

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const navItems = user?.role === 'admin'
    ? [...BASE_NAV_ITEMS.slice(0, -1), ADMIN_NAV_ITEM, BASE_NAV_ITEMS[BASE_NAV_ITEMS.length - 1]]
    : BASE_NAV_ITEMS;

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      logout();
      toast({
        title: 'Success',
        description: 'Logged out successfully',
      });
      navigate('/login');
    } catch (error) {
      // Log out anyway even if API call fails
      logout();
      navigate('/login');
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleSidebar}
        style={{
          position: "fixed",
          top: "16px",
          left: "16px",
          zIndex: 50,
          display: window.innerWidth >= 768 ? "none" : "block",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "4px",
        }}
        aria-label="Toggle sidebar"
      >
        {isOpen ? (
          <X style={{ width: "24px", height: "24px" }} />
        ) : (
          <Menu style={{ width: "24px", height: "24px" }} />
        )}
      </button>

      {/* Sidebar */}
      <aside
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          height: "100vh",
          width: "256px",
          backgroundColor: "white",
          borderRight: "1px solid #e5e7eb",
          transition: "all 0.3s ease-in-out",
          zIndex: 40,
          transform: window.innerWidth >= 768 || isOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        {/* Logo Section */}
        <div style={{ padding: "24px", borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <img 
              src="/makeup.png" 
              alt="Glamour" 
              style={{ width: "32px", height: "32px", objectFit: "contain" }}
            />
            <div style={{ fontSize: "20px", fontWeight: "bold", color: "hsl(var(--primary))" }}>
              Glamour
            </div>
          </div>
          <p style={{ fontSize: "12px", color: "#6b7280", textAlign: "center", marginTop: "4px" }}>
            Inventory Manager
          </p>
        </div>

        {/* Navigation Items */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "16px", marginBottom: "200px" }}>
          {navItems.map((item) => (
            <Link key={item.href} to={item.href} style={{ textDecoration: "none" }}>
              <Button
                style={{
                  width: "100%",
                  justifyContent: "flex-start",
                  gap: "12px",
                  backgroundColor: location.pathname === item.href ? "hsl(var(--primary))" : "transparent",
                  color: location.pathname === item.href ? "white" : "inherit",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
                onClick={() => {
                  if (window.innerWidth < 768) {
                    setIsOpen(false);
                  }
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </Button>
            </Link>
          ))}
        </nav>

        {/* User Section Footer */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px", borderTop: "1px solid #e5e7eb", backgroundColor: "white" }}>
          {/* User info */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", padding: "8px", backgroundColor: "#f9fafb", borderRadius: "4px" }}>
            <div style={{ 
              width: "32px", 
              height: "32px", 
              borderRadius: "50%", 
              backgroundColor: "hsl(var(--primary))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: "14px"
            }}>
              {user?.name?.charAt(0).toUpperCase() || <User style={{ width: "16px", height: "16px" }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <p style={{ fontSize: "14px", fontWeight: "500", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user?.name || 'User'}
                </p>
                <span style={{
                  fontSize: "10px",
                  fontWeight: "600",
                  padding: "1px 6px",
                  borderRadius: "999px",
                  backgroundColor: user?.role === 'admin' ? "#fef3c7" : "#dbeafe",
                  color: user?.role === 'admin' ? "#92400e" : "#1e40af",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  flexShrink: 0,
                }}>
                  {user?.role || 'moderator'}
                </span>
              </div>
              <p style={{ fontSize: "11px", color: "#6b7280", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.email || ''}
              </p>
            </div>
          </div>
          
          {/* Logout button */}
          <Button
            onClick={handleLogout}
            style={{
              width: "100%",
              justifyContent: "center",
              gap: "8px",
              backgroundColor: "transparent",
              color: "#ef4444",
              border: "1px solid #fca5a5",
              padding: "6px 12px",
              borderRadius: "4px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            <LogOut style={{ width: "16px", height: "16px" }} />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 30,
            display: window.innerWidth >= 768 ? "none" : "block",
          }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
