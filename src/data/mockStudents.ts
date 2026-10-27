import type { Student, Trip,LivePhase } from '../types/models';

export const mockStudents: Student[] = [
  {
      id: 'STU001',
      name: 'Arjun Kumar',
      status: 'active',
      grade: '',
      section: '',
      schoolName: '',
      vehicleLabel: null,
      pickupTime: null,
      dropTime: null
  },
  {
      id: 'STU002',
      name: 'Ananya Kumar',
      status: 'active',
      grade: '',
      section: '',
      schoolName: '',
      vehicleLabel: null,
      pickupTime: null,
      dropTime: null
  },
];




export const mockTrips: Trip[] = [
  {
    id: 'trip-001',
    status: 'in_progress',
    type: 'pickup',
    driver: {
      name: 'Ravi Kumar',
      phone: '9876543210',
    },
    vehicle: {
      registrationNumber: 'TN 01 AB 1234',
    },
  } as unknown as Trip,
  {
    id: 'trip-002',
    status: 'scheduled',
    type: 'drop',
    driver: {
      name: 'Ravi Kumar',
      phone: '9876543210',
    },
    vehicle: {
      registrationNumber: 'TN 01 AB 1234',
    },
  } as unknown as Trip,
];

export const mockInvoices = [
  {
    id: 'invoice-001',
    status: 'overdue',
    month: '2026-10',
    amount: 3500,
  },
];

export const mockProfile = {
  id: 'parent-001',
  name: 'Sai Kumar',
  firstName: 'Sai',
};

export const mockLiveTrip = {
  phase: 'onboard' as LivePhase,
  etaMinutes: 8,
  distanceKm: 1.2,
  etaTime: new Date(Date.now() + 8 * 60_000).toISOString(),
  updatedAt: new Date().toISOString(),
  stopsCompleted: 4,
  stopsTotal: 10,
};