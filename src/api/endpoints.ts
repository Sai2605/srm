/**
 * Every backend path in one place. Change a URL here, not in services.
 * Full request/response contract: docs/API.md
 */
export const endpoints = {
  auth: {
    sendOtp: '/auth/otp/send',
    verifyOtp: '/auth/otp/verify',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
  },
  me: {
    profile: '/me',
    notificationPrefs: '/me/notification-preferences',
  },
  students: {
    list: '/students',
    link: '/students/link',
    guardians: (studentId: string) => `/students/${studentId}/guardians`,
    trips: (studentId: string) => `/students/${studentId}/trips`,
    absences: (studentId: string) => `/students/${studentId}/absences`,
    pickupLocations: (studentId: string) => `/students/${studentId}/pickup-locations`,
    invoices: (studentId: string) => `/students/${studentId}/invoices`,
    payments: (studentId: string) => `/students/${studentId}/payments`,
  },
  trips: {
    live: (tripId: string) => `/trips/${tripId}/live`,
    chat: (tripId: string) => `/trips/${tripId}/chat`,
  },
  chats: {
    list: '/chats',
    messages: (threadId: string) => `/chats/${threadId}/messages`,
  },
  payments: {
    createOrder: '/payments/orders',
    orderStatus: (orderId: string) => `/payments/orders/${orderId}`,
  },
} as const;
