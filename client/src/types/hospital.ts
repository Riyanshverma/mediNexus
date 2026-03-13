export interface HospitalAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: HospitalAddress;
  phone: string;
  email: string;
  rating: number;
  services: string[];
  imageUrl?: string;
}
