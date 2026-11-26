/**
 * Every backend path in one place. Change a URL here, not in services.
 * Full request/response contract: docs/API.md
 */
export const endpoints = {
  auth: {
    sendOtp: '/auth/otp/send',
    verifyOtp: '/auth/verify-otp',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
  },
  me: {
    profile: '/parent/read-parent-data',
    updateProfile: '/parent/update-parent',
    notificationPrefs: '/me/notification-preferences',
  },
  students: {
    list: '/student/read-all-student-data',
    link: '/students/link',
    guardians: (studentId: string) => `/students/${studentId}/guardians`,
    trips: (studentId: string) => `/students/${studentId}/trips`,
    absences: () => `/student/mark-absent`,
    pickupLocations: (studentId: string) => `/students/${studentId}/pickup-locations`,
    invoices: (studentId: string) => `/students/${studentId}/invoices`,
    payments: (studentId: string) => `/students/${studentId}/payments`,
  },
  trips: {
    live: (tripId: string) => `/trips/${tripId}/live`,
    chat: (tripId: string) => `/trips/${tripId}/chat`,
  },
  chats: {
    list: '/chat/conversations',
    messages: (threadId: string) => `/chats/${threadId}/messages`,
    create: '/chat/conversations',
    // markRead: '/chat/conversations/13/read',
    markRead: (threadId: string) => `/chats/${threadId}/messages`,
    unreadCount: '/chat/unread-count'
  },
  payments: {
    createOrder: '/payments/orders',
    orderStatus: (orderId: string) => `/payments/orders/${orderId}`,
  },
} as const;
