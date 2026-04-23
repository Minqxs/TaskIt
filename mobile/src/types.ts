export type UserRole = 'Customer' | 'ServiceProvider';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export type BannerTone = 'info' | 'error' | 'success';

export type BookingWorkflowAction = 'accept' | 'start' | 'complete';

export interface Session {
  token: string;
  userId: string;
  role: UserRole;
}

export interface AuthForm {
  role: UserRole;
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  governmentIdNumber: string;
  city: string;
  district: string;
  addressLine: string;
}

export interface AuthResponse extends Session {}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  role: UserRole;
  fullName: string;
  phoneNumber: string;
  governmentIdNumber: string | null;
  city: string | null;
  district: string | null;
  addressLine: string | null;
}

export interface OAuthLoginPayload {
  provider: string;
  oAuthSubject: string;
  email: string;
  role: UserRole;
  fullName: string;
}

export interface Provider {
  userId: string;
  name: string;
  city: string;
  district: string;
  isVerified: boolean;
  hourlyRate: number | string;
  rating: number | string;
}

export interface Booking {
  id: string | number;
  description: string;
  totalAmount: number | string;
  date: string;
  durationHours: number | string;
  status: string;
  paymentStatus: string;
}

export interface CreateBookingPayload {
  customerId: string;
  serviceProviderId: string;
  date: string;
  durationHours: number;
  description: string;
}

export interface BookingAction {
  key: BookingWorkflowAction;
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
}
