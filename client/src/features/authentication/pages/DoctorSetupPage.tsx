import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { IconHeartbeat } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { authService } from '@/services/auth.service';
import { useAuth, ROLE_DASHBOARD } from '@/context/AuthContext';

// ─── Local form schema ────────────────────────────────────────────────────────

const doctorSetupSchema = z
  .object({
    full_name: z.string().min(2, 'Full name must be at least 2 characters'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).*$/,
        'Password must contain at least an uppercase letter, a number, and a special character',
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type DoctorSetupForm = z.infer<typeof doctorSetupSchema>;

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Doctor invite setup page.
 *
 * When a hospital admin invites a doctor, Supabase sends an email with a magic
 * link pointing to `FRONTEND_URL/doctor/setup#access_token=...&...`.
 *
 * This page:
 * 1. Extracts the access_token from the URL hash.
 * 2. Shows a form for the doctor to set their name and password.
 * 3. Calls POST /api/auth/doctor/setup with the invite token as Bearer.
 * 4. Saves the resulting session and navigates to the doctor dashboard.
 */
const DoctorSetupPage = () => {
  const navigate = useNavigate();
  const { applySession } = useAuth();
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Extract the access_token from the URL hash on mount.
  useEffect(() => {
    const hash = window.location.hash.slice(1); // strip leading '#'
    const params = new URLSearchParams(hash);
    const token = params.get('access_token');

    if (!token) {
      toast.error('Invalid or expired invite link.');
      navigate('/login', { replace: true });
      return;
    }

    setInviteToken(token);

    // Clean the token from the URL bar without a page reload.
    window.history.replaceState(null, '', window.location.pathname);
  }, [navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DoctorSetupForm>({
    resolver: zodResolver(doctorSetupSchema),
  });

  const onSubmit = async (data: DoctorSetupForm) => {
    if (!inviteToken) return;

    try {
      const { data: res } = await authService.doctorSetup(
        { password: data.password, full_name: data.full_name },
        inviteToken,
      );

      await applySession(
        res.session.access_token,
        res.session.refresh_token,
        res.session.expires_at,
      );

      toast.success('Account set up successfully. Welcome!');
      navigate(ROLE_DASHBOARD['doctor'], { replace: true });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Setup failed. Please try again.';
      toast.error(message);
    }
  };

  if (!inviteToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex items-center gap-2 font-serif text-2xl">
            <IconHeartbeat className="h-8 w-8 text-primary" />
            mediNexus
          </div>
          <h1 className="text-3xl font-light tracking-tight">Complete your account</h1>
          <p className="text-muted-foreground">
            You've been invited to join as a doctor. Set your name and password to get
            started.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input id="full_name" placeholder="Dr. Jane Smith" {...register('full_name')} />
            {errors.full_name && (
              <p className="text-destructive text-sm">{errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                {...register('password')}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:bg-transparent"
                onClick={() => setShowPassword((p) => !p)}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-destructive text-sm">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Repeat password"
                {...register('confirmPassword')}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:bg-transparent"
                onClick={() => setShowConfirm((p) => !p)}
              >
                {showConfirm ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-destructive text-sm">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
            {isSubmitting ? 'Setting up...' : 'Complete setup'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default DoctorSetupPage;
