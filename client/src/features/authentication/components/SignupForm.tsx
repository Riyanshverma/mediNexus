import { useState, type FunctionComponent } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarIcon, Eye, EyeOff } from 'lucide-react';
import {
  patientSignUpSchema,
  hospitalSignUpSchema,
  type PatientSignUpType,
  type HospitalSignUpType,
} from '@/validations/auth.validation';
import { cn } from '@/lib/utils';
import { type SignupFormProps } from '@/types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { useAuth, ROLE_DASHBOARD } from '@/context/AuthContext';

// ─── Helper: 10-digit local phone → E.164 (defaults to +91 / India) ──────────
function toE164(local: string): string {
  const digits = local.replace(/\D/g, '');
  return `+91${digits}`;
}

const SignupForm: FunctionComponent<SignupFormProps> = ({ role }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const { applySession } = useAuth();

  const isPatient = role === 'patient';
  const schema = isPatient ? patientSignUpSchema : hospitalSignUpSchema;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PatientSignUpType | HospitalSignUpType>({
    resolver: zodResolver(schema),
  });

  // ── Patient submit ──────────────────────────────────────────────────────────
  const submitPatient = async (data: PatientSignUpType) => {
    const { data: res } = await authService.registerPatient({
      email: data.email,
      phone: toE164(data.phone),
      password: data.password,
      full_name: `${data.firstName} ${data.lastName}`.trim(),
      dob: data.dob.toISOString().slice(0, 10), // YYYY-MM-DD
      blood_group: data.bloodGroup,
    });

    await applySession(
      res.session.access_token,
      res.session.refresh_token,
      res.session.expires_at,
    );

    toast.success('Account created! Welcome to mediNexus.');
    navigate(ROLE_DASHBOARD['patient']);
  };

  // ── Hospital admin submit ───────────────────────────────────────────────────
  const submitHospital = async (data: HospitalSignUpType) => {
    // Compose a full address string from building + street fields.
    const addressParts = [data.buildingName, data.street].filter(Boolean);
    const address = addressParts.join(', ');

    const { data: res } = await authService.registerHospitalAdmin({
      email: data.adminEmail,
      password: data.password,
      full_name: `${data.adminFirstName} ${data.adminLastName}`.trim(),
      hospital_name: data.hospitalName,
      hospital_type: data.hospitalType,
      address,
      city: data.city,
      state: data.state,
      registration_number: data.registrationNumber,
      contact_phone: toE164(data.adminPhone),
    });

    await applySession(
      res.session.access_token,
      res.session.refresh_token,
      res.session.expires_at,
    );

    toast.success('Hospital registered! Your account is pending approval.');
    navigate(ROLE_DASHBOARD['hospital_admin']);
  };

  const onSubmit = async (data: PatientSignUpType | HospitalSignUpType) => {
    try {
      if (isPatient) {
        await submitPatient(data as PatientSignUpType);
      } else {
        await submitHospital(data as HospitalSignUpType);
      }
      reset();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Registration failed. Please try again.';
      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {isPatient && (
        <div className="space-y-4 animate-in fade-in zoom-in duration-300">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" placeholder="John" {...register('firstName')} />
              {errors.firstName && (
                <p className="text-destructive text-xs">{errors.firstName.message as string}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" placeholder="Doe" {...register('lastName')} />
              {errors.lastName && (
                <p className="text-destructive text-xs">{errors.lastName.message as string}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-destructive text-xs">{errors.email.message as string}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                maxLength={10}
                placeholder="9876543210"
                {...register('phone')}
              />
              {errors.phone && (
                <p className="text-destructive text-xs">{errors.phone.message as string}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bloodGroup">Blood Group</Label>
              <Controller
                control={control}
                name="bloodGroup"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                        <SelectItem key={bg} value={bg}>
                          {bg}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.bloodGroup && (
                <p className="text-destructive text-xs">{errors.bloodGroup.message as string}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Date of Birth</Label>
            <Controller
              control={control}
              name="dob"
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !field.value && 'text-muted-foreground',
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value
                        ? (field.value as Date).toLocaleDateString()
                        : 'Select Date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value as Date | undefined}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date('1900-01-01')
                      }
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.dob && (
              <p className="text-destructive text-xs">{errors.dob.message as string}</p>
            )}
          </div>
        </div>
      )}

      {!isPatient && (
        <div className="space-y-8 animate-in fade-in zoom-in duration-300">
          {/* Hospital Details Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">Hospital Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hospitalName">Registration Name</Label>
                <Input
                  id="hospitalName"
                  placeholder="City Care Clinic"
                  {...register('hospitalName')}
                />
                {errors.hospitalName && (
                  <p className="text-destructive text-xs">
                    {errors.hospitalName.message as string}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="hospitalType">Entity Type</Label>
                <Controller
                  control={control}
                  name="hospitalType"
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value as string}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="government">Government Hospital</SelectItem>
                        <SelectItem value="private">Private Hospital</SelectItem>
                        <SelectItem value="clinic">Clinic</SelectItem>
                        <SelectItem value="nursing_home">Nursing Home</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.hospitalType && (
                  <p className="text-destructive text-xs">
                    {errors.hospitalType.message as string}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Registration Number</Label>
              <Input placeholder="REG-1234..." {...register('registrationNumber')} />
              {errors.registrationNumber && (
                <p className="text-destructive text-xs">
                  {errors.registrationNumber.message as string}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Building / Block</Label>
                <Input placeholder="12th Block" {...register('buildingName')} />
              </div>
              <div className="space-y-2">
                <Label>Street / Area</Label>
                <Input placeholder="Park Avenue" {...register('street')} />
                {errors.street && (
                  <p className="text-destructive text-xs">
                    {errors.street.message as string}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input placeholder="New York" {...register('city')} />
                {errors.city && (
                  <p className="text-destructive text-xs">{errors.city.message as string}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input placeholder="NY" {...register('state')} />
                {errors.state && (
                  <p className="text-destructive text-xs">
                    {errors.state.message as string}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2 w-1/2 pr-2">
              <Label>Pincode</Label>
              <Input placeholder="100001" maxLength={6} {...register('pincode')} />
              {errors.pincode && (
                <p className="text-destructive text-xs">
                  {errors.pincode.message as string}
                </p>
              )}
            </div>
          </div>

          {/* Admin Details Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">Admin / Operator Info</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input placeholder="Jane" {...register('adminFirstName')} />
                {errors.adminFirstName && (
                  <p className="text-destructive text-xs">
                    {errors.adminFirstName.message as string}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input placeholder="Smith" {...register('adminLastName')} />
                {errors.adminLastName && (
                  <p className="text-destructive text-xs">
                    {errors.adminLastName.message as string}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="admin@clinic.com"
                  {...register('adminEmail')}
                />
                {errors.adminEmail && (
                  <p className="text-destructive text-xs">
                    {errors.adminEmail.message as string}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  type="tel"
                  maxLength={10}
                  placeholder="9876543210"
                  {...register('adminPhone')}
                />
                {errors.adminPhone && (
                  <p className="text-destructive text-xs">
                    {errors.adminPhone.message as string}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shared Password Fields */}
      <div className="space-y-4 border-t pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                {...register('password')}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            {errors.password && (
              <p className="text-destructive text-xs">{errors.password.message as string}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Confirm Password</Label>
            <div className="relative">
              <Input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Repeat password"
                {...register('confirmPassword')}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:bg-transparent"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-destructive text-xs">
                {errors.confirmPassword.message as string}
              </p>
            )}
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full h-11 text-md" disabled={isSubmitting}>
        {isSubmitting ? 'Creating account...' : `Create ${role} account`}
      </Button>
    </form>
  );
};

export default SignupForm;
