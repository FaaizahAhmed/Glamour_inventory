import { useQuery } from "@tanstack/react-query";
import { fetchInventoryItems } from "@/services/inventoryApi";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

// colors for charts
const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

function StockChart() {
  // fetch inventory items
  const { data: items, isLoading } = useQuery({
    queryKey: ["inventory-items"],
    queryFn: fetchInventoryItems,
  });

  // show loading state
  if (isLoading) {
    return (
      <div style={{
        padding: "24px",
        background: "#f5f5f5",
        borderRadius: "8px",
        height: "400px",
        animation: "pulse 2s infinite"
      }} />
    );
  }

  // group items by category
  const categoryData = items?.reduce((acc: any, item) => {
    const catName = typeof item.category === 'object' ? item.category.name : (item.category || 'Uncategorised');
    if (!acc[catName]) {
      acc[catName] = { name: catName, value: 0, quantity: 0 };
    }
    acc[catName].value += item.total_value || 0;
    acc[catName].quantity += item.quantity;
    return acc;
  }, {});

  // prepare pie chart data
  const pieData = Object.values(categoryData || {}) as any[];
  
  // prepare bar chart data - top 10 items
  const barData = items?.slice(0, 10).map(item => ({
    name: item.name.length > 15 ? item.name.substring(0, 15) + "..." : item.name,
    quantity: item.quantity,
  })) || [];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px" }}>
      {/* Pie Chart */}
      <div style={{
        background: "white",
        padding: "24px",
        borderRadius: "8px",
        border: "1px solid #e0e0e0",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
      }}>
        <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>Stock by Category</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              outerRadius={80}
              fill="#3b82f6"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart */}
      <div style={{
        background: "white",
        padding: "24px",
        borderRadius: "8px",
        border: "1px solid #e0e0e0",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
      }}>
        <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>Top 10 Items by Quantity</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: "#666", fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fill: "#666" }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "white",
                border: "1px solid #e0e0e0",
                borderRadius: "4px"
              }}
            />
            <Bar dataKey="quantity" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default StockChart;
