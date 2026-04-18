import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUsers, createUser, updateUser, deleteUser, resetUserPassword, UserRecord } from '@/services/usersApi';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, KeyRound, Users as UsersIcon, ShieldCheck, Shield } from 'lucide-react';

const EMPTY_FORM = { username: '', email: '', password: '', name: '', role: 'moderator' as 'admin' | 'moderator' };

function Users() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [resetPasswordId, setResetPasswordId] = useState<string | null>(null);
  const [resetPasswordValue, setResetPasswordValue] = useState('');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'User created', description: `"${form.name}" has been added.` });
      setForm(EMPTY_FORM);
      setShowForm(false);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; email: string; role: 'admin' | 'moderator' } }) =>
      updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'User updated', description: `"${form.name}" has been updated.` });
      setForm(EMPTY_FORM);
      setEditingId(null);
      setShowForm(false);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'User deleted' });
      setDeleteConfirm(null);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setDeleteConfirm(null);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, pwd }: { id: string; pwd: string }) => resetUserPassword(id, pwd),
    onSuccess: () => {
      toast({ title: 'Password reset', description: 'Password has been updated successfully.' });
      setResetPasswordId(null);
      setResetPasswordValue('');
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  function handleEdit(u: UserRecord) {
    setEditingId(u._id);
    setForm({ username: u.username, email: u.email, password: '', name: u.name, role: u.role });
    setShowForm(true);
  }

  function handleCancel() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: { name: form.name, email: form.email, role: form.role } });
    } else {
      createMutation.mutate(form);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  const isBusy = createMutation.isPending || updateMutation.isPending;

  return (
    <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>User Management</h1>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>
            Manage system user accounts and roles (admin access only)
          </p>
        </div>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            style={{
              backgroundColor: 'hsl(var(--primary))',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            <Plus style={{ width: '16px', height: '16px' }} />
            Add User
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0' }}>
            {editingId ? 'Edit User' : 'Create New User'}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <Label htmlFor="name" style={{ fontSize: '14px', fontWeight: '500' }}>Full Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Jane Smith"
                required
                style={{ marginTop: '4px' }}
              />
            </div>
            <div>
              <Label htmlFor="username" style={{ fontSize: '14px', fontWeight: '500' }}>Username *</Label>
              <Input
                id="username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="e.g. janesmith"
                required
                disabled={!!editingId}
                style={{ marginTop: '4px', backgroundColor: editingId ? '#f9fafb' : undefined }}
              />
              {editingId && (
                <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>Username cannot be changed</p>
              )}
            </div>
            <div>
              <Label htmlFor="email" style={{ fontSize: '14px', fontWeight: '500' }}>Email *</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="e.g. jane@example.com"
                required
                style={{ marginTop: '4px' }}
              />
            </div>
            {!editingId && (
              <div>
                <Label htmlFor="password" style={{ fontSize: '14px', fontWeight: '500' }}>Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  required
                  style={{ marginTop: '4px' }}
                />
              </div>
            )}
            <div>
              <Label htmlFor="role" style={{ fontSize: '14px', fontWeight: '500' }}>Role *</Label>
              <select
                id="role"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as 'admin' | 'moderator' })}
                style={{
                  width: '100%',
                  marginTop: '4px',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                }}
              >
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '20px', justifyContent: 'flex-end' }}>
            <Button
              type="button"
              onClick={handleCancel}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #e5e7eb',
                color: '#374151',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isBusy}
              style={{
                backgroundColor: 'hsl(var(--primary))',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: isBusy ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                opacity: isBusy ? 0.7 : 1,
              }}
            >
              {isBusy ? 'Saving...' : editingId ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </form>
      )}

      {/* Users Table */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#9ca3af' }}>Loading users...</div>
      ) : users.length === 0 ? (
        <div
          style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '48px',
            textAlign: 'center',
          }}
        >
          <UsersIcon style={{ width: '48px', height: '48px', color: '#d1d5db', margin: '0 auto 12px' }} />
          <p style={{ color: '#6b7280', margin: 0 }}>No users found</p>
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['Name', 'Username', 'Email', 'Role', 'Joined', 'Actions'].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, idx) => {
                const isSelf = u._id === currentUser?._id;
                const isDeleteConfirming = deleteConfirm === u._id;
                const isResettingPassword = resetPasswordId === u._id;

                return (
                  <tr
                    key={u._id}
                    style={{
                      borderBottom: idx < users.length - 1 ? '1px solid #f3f4f6' : 'none',
                      backgroundColor: 'white',
                    }}
                  >
                    <td style={{ padding: '14px 16px', fontWeight: '500', fontSize: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            backgroundColor: 'hsl(var(--primary))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            flexShrink: 0,
                          }}
                        >
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span>
                          {u.name}
                          {isSelf && (
                            <span
                              style={{
                                fontSize: '10px',
                                color: '#6b7280',
                                backgroundColor: '#f3f4f6',
                                padding: '1px 6px',
                                borderRadius: '999px',
                                marginLeft: '6px',
                              }}
                            >
                              you
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#6b7280', fontSize: '14px' }}>@{u.username}</td>
                    <td style={{ padding: '14px 16px', color: '#374151', fontSize: '14px' }}>{u.email}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          padding: '3px 10px',
                          borderRadius: '999px',
                          backgroundColor: u.role === 'admin' ? '#fef3c7' : '#dbeafe',
                          color: u.role === 'admin' ? '#92400e' : '#1e40af',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {u.role === 'admin' ? (
                          <ShieldCheck style={{ width: '12px', height: '12px' }} />
                        ) : (
                          <Shield style={{ width: '12px', height: '12px' }} />
                        )}
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#9ca3af', fontSize: '13px' }}>{formatDate(u.createdAt)}</td>
                    <td style={{ padding: '14px 16px' }}>
                      {isDeleteConfirming ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '12px', color: '#ef4444' }}>Delete?</span>
                          <Button
                            onClick={() => deleteMutation.mutate(u._id)}
                            disabled={deleteMutation.isPending}
                            style={{
                              backgroundColor: '#ef4444',
                              color: 'white',
                              border: 'none',
                              padding: '4px 10px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                            }}
                          >
                            Yes
                          </Button>
                          <Button
                            onClick={() => setDeleteConfirm(null)}
                            style={{
                              backgroundColor: 'transparent',
                              border: '1px solid #e5e7eb',
                              color: '#374151',
                              padding: '4px 10px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                            }}
                          >
                            No
                          </Button>
                        </div>
                      ) : isResettingPassword ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Input
                            type="password"
                            value={resetPasswordValue}
                            onChange={(e) => setResetPasswordValue(e.target.value)}
                            placeholder="New password"
                            autoFocus
                            style={{ width: '140px', padding: '4px 8px', fontSize: '13px', height: '30px' }}
                          />
                          <Button
                            onClick={() => {
                              if (resetPasswordValue.length < 6) {
                                toast({ title: 'Error', description: 'Password must be at least 6 characters.', variant: 'destructive' });
                                return;
                              }
                              resetPasswordMutation.mutate({ id: u._id, pwd: resetPasswordValue });
                            }}
                            disabled={resetPasswordMutation.isPending}
                            style={{
                              backgroundColor: 'hsl(var(--primary))',
                              color: 'white',
                              border: 'none',
                              padding: '4px 10px',
                              borderRadius: '4px',
                              cursor: resetPasswordMutation.isPending ? 'not-allowed' : 'pointer',
                              fontSize: '12px',
                              opacity: resetPasswordMutation.isPending ? 0.7 : 1,
                            }}
                          >
                            Save
                          </Button>
                          <Button
                            onClick={() => { setResetPasswordId(null); setResetPasswordValue(''); }}
                            style={{
                              backgroundColor: 'transparent',
                              border: '1px solid #e5e7eb',
                              color: '#374151',
                              padding: '4px 10px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <Button
                            onClick={() => handleEdit(u)}
                            style={{
                              backgroundColor: 'transparent',
                              border: '1px solid #e5e7eb',
                              color: '#374151',
                              padding: '5px 10px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '13px',
                            }}
                          >
                            <Pencil style={{ width: '13px', height: '13px' }} />
                            Edit
                          </Button>
                          <Button
                            onClick={() => { setResetPasswordId(u._id); setResetPasswordValue(''); }}
                            style={{
                              backgroundColor: 'transparent',
                              border: '1px solid #bfdbfe',
                              color: '#2563eb',
                              padding: '5px 10px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '13px',
                            }}
                          >
                            <KeyRound style={{ width: '13px', height: '13px' }} />
                            Reset Pwd
                          </Button>
                          <Button
                            onClick={() => setDeleteConfirm(u._id)}
                            disabled={isSelf}
                            title={isSelf ? 'You cannot delete your own account' : 'Delete user'}
                            style={{
                              backgroundColor: isSelf ? '#f9fafb' : 'transparent',
                              border: `1px solid ${isSelf ? '#e5e7eb' : '#fca5a5'}`,
                              color: isSelf ? '#d1d5db' : '#ef4444',
                              padding: '5px 10px',
                              borderRadius: '4px',
                              cursor: isSelf ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '13px',
                            }}
                          >
                            <Trash2 style={{ width: '13px', height: '13px' }} />
                            Delete
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Users;
