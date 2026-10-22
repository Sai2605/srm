export interface LoginCredentials {
  identifier: string;
  password: string;
  rememberMe: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'driver';
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}


export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  OTP: {
    identifier: string;
    purpose: 'signup' | 'reset-password';
  };
};
