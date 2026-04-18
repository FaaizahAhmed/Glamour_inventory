import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { loginUser, LoginCredentials } from '@/services/authApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles } from 'lucide-react';

function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginCredentials>();
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const onSubmit = async (data: LoginCredentials) => {
    setIsLoading(true);

    try {
      const response = await loginUser(data);

      if (response.success && response.data) {
        login(response.data.token, response.data.user);
        
        toast({
          title: 'Success',
          description: 'Logged in successfully',
        });

        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error.message || 'Invalid username or password',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(to bottom right, white, white, rgba(248, 248, 255, 0.3))", padding: "16px" }}>
      <div style={{ width: "100%", maxWidth: "448px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "8px" }}>
            <Sparkles style={{ width: "32px", height: "32px", color: "hsl(var(--primary))" }} />
            <h1 style={{ fontSize: "30px", fontWeight: "bold", margin: 0 }}>Sparkle Shelf Smart</h1>
          </div>
          <p style={{ color: "#6b7280", fontSize: "16px" }}>Intelligent Inventory Management</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle style={{ fontSize: "24px", fontWeight: "bold", textAlign: "center" }}>
              Welcome Back
            </CardTitle>
            <CardDescription style={{ textAlign: "center" }}>
              Login to your Glamour Inventory account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <Label htmlFor="username">Username or Email</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username or email"
                  {...register('username', {
                    required: 'Username or email is required',
                    minLength: {
                      value: 3,
                      message: 'Username must be at least 3 characters'
                    }
                  })}
                  disabled={isLoading}
                />
                {errors.username && (
                  <p style={{ fontSize: "14px", color: "#dc2626" }}>{errors.username.message}</p>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p style={{ fontSize: "14px", color: "#dc2626" }}>{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                style={{ width: "100%" }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 style={{ marginRight: "8px", width: "16px", height: "16px", animation: "spin 1s linear infinite" }} />
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </Button>
            </form>

            <div style={{ marginTop: "16px", textAlign: "center", fontSize: "14px", color: "#6b7280" }}>
              Contact your administrator for account access
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Login;
