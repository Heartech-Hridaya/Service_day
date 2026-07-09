export interface Ngo {
  id: number;
  name: string;
  description: string;
  date: string;
  serviceTime: string;
  location: string;
  maxSlots: number;
  slotsTaken: number;
  cutoffDateTime: string;
  imageUrl?: string;
}
