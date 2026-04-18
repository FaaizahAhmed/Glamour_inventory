import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSuppliers, createSupplier, updateSupplier, deleteSupplier, Supplier } from '@/services/supplierApi';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, Truck } from 'lucide-react';

const EMPTY_FORM = { name: '', contact_person: '', email: '', phone: '', address: '', city: '', country: '' };

function Suppliers() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: fetchSuppliers,
  });

  const createMutation = useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({ title: 'Supplier created', description: `"${form.name}" has been added.` });
      setForm(EMPTY_FORM);
      setShowForm(false);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof EMPTY_FORM }) => updateSupplier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({ title: 'Supplier updated', description: `"${form.name}" has been updated.` });
      setForm(EMPTY_FORM);
      setEditingId(null);
      setShowForm(false);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({ title: 'Supplier deleted' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const handleEdit = (s: Supplier) => {
    setForm({
      name: s.name,
      contact_person: s.contact_person || '',
      email: s.email || '',
      phone: s.phone || '',
      address: s.address || '',
      city: s.city || '',
      country: s.country || '',
    });
    setEditingId(s._id);
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
            <h1 style={{ fontSize: '30px', fontWeight: 'bold' }}>Suppliers</h1>
            <p style={{ color: '#6b7280', marginTop: '4px' }}>Manage your product suppliers and vendor contacts</p>
          </div>
          {isAdmin && !showForm && (
            <Button
              onClick={() => setShowForm(true)}
              style={{ backgroundColor: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Plus style={{ width: '16px', height: '16px' }} />
              Add Supplier
            </Button>
          )}
        </div>

        {/* Form */}
        {showForm && isAdmin && (
          <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
              {editingId ? 'Edit Supplier' : 'New Supplier'}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Label htmlFor="sup-name">Company Name *</Label>
                  <Input
                    id="sup-name"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g., Glamour Supplies Ltd"
                    required
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Label htmlFor="sup-contact">Contact Person</Label>
                  <Input
                    id="sup-contact"
                    value={form.contact_person}
                    onChange={e => setForm(f => ({ ...f, contact_person: e.target.value }))}
                    placeholder="e.g., Sarah Ahmed"
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Label htmlFor="sup-email">Email</Label>
                  <Input
                    id="sup-email"
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="e.g., orders@glamoursupplies.com"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Label htmlFor="sup-phone">Phone</Label>
                  <Input
                    id="sup-phone"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="e.g., +60 12-345 6789"
                  />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Label htmlFor="sup-address">Address</Label>
                <Input
                  id="sup-address"
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="e.g., 12 Jalan Bukit Bintang"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Label htmlFor="sup-city">City</Label>
                  <Input
                    id="sup-city"
                    value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    placeholder="e.g., Kuala Lumpur"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Label htmlFor="sup-country">Country</Label>
                  <Input
                    id="sup-country"
                    value={form.country}
                    onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                    placeholder="e.g., Malaysia"
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Saving...' : editingId ? 'Update Supplier' : 'Create Supplier'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
              </div>
            </form>
          </div>
        )}

        {/* Suppliers Table */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>Loading suppliers...</div>
        ) : suppliers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280', border: '2px dashed #e5e7eb', borderRadius: '8px' }}>
            <Truck style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: '#d1d5db' }} />
            <p style={{ fontSize: '18px', fontWeight: '500' }}>No suppliers yet</p>
            {isAdmin && <p style={{ fontSize: '14px', marginTop: '8px' }}>Click "Add Supplier" to add your first supplier.</p>}
          </div>
        ) : (
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f9fafb' }}>
                <tr>
                  {['Company', 'Contact Person', 'Email', 'Phone', 'City', 'Country', ...(isAdmin ? ['Actions'] : [])].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {suppliers.map((s) => (
                  <tr key={s._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '500' }}>{s.name}</td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>{s.contact_person || '—'}</td>
                    <td style={{ padding: '12px 16px', color: '#6b7280' }}>{s.email || '—'}</td>
                    <td style={{ padding: '12px 16px', color: '#6b7280' }}>{s.phone || '—'}</td>
                    <td style={{ padding: '12px 16px', color: '#6b7280' }}>{s.city || '—'}</td>
                    <td style={{ padding: '12px 16px', color: '#6b7280' }}>{s.country || '—'}</td>
                    {isAdmin && (
                      <td style={{ padding: '12px 16px' }}>
                        {deleteConfirm === s._id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '12px', color: '#ef4444' }}>Delete?</span>
                            <button
                              onClick={() => handleDelete(s._id)}
                              style={{ padding: '4px 10px', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', fontSize: '12px' }}
                            >Yes</button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              style={{ padding: '4px 10px', background: 'transparent', border: '1px solid #e5e7eb', cursor: 'pointer', borderRadius: '4px', fontSize: '12px' }}
                            >No</button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              onClick={() => handleEdit(s)}
                              style={{ padding: '6px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                            >
                              <Pencil style={{ width: '15px', height: '15px', color: 'hsl(var(--primary))' }} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(s._id)}
                              style={{ padding: '6px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                            >
                              <Trash2 style={{ width: '15px', height: '15px', color: '#ef4444' }} />
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Suppliers;
