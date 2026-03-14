import { z } from 'zod';

const email = z.string().trim().toLowerCase().email("Invalid email address");
const password = z.string().trim().min(6, "Password must be at least 6 characters long").regex(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).*$/, "Password must contain at least an uppercase letter, a number, and a special character");
const phone = z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits");
const firstName = z.string().min(2, "First name is required");
const lastName = z.string().min(2, "Last name is required");

export const userLogInSchema = z.strictObject({
  email: email,
  password: password,
});
export type userLogInType = z.infer<typeof userLogInSchema>;


export const patientSignUpSchema = z.object({
  firstName: firstName,
  lastName: lastName,
  email: email,
  password: password, // use your existing password definition
  confirmPassword: password,
  phone: phone,
  dob: z.date("A date of birth is required."),
  bloodGroup: z.string().min(1, "Blood group is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
export type PatientSignUpType = z.infer<typeof patientSignUpSchema>;


export const hospitalSignUpSchema = z.object({
  // Hospital Details
  hospitalName: z.string().min(2, "Hospital name is required"),
  hospitalType: z.enum(["clinic", "hospital", "solo_practitioner", "diagnostic_center", "pharmacy"], {
  message: "Please select a type",
}),
  registrationNumber: z.string().min(2, "Registration number is required"),
  address: z.string().min(1, "Address is required"),
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Invalid pincode"),

  // Admin Operator Details
  adminFirstName: firstName,
  adminLastName: lastName,
  adminEmail: email,
  adminPhone: phone,
  password: password,
  confirmPassword: password,
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
export type HospitalSignUpType = z.infer<typeof hospitalSignUpSchema>;


export const doctorOnboardSchema = z.object({
  firstName: firstName,
  lastName: lastName,
  specialization: z.string().min(2, "Specialization is required"),
  department: z.string().min(2, "Department is required"),
  qualifications: z.string().min(2, "Qualifications are required"),
  
  // 1. Change to z.coerce.number()
  experienceYears: z.coerce.number().min(0, "Experience must be 0 or greater"),
  
  registrationNumber: z.string().min(2, "Medical Registration Number is required"),
  
  // 2. Change to z.coerce.number()
  consultationFee: z.coerce.number().min(0, "Fee must be 0 or greater"),
  
  // 3. Change to z.coerce.number()
  slotDuration: z.coerce.number().min(5, "Slot duration must be at least 5 mins"),
  
  availableFrom: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
  availableTo: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
  bio: z.string().max(500, "Bio max 500 characters").optional(),
});

export type DoctorOnboardType = z.infer<typeof doctorOnboardSchema>;