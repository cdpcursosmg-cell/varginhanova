
export enum MemberStatus {
  Ativo = 'Ativo',
  Inadimplente = 'Inadimplente',
  Suspenso = 'Suspenso',
  Cancelado = 'Cancelado',
}

export enum PaymentStatus {
  Pendente = 'Pendente',
  Pago = 'Pago',
  Atrasado = 'Atrasado',
}

export interface Member {
  id: string;
  name: string;
  cpf: string;
  rg?: string;
  address: string;
  email: string;
  phone: string;
  joinDate: string;
  category: string;
  status: MemberStatus;
  photoUrl?: string;
  documents?: { name: string; url: string }[];
  birthDate?: string;
  motherName?: string;
  fatherName?: string;
  naturalness?: string;
  // Water specific
  hidrometroId?: string;
  initialReading?: number; // Added for data migration
}

export interface WaterReadingDetails {
  previousReading: number;
  currentReading: number;
  consumption: number;
  pricePerCubicMeter: number;
  serviceFee: number;
  referenceMonth: string;
  totalEnergyBill?: number; // Added: Total energy bill of the community
  totalSystemConsumption?: number; // Added: Sum of all members consumption
}

export interface MembershipDue {
  id: string;
  memberId: string;
  memberName:string;
  memberAddress?: string; // Added for invoice
  month: string;
  year: number;
  dueDate: string;
  amount: number;
  status: PaymentStatus;
  paymentDate?: string;
  readingDetails?: WaterReadingDetails; // Added for water bill
  invoiceNumber?: number; // Added for sequential invoice numbering
}

export interface Expense {
  id: string;
  description: string;
  supplier: string;
  category: string;
  dueDate: string;
  amount: number;
  status: PaymentStatus;
}

export interface Meeting {
  id: string;
  date: string;
  title: string;
  agenda: string;
  minutes?: string;
  attendees: string[]; // array of member IDs
}
