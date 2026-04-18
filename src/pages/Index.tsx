import Dashboard from "@/components/Dashboard";
import StockChart from "@/components/StockChart";
import AIChat from "@/components/AIChat";
import { Sparkles } from "lucide-react";

function Index() {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(to bottom right, white, white, rgba(248, 248, 255, 0.3))" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 16px", paddingTop: "64px" }}>
        <div style={{ marginBottom: "48px" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
              <Sparkles style={{ width: "32px", height: "32px", color: "hsl(var(--primary))" }} />
              <h1 style={{ fontSize: "32px", fontWeight: "bold", margin: 0 }}>Dashboard</h1>
            </div>
            <p style={{ color: "#6b7280", fontSize: "18px", margin: "8px 0 0 0" }}>
              Overview of your inventory
            </p>
          </div>
        </div>

        <div style={{ marginBottom: "32px" }}>
          <Dashboard />
        </div>

        <div style={{ marginBottom: "32px" }}>
          <StockChart />
        </div>

        <div style={{ marginBottom: "32px" }}>
          <AIChat />
        </div>
      </div>
    </div>
  );
}

export default Index;
