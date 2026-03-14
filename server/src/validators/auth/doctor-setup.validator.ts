import { z } from 'zod';

export const doctorSetupSchema = z.object({
  body: z.object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters'),
    full_name: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  }),
});

export type DoctorSetupBody = z.infer<typeof doctorSetupSchema>['body'];
