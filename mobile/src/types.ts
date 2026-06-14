export type UserRole = 'Customer' | 'ServiceProvider';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export type BannerTone = 'info' | 'error' | 'success';

export type BookingWorkflowAction = 'accept' | 'start' | 'complete' | 'review' | 'details';
export type CustomerTaskAction = BookingWorkflowAction | 'edit' | 'delete';

export interface Session {
  token: string;
  userId: string;
  role: UserRole;
}

export interface AuthForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  role: UserRole;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  hourlyRate: string;
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
  hourlyRate: number | null;
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
  customerId?: string;
  serviceProviderId?: string;
  description: string;
  totalAmount: number | string;
  date: string;
  durationHours: number | string;
  status: string;
  paymentStatus: string;
}

export interface CreateBookingPayload {
  customerId?: string;
  serviceProviderId?: string;
  date: string;
  durationHours: number;
  description: string;
  offeredPrice?: number;
}

export interface CreateBookingForm {
  title: string;
  description: string;
  category: string;
  preferredDate: string;
  preferredTime: string;
  durationHours: string;
  offeredPrice: string;
  notes: string;
}

export interface CreateReviewPayload {
  bookingId: Booking['id'];
  rating: number;
  comment: string;
}

export interface UpdateBookingPayload {
  date: string;
  durationHours: number;
  description: string;
  offeredPrice: number;
}

export interface BookingAction {
  key: CustomerTaskAction;
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
}
