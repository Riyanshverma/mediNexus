export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: 'male' | 'female' | 'other';
  bloodGroup: string;
  avatarUrl?: string;
}
