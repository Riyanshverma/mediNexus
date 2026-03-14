import { useState, type FunctionComponent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { userLogInSchema, type userLogInType } from '@/validations/auth.validation';
import { toast } from 'sonner';
import { type LoginFormProps } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useAuth, ROLE_DASHBOARD } from '@/context/AuthContext';

const LoginForm: FunctionComponent<LoginFormProps> = ({ role }) => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<userLogInType>({
    resolver: zodResolver(userLogInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: userLogInType) => {
    try {
      const user = await login(data.email, data.password);

      if (!user.role) {
        toast.error('Your account has no role assigned. Please contact support.');
        return;
      }

      toast.success('Successfully logged in');

      // Navigate to the role-specific dashboard returned by the server.
      // This is safer than trusting the tab the user selected.
      navigate(ROLE_DASHBOARD[user.role]);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Login failed. Please try again.';
      toast.error(message);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-destructive text-sm">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter password"
              {...register('password')}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:bg-transparent"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
          {errors.password && (
            <p className="text-destructive text-sm">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Log in'}
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;
