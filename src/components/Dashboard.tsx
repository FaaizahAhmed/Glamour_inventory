import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStats } from "@/services/inventoryApi";
import { Package, AlertCircle, TrendingUp, DollarSign } from "lucide-react";

function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
  });

  // stat cards data
  const statCards = [
    {
      title: "Total Items",
      value: stats?.totalItems.toString() || "0",
      icon: Package,
    },
    {
      title: "Low Stock Alerts",
      value: stats?.lowStockItems.toString() || "0",
      icon: AlertCircle,
    },
    {
      title: "Unique Products",
      value: stats?.uniqueItems.toString() || "0",
      icon: TrendingUp,
    },
    {
      title: "Total Value",
      value: stats ? `$${stats.totalValue.toFixed(2)}` : "$0.00",
      icon: DollarSign,
    },
  ];

  if (isLoading) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px" }}>
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            style={{
              padding: "24px",
              background: "#f5f5f5",
              borderRadius: "8px",
              height: "120px",
              animation: "pulse 2s infinite"
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px" }}>
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.title}
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "8px",
              border: "1px solid #e0e0e0",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <p style={{ fontSize: "14px", color: "gray", fontWeight: "500" }}>{stat.title}</p>
              <Icon style={{ width: "20px", height: "20px", color: "hsl(var(--primary))" }} />
            </div>
            <p style={{ fontSize: "28px", fontWeight: "bold" }}>{stat.value}</p>
          </div>
        );
      })}
    </div>
  );
}

export default Dashboard;
