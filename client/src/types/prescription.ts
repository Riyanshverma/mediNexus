export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Prescription {
  id: string;
  appointmentId?: string;
  patientId: string;
  doctorId: string;
  date: string; // ISO string
  medicines: Medicine[];
  diagnosis: string;
  notes?: string;
}
