export interface Doctor {
  id: string;
  hospitalId: string;
  name: string;
  specialty: string;
  qualification: string;
  experienceYears: number;
  consultationFee: number;
  rating: number;
  avatarUrl?: string;
  about?: string;
}
