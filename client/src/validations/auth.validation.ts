import { z } from 'zod';

const email = z.string().trim().toLowerCase().email('Invalid email address');
const password = z
  .string()
  .trim()
  .min(6, 'Password must be at least 6 characters long')
  .regex(
    /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).*$/,
    'Password must contain at least an uppercase letter, a number, and a special character'
  );

export const userLogInSchema = z.strictObject({
  email: email,
  password: password,
});

export type userLogInType = z.infer<typeof userLogInSchema>;