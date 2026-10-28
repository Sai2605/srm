import type { Student, Trip, LivePhase } from '../types/models';

import type { LatLng, StopPoint } from './../types/models';
export const mockStudents: Student[] = [
  {
    id: 'STU001',
    name: 'Arjun Kumar',
    status: 'active',
    grade: '4',
    section: 'B',
    schoolName: 'Green Valley Public School',
    vehicleLabel: 'Van 3',
    pickupTime: '7:34',
    dropTime: '3:20'
  },
  {
    id: 'STU002',
    name: 'Ananya Kumar',
    status: 'active',
    grade: '',
    section: '',
    schoolName: '',
    vehicleLabel: 'Van 5',
    pickupTime: '7:34',
    dropTime: '12:30'
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
    from: {
      name: 'Home',
      address: 'Lakeview Apartments, Gate 2'
    },
    to: {
      name: 'School',
      address: 'Green Valley Public School'

    },
    scheduledStart: 7.35,
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
    from: {
      name: 'School',
      address: 'Green Valley Public School'
    },
    to: {
      name: 'Home',
      address: 'Lakeview Apartments, Gate 2'
    },
    scheduledStart: 7.35,
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

export const mockProfile = [{
  id: 'parent-001',
  name: 'Sai Kumar',
  firstName: 'Sai',
  relation:'father',
  isSelf:true
}];

export const mockLiveTrip = {
  phase: 'onboard' as LivePhase,
  etaMinutes: 8,
  distanceKm: 1.2,
  etaTime: new Date(Date.now() + 8 * 60_000).toISOString(),
  updatedAt: new Date().toISOString(),
  stopsCompleted: 4,
  stopsTotal: 10,
};


export interface MockPickupLocations {
  pickup: StopPoint;
  drop: StopPoint;
  dropSameAsPickup: boolean;
  approval: 'approved' | 'pending' | 'rejected';
}

export const MOCK_PICKUP_LOCATIONS: MockPickupLocations = {
  pickup: {
    name: 'Home Pickup',
    address: 'No. 12, Gandhi Street, Tambaram, Chennai',
    landmark: 'Opposite the bakery',
    location: {
      lat: 12.9249,
      lng: 80.1000,
    } satisfies LatLng,
  },
  drop: {
    name: 'School Drop',
    address: 'ABC International School, Chennai',
    landmark: 'Main school entrance',
    location: {
      lat: 12.9365,
      lng: 80.1210,
    },
  },
  dropSameAsPickup: false,
  approval: 'approved',
};