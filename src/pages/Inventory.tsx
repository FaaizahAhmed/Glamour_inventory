import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchInventoryItems, deleteInventoryItem, InventoryItem } from "@/services/inventoryApi";
import { fetchCategories } from "@/services/categoryApi";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Search, Download, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import InventoryDialog from "@/components/InventoryDialog";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";

// Helper: get category name from populated or string category
function getCategoryName(category: InventoryItem['category']): string {
  if (!category) return '—';
  if (typeof category === 'object') return category.name;
  return category;
}

function getCategoryColor(category: InventoryItem['category']): string {
  if (typeof category === 'object') return category.color || '#a855f7';
  return '#a855f7';
}

function getSupplierName(supplier: InventoryItem['supplier']): string {
  if (!supplier) return '—';
  if (typeof supplier === 'object') return supplier.name;
  return supplier;
}

function InventoryPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [sortField, setSortField] = useState<'name' | 'quantity' | 'unit_price' | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["inventory-items"],
    queryFn: fetchInventoryItems,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInventoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
      toast({ title: "Item deleted", description: "The item has been removed from inventory." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to delete item.", variant: "destructive" });
    },
  });

  // Filtered + sorted items
  const filteredItems = useMemo(() => {
    let result = items.filter(item => {
      const catName = getCategoryName(item.category).toLowerCase();
      const matchesSearch = !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.brand || '').toLowerCase().includes(search.toLowerCase()) ||
        catName.includes(search.toLowerCase()) ||
        (item.sku || '').toLowerCase().includes(search.toLowerCase());

      const matchesCategory = !categoryFilter || (
        typeof item.category === 'object'
          ? item.category._id === categoryFilter
          : item.category === categoryFilter
      );

      const matchesLowStock = !lowStockOnly || item.quantity <= (item.min_stock_level || 10);

      return matchesSearch && matchesCategory && matchesLowStock;
    });

    if (sortField) {
      result = [...result].sort((a, b) => {
        let aVal: string | number = sortField === 'name' ? (a.name || '') : (a[sortField] ?? 0);
        let bVal: string | number = sortField === 'name' ? (b.name || '') : (b[sortField] ?? 0);
        if (typeof aVal === 'string') return sortDir === 'asc' ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal);
        return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
      });
    }

    return result;
  }, [items, search, categoryFilter, lowStockOnly, sortField, sortDir]);

  const handleEdit = (item: InventoryItem) => { setSelectedItem(item); setDialogOpen(true); };
  const handleAdd = () => { setSelectedItem(null); setDialogOpen(true); };
  const handleDelete = (item: InventoryItem) => { setSelectedItem(item); setDeleteDialogOpen(true); };
  const handleConfirmDelete = () => {
    if (selectedItem) { deleteMutation.mutate(selectedItem._id); setDeleteDialogOpen(false); }
  };
  const handleSort = (field: 'name' | 'quantity' | 'unit_price') => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const exportCSV = () => {
    const headers = ['Name', 'Brand', 'Category', 'SKU', 'Quantity', 'Min Stock', 'Unit Price', 'Total Value', 'Supplier', 'Added By'];
    const rows = filteredItems.map(item => [
      item.name,
      item.brand || '',
      getCategoryName(item.category),
      item.sku || '',
      item.quantity,
      item.min_stock_level || 10,
      item.unit_price?.toFixed(2) || '0.00',
      item.total_value?.toFixed(2) || '0.00',
      getSupplierName(item.supplier),
      typeof item.createdBy === 'object' && item.createdBy ? item.createdBy.name : '',
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  if (isLoading) {
    return <div style={{ textAlign: "center", paddingTop: "64px", color: "gray" }}>Loading inventory...</div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(to right, rgb(255,255,255), rgb(240,240,245))" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", paddingTop: "80px", paddingBottom: "32px", paddingLeft: "16px", paddingRight: "16px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "8px" }}>Inventory Management</h1>
            <p style={{ color: "gray", fontSize: "14px" }}>Add, edit, and manage makeup products</p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <Button
              onClick={exportCSV}
              style={{ backgroundColor: "transparent", border: "1px solid #e5e7eb", color: "#374151", padding: "10px 16px", display: "flex", alignItems: "center", gap: "8px" }}
            >
              <Download style={{ width: "16px", height: "16px" }} />
              Export CSV
            </Button>
            <Button onClick={handleAdd} style={{ backgroundColor: "hsl(var(--primary))", padding: "12px 24px" }}>
              <Plus style={{ width: "20px", height: "20px", marginRight: "8px" }} />
              Add Item
            </Button>
          </div>
        </div>

        {/* Stats boxes */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          {[
            { label: "Total Items", value: items.reduce((s, i) => s + i.quantity, 0), color: "inherit" },
            { label: "Products", value: items.length, color: "inherit" },
            { label: "Low Stock", value: items.filter(i => i.quantity <= (i.min_stock_level || 10)).length, color: "red" },
            { label: "Total Value", value: `$${items.reduce((s, i) => s + (i.total_value || 0), 0).toFixed(2)}`, color: "hsl(var(--primary))" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: "white", padding: "16px", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
              <p style={{ fontSize: "12px", color: "gray", marginBottom: "8px" }}>{label}</p>
              <p style={{ fontSize: "24px", fontWeight: "bold", color }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Search and Filter Bar */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center", background: "white", padding: "16px", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
          {/* Search input */}
          <div style={{ position: "relative", flex: "1 1 200px", minWidth: "200px" }}>
            <Search style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#9ca3af", pointerEvents: "none" }} />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, brand, SKU..."
              style={{ paddingLeft: "34px" }}
            />
          </div>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #e5e7eb", fontSize: "14px", background: "white", color: "#111", minWidth: "160px" }}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>

          {/* Low stock toggle */}
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px", whiteSpace: "nowrap" }}>
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={e => setLowStockOnly(e.target.checked)}
              style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "hsl(var(--primary))" }}
            />
            Low stock only
          </label>

          {/* Result count */}
          {(search || categoryFilter || lowStockOnly) && (
            <span style={{ fontSize: "13px", color: "#6b7280" }}>
              {filteredItems.length} of {items.length} items
            </span>
          )}

          {/* Clear filters */}
          {(search || categoryFilter || lowStockOnly) && (
            <button
              onClick={() => { setSearch(''); setCategoryFilter(''); setLowStockOnly(false); }}
              style={{ fontSize: "13px", color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Table */}
        <div style={{ border: "1px solid #e0e0e0", borderRadius: "8px", overflow: "hidden", background: "white" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f5f5f5" }}>
              <tr>
                {(["Name", "Brand", "Category", "Supplier", "SKU", "Qty", "Min", "Price", "Value", "Added By", "Actions"] as const).map(h => {
                  const sortKey = h === "Name" ? "name" : h === "Qty" ? "quantity" : h === "Price" ? "unit_price" : null;
                  const isSorted = sortKey && sortField === sortKey;
                  return (
                    <th
                      key={h}
                      onClick={sortKey ? () => handleSort(sortKey) : undefined}
                      style={{
                        padding: "12px",
                        textAlign: h === "Name" || h === "Brand" || h === "Category" || h === "Supplier" || h === "SKU" ? "left" : "right",
                        borderBottom: "1px solid #e0e0e0",
                        fontSize: "13px",
                        fontWeight: "600",
                        color: isSorted ? "hsl(var(--primary))" : "#374151",
                        cursor: sortKey ? "pointer" : "default",
                        userSelect: "none",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        {h}
                        {sortKey && (
                          isSorted
                            ? (sortDir === 'asc'
                                ? <ArrowUp style={{ width: "13px", height: "13px" }} />
                                : <ArrowDown style={{ width: "13px", height: "13px" }} />)
                            : <ArrowUpDown style={{ width: "13px", height: "13px", opacity: 0.4 }} />
                        )}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {filteredItems.length > 0 ? filteredItems.map((item) => (
                <tr
                  key={item._id}
                  style={{ borderBottom: "1px solid #e0e0e0", background: item.quantity <= (item.min_stock_level || 10) ? "#fff1f1" : "white" }}
                >
                  <td style={{ padding: "12px", fontWeight: "600" }}>{item.name}</td>
                  <td style={{ padding: "12px", color: "gray", fontSize: "13px" }}>{item.brand || "—"}</td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ background: getCategoryColor(item.category) + '22', color: getCategoryColor(item.category), padding: "3px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "500", border: `1px solid ${getCategoryColor(item.category)}44` }}>
                      {getCategoryName(item.category)}
                    </span>
                  </td>
                  <td style={{ padding: "12px", color: "gray", fontSize: "13px" }}>{getSupplierName(item.supplier)}</td>
                  <td style={{ padding: "12px", color: "gray", fontSize: "12px" }}>{item.sku || "—"}</td>
                  <td style={{ padding: "12px", textAlign: "right", fontWeight: "bold", color: item.quantity <= (item.min_stock_level || 10) ? "#ef4444" : "inherit" }}>{item.quantity}</td>
                  <td style={{ padding: "12px", textAlign: "right", color: "gray" }}>{item.min_stock_level || 10}</td>
                  <td style={{ padding: "12px", textAlign: "right" }}>${item.unit_price?.toFixed(2) || "0.00"}</td>
                  <td style={{ padding: "12px", textAlign: "right", fontWeight: "500", color: "hsl(var(--primary))" }}>${item.total_value?.toFixed(2) || "0.00"}</td>
                  <td style={{ padding: "12px", fontSize: "12px", color: "#6b7280" }}>
                    {typeof item.createdBy === 'object' && item.createdBy ? item.createdBy.name : '—'}
                  </td>
                  <td style={{ padding: "12px", textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "4px" }}>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(item)} style={{ padding: "6px" }}>
                        <Pencil style={{ width: "15px", height: "15px", color: "hsl(var(--primary))" }} />
                      </Button>
                      {isAdmin && (
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(item)} style={{ padding: "6px" }}>
                          <Trash2 style={{ width: "15px", height: "15px", color: "red" }} />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                    <td colSpan={11} style={{ padding: "48px 12px", textAlign: "center" }}>
                    {items.length === 0 ? (
                      <div>
                        <p style={{ color: "gray", marginBottom: "16px" }}>No inventory items yet</p>
                        <Button onClick={handleAdd}><Plus style={{ width: "16px", height: "16px", marginRight: "8px" }} />Create Your First Item</Button>
                      </div>
                    ) : (
                      <p style={{ color: "gray" }}>No items match your filters.</p>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      <InventoryDialog open={dialogOpen} onOpenChange={setDialogOpen} item={selectedItem} />
      <DeleteConfirmationDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} item={selectedItem} onConfirm={handleConfirmDelete} isLoading={deleteMutation.isPending} />
    </div>
  );
}

export default InventoryPage;
