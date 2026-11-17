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
  phone_number: string;
  otp: string;
}
export interface AuthTokens {
  accessToken: string;
  // refreshToken: string;
}
export interface VerifyOtpResponse extends AuthTokens {
  status: string;
  message: string;
  token: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface UpdateProfileRequest {
  parent_id: number;
  parent_name?: string;
  alternate_mobile?: string | null;
  email?: string | null;
  relationship?: string;
  phone_number?: number
}

export interface ParentProfileResponse {
  status: string;
  message: string;
  result: Parent[];
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

export interface LogoutResponse {
  status: string;
  message: string;
}

export interface AllStudentDataItem {
  student_id: number;
  student_name: string;
  class: string | null;
  schoolname: string | null;
  pickup_person: string | null;
  morning_pickup_time: string | null;
  evening_pickup_time: string | null;
  is_primary: 0 | 1;
}

export interface AllStudentDataResponse {
  status: 'success' | 'error';
  message: string;
  result: AllStudentDataItem[];
}
