import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCategories, createCategory, updateCategory, deleteCategory, Category } from '@/services/categoryApi';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';

const PRESET_COLORS = [
  '#a855f7', '#ec4899', '#f97316', '#eab308',
  '#22c55e', '#06b6d4', '#3b82f6', '#ef4444',
];

const EMPTY_FORM = { name: '', description: '', color: '#a855f7', icon: 'tag' };

function Categories() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: 'Category created', description: `"${form.name}" has been added.` });
      setForm(EMPTY_FORM);
      setShowForm(false);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof EMPTY_FORM }) => updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: 'Category updated', description: `"${form.name}" has been updated.` });
      setForm(EMPTY_FORM);
      setEditingId(null);
      setShowForm(false);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: 'Category deleted' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const handleEdit = (cat: Category) => {
    setForm({ name: cat.name, description: cat.description || '', color: cat.color, icon: cat.icon });
    setEditingId(cat._id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
    setDeleteConfirm(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleCancel = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '30px', fontWeight: 'bold' }}>Categories</h1>
            <p style={{ color: '#6b7280', marginTop: '4px' }}>Organise your inventory by product categories</p>
          </div>
          {isAdmin && !showForm && (
            <Button
              onClick={() => setShowForm(true)}
              style={{ backgroundColor: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Plus style={{ width: '16px', height: '16px' }} />
              Add Category
            </Button>
          )}
        </div>

        {/* Form */}
        {showForm && isAdmin && (
          <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
              {editingId ? 'Edit Category' : 'New Category'}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Label htmlFor="cat-name">Name *</Label>
                  <Input
                    id="cat-name"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g., Lipstick"
                    required
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Label htmlFor="cat-desc">Description</Label>
                  <Input
                    id="cat-desc"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="e.g., Lip colour products"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Label>Color</Label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, color: c }))}
                      style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        backgroundColor: c, border: form.color === c ? '3px solid #111' : '2px solid transparent',
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Saving...' : editingId ? 'Update Category' : 'Create Category'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
              </div>
            </form>
          </div>
        )}

        {/* Categories Grid */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>Loading categories...</div>
        ) : categories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280', border: '2px dashed #e5e7eb', borderRadius: '8px' }}>
            <Tag style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: '#d1d5db' }} />
            <p style={{ fontSize: '18px', fontWeight: '500' }}>No categories yet</p>
            {isAdmin && <p style={{ fontSize: '14px', marginTop: '8px' }}>Click "Add Category" to create your first category.</p>}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {categories.map((cat) => (
              <div
                key={cat._id}
                style={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '20px',
                  borderLeft: `4px solid ${cat.color}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{
                      width: '12px', height: '12px', borderRadius: '50%',
                      backgroundColor: cat.color, flexShrink: 0,
                    }} />
                    <p style={{ fontWeight: '600', fontSize: '16px' }}>{cat.name}</p>
                  </div>
                  {cat.description && (
                    <p style={{ fontSize: '13px', color: '#6b7280' }}>{cat.description}</p>
                  )}
                </div>
                {isAdmin && (
                  <div style={{ display: 'flex', gap: '4px', marginLeft: '12px', flexShrink: 0 }}>
                    {deleteConfirm === cat._id ? (
                      <>
                        <span style={{ fontSize: '11px', color: '#ef4444', alignSelf: 'center' }}>Delete?</span>
                        <button
                          onClick={() => handleDelete(cat._id)}
                          style={{ padding: '4px 8px', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', fontSize: '12px' }}
                        >Yes</button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          style={{ padding: '4px 8px', background: 'transparent', border: '1px solid #e5e7eb', cursor: 'pointer', borderRadius: '4px', fontSize: '12px' }}
                        >No</button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(cat)}
                          style={{ padding: '6px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                        >
                          <Pencil style={{ width: '15px', height: '15px', color: 'hsl(var(--primary))' }} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(cat._id)}
                          style={{ padding: '6px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                        >
                          <Trash2 style={{ width: '15px', height: '15px', color: '#ef4444' }} />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Categories;
