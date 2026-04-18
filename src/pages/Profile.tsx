import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile, UpdateProfileData } from '@/services/authApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User as UserIcon, KeyRound } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/auth';

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

function Profile() {
  const [isLoading, setIsLoading] = useState(false);
  const [isPwdLoading, setIsPwdLoading] = useState(false);
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm<UpdateProfileData>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    }
  });
  const { register: registerPwd, handleSubmit: handlePwdSubmit, reset: resetPwd, formState: { errors: pwdErrors } } = useForm<PasswordFormData>();

  const onSubmit = async (data: UpdateProfileData) => {
    setIsLoading(true);

    try {
      const response = await updateProfile(data);

      if (response.success && response.data) {
        updateUser(response.data.user);
        
        toast({
          title: 'Success',
          description: 'Profile updated successfully',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onPwdSubmit = async (data: PasswordFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      toast({ title: 'Error', description: 'New passwords do not match', variant: 'destructive' });
      return;
    }
    setIsPwdLoading(true);
    try {
      const res = await fetch(`${API_URL}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ currentPassword: data.currentPassword, newPassword: data.newPassword }),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message);
      toast({ title: 'Password changed', description: 'Your password has been updated successfully.' });
      resetPwd();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to change password', variant: 'destructive' });
    } finally {
      setIsPwdLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 style={{ width: "32px", height: "32px", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  return (
    <div style={{ padding: "32px" }}>
      <div style={{ maxWidth: "1024px", margin: "0 auto" }}>
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "30px", fontWeight: "bold" }}>Profile Settings</h1>
          <p style={{ color: "#6b7280", marginTop: "8px" }}>
            Manage your account information
          </p>
        </div>

        <div style={{ display: "grid", gap: "24px" }}>
          {/* User Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
              <CardDescription>
                View your account details
              </CardDescription>
            </CardHeader>
            <CardContent style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "hsl(var(--primary))", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "30px", fontWeight: "bold" }}>
                  {user?.name?.charAt(0).toUpperCase() || <UserIcon style={{ width: "40px", height: "40px" }} />}
                </div>
                <div>
                  <p style={{ fontSize: "20px", fontWeight: "600" }}>{user?.name}</p>
                  <p style={{ color: "#6b7280" }}>{user?.email}</p>
                  <p style={{ fontSize: "14px", color: "#9ca3af", marginTop: "4px" }}>@{user?.username}</p>
                </div>
              </div>

              <Separator />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", fontSize: "14px" }}>
                <div>
                  <p style={{ color: "#6b7280" }}>Member Since</p>
                  <p style={{ fontWeight: "500" }}>
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p style={{ color: "#6b7280" }}>Last Updated</p>
                  <p style={{ fontWeight: "500" }}>
                    {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>
                Update your name and email address
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    {...register('name', {
                      required: 'Name is required',
                      minLength: {
                        value: 2,
                        message: 'Name must be at least 2 characters'
                      }
                    })}
                    disabled={isLoading}
                  />
                  {errors.name && (
                    <p style={{ fontSize: "14px", color: "#dc2626" }}>{errors.name.message}</p>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^\S+@\S+\.\S+$/,
                        message: 'Please enter a valid email address'
                      }
                    })}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p style={{ fontSize: "14px", color: "#dc2626" }}>{errors.email.message}</p>
                  )}
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <Button
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 style={{ marginRight: "8px", width: "16px", height: "16px", animation: "spin 1s linear infinite" }} />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Change Password Card */}
          <Card>
            <CardHeader>
              <CardTitle style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <KeyRound style={{ width: "18px", height: "18px" }} />
                Change Password
              </CardTitle>
              <CardDescription>Update your login password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePwdSubmit(onPwdSubmit)} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="Enter your current password"
                    {...registerPwd('currentPassword', { required: 'Current password is required' })}
                    disabled={isPwdLoading}
                  />
                  {pwdErrors.currentPassword && <p style={{ fontSize: "14px", color: "#dc2626" }}>{pwdErrors.currentPassword.message}</p>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Minimum 6 characters"
                    {...registerPwd('newPassword', { required: 'New password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
                    disabled={isPwdLoading}
                  />
                  {pwdErrors.newPassword && <p style={{ fontSize: "14px", color: "#dc2626" }}>{pwdErrors.newPassword.message}</p>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter new password"
                    {...registerPwd('confirmPassword', { required: 'Please confirm your new password' })}
                    disabled={isPwdLoading}
                  />
                  {pwdErrors.confirmPassword && <p style={{ fontSize: "14px", color: "#dc2626" }}>{pwdErrors.confirmPassword.message}</p>}
                </div>
                <div>
                  <Button type="submit" disabled={isPwdLoading}>
                    {isPwdLoading ? (
                      <><Loader2 style={{ marginRight: "8px", width: "16px", height: "16px", animation: "spin 1s linear infinite" }} />Changing...</>
                    ) : 'Change Password'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Account Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle>Account Statistics</CardTitle>
              <CardDescription>
                Your activity overview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px" }}>
                <div style={{ padding: "16px", background: "rgba(168, 85, 247, 0.1)", borderRadius: "8px" }}>
                  <p style={{ fontSize: "14px", color: "#6b7280" }}>Account Status</p>
                  <p style={{ fontSize: "20px", fontWeight: "600", color: "#a855f7" }}>Active</p>
                </div>
                <div style={{ padding: "16px", background: "rgba(59, 130, 246, 0.1)", borderRadius: "8px" }}>
                  <p style={{ fontSize: "14px", color: "#6b7280" }}>User ID</p>
                  <p style={{ fontSize: "20px", fontWeight: "600", color: "#3b82f6", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {user?._id?.slice(-8) || 'N/A'}
                  </p>
                </div>
                <div style={{ padding: "16px", background: "rgba(236, 72, 153, 0.1)", borderRadius: "8px" }}>
                  <p style={{ fontSize: "14px", color: "#6b7280" }}>Role</p>
                  <p style={{ fontSize: "20px", fontWeight: "600", color: "#ec4899", textTransform: "capitalize" }}>
                    {user?.role || 'moderator'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Profile;
