/** Request / response shapes for endpoints that don't just return a model. */
import type { ID, Parent, Relation, StopPoint } from './models';

export interface SendOtpRequest {
  phone: string; // E.164
}
export interface SendOtpResponse {
  requestId: string;
  resendInSeconds: number;
  expiresInSeconds: number;
}

export interface VerifyOtpRequest {
  requestId: string;
  phone: string;
  otp: string;
}
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
export interface VerifyOtpResponse extends AuthTokens {
  parent: Parent;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface UpdateProfileRequest {
  name?: string;
  altPhone?: string | null;
  email?: string | null;
  relation?: Relation;
}

export interface LinkStudentRequest {
  studentCode: string; // ID issued by school
}

export interface AddGuardianRequest {
  name: string;
  relation: Relation;
  phone: string;
}

export interface SendMessageRequest {
  text: string;
}

export interface CreatePaymentOrderRequest {
  studentId: ID;
  invoiceIds: ID[];
}

export interface UpdatePickupLocationsRequest {
  pickup: StopPoint;
  drop?: StopPoint;
  dropSameAsPickup: boolean;
}

/** Error body the client expects on non-2xx responses. */
export interface ApiErrorBody {
  code?: string;
  message?: string;
}
