// Evacuation Center Reservation API Client
// Handles all reservation-related API calls for admin portal

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface Reservation {
  id: number;
  userId: number;
  centerId: number;
  groupSize: number;
  estimatedArrival: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'expired' | 'arrived';
  reservedAt: string;
  expiresAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
  arrivedAt?: string;
  cancellationReason?: string;
  // Joined data
  userName?: string;
  userPhone?: string;
  userEmail?: string;
  centerName?: string;
  centerAddress?: string;
}

export interface CenterStatus {
  centerId: number;
  available: boolean;
  availableSlots: number;
  statusLevel: 'available' | 'limited' | 'critical' | 'full';
  myReservation?: Reservation;
}

/**
 * Get all reservations for a specific center (Admin)
 */
export async function getCenterReservations(
  centerId: number,
  token: string
): Promise<Reservation[]> {
  const response = await fetch(`${API_BASE_URL}/admin/centers/${centerId}/reservations`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch reservations');
  }

  const result = await response.json();
  return result.data || result;
}

/**
 * Get all reservations across all centers (Admin)
 */
export async function getAllReservations(token: string): Promise<Reservation[]> {
  const response = await fetch(`${API_BASE_URL}/admin/centers/reservations/all`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch all reservations');
  }

  const result = await response.json();
  return result.data || result;
}

/**
 * Confirm a reservation (Admin)
 */
export async function confirmReservation(
  reservationId: number,
  token: string
): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/admin/centers/reservations/${reservationId}/confirm`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to confirm reservation');
  }

  return response.json();
}

/**
 * Reject a reservation (Admin)
 */
export async function rejectReservation(
  reservationId: number,
  reason: string,
  token: string
): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/admin/centers/reservations/${reservationId}/reject`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reason }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to reject reservation');
  }

  return response.json();
}

/**
 * Get center status with availability info
 */
export async function getCenterStatus(
  centerId: number,
  token: string
): Promise<CenterStatus> {
  const response = await fetch(`${API_BASE_URL}/centers/${centerId}/status`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch center status');
  }

  return response.json();
}

/**
 * Format date for display
 */
export function formatReservationDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get status badge color
 */
export function getStatusColor(status: Reservation['status']): string {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'confirmed':
      return 'bg-blue-100 text-blue-800';
    case 'arrived':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-gray-100 text-gray-800';
    case 'expired':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Calculate time remaining until expiration
 */
export function getTimeRemaining(expiresAt: string): string {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry.getTime() - now.getTime();

  if (diff <= 0) {
    return 'Expired';
  }

  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
