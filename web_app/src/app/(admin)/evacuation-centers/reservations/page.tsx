'use client';

import { useState, useEffect } from 'react';
import { useSafeHavenAuth } from '@/context/SafeHavenAuthContext';
import {
  getAllReservations,
  confirmReservation,
  rejectReservation,
  Reservation,
  formatReservationDate,
  getStatusColor,
  getTimeRemaining,
} from '@/lib/reservation-api';
import toast from 'react-hot-toast';
import {
  Calendar,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Search,
  Filter,
  RefreshCw,
  MapPin,
  AlertCircle,
  Home,
  User,
  Phone,
  TrendingUp,
  Activity
} from 'lucide-react';

export default function ReservationsPage() {
  const { user } = useSafeHavenAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  useEffect(() => {
    if (user) {
      loadReservations();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [reservations, statusFilter, searchQuery]);

  const loadReservations = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      const token = localStorage.getItem('safehaven_token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const data = await getAllReservations(token);
      setReservations(data);
    } catch (error) {
      console.error('Error loading reservations:', error);
      toast.error('Failed to load reservations');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...reservations];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.userName?.toLowerCase().includes(query) ||
        r.userPhone?.toLowerCase().includes(query) ||
        r.centerName?.toLowerCase().includes(query)
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.reservedAt).getTime() - new Date(a.reservedAt).getTime());

    setFilteredReservations(filtered);
  };

  const handleConfirm = async (reservation: Reservation) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('safehaven_token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      await confirmReservation(reservation.id, token);
      toast.success('Reservation confirmed successfully');
      await loadReservations(true);
    } catch (error) {
      console.error('Error confirming reservation:', error);
      toast.error('Failed to confirm reservation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectClick = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!selectedReservation || !rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem('safehaven_token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      await rejectReservation(selectedReservation.id, rejectReason, token);
      toast.success('Reservation rejected successfully');
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedReservation(null);
      await loadReservations(true);
    } catch (error) {
      console.error('Error rejecting reservation:', error);
      toast.error('Failed to reject reservation');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: Reservation['status']) => {
    const colorClass = getStatusColor(status);
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorClass}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const stats = {
    total: reservations.length,
    pending: reservations.filter(r => r.status === 'pending').length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    arrived: reservations.filter(r => r.status === 'arrived').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reservations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Home className="w-8 h-8 text-brand-500" />
              Evacuation Center Reservations
            </h1>
            <p className="text-gray-600 mt-1">Manage and monitor all center reservations</p>
          </div>
          <button
            onClick={() => loadReservations(true)}
            disabled={isRefreshing}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Reservations"
          value={stats.total}
          icon={<Calendar className="w-6 h-6" />}
          gradient="from-brand-500 to-brand-600"
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={<Clock className="w-6 h-6" />}
          gradient="from-warning-500 to-warning-600"
        />
        <StatCard
          title="Confirmed"
          value={stats.confirmed}
          icon={<CheckCircle className="w-6 h-6" />}
          gradient="from-info-500 to-info-600"
        />
        <StatCard
          title="Arrived"
          value={stats.arrived}
          icon={<Activity className="w-6 h-6" />}
          gradient="from-success-500 to-success-600"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-bold text-gray-900">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            >
              <option value="all">All Statuses</option>
              <option value="pending">⏳ Pending</option>
              <option value="confirmed">✅ Confirmed</option>
              <option value="arrived">🎯 Arrived</option>
              <option value="cancelled">❌ Cancelled</option>
              <option value="expired">⏰ Expired</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, phone, or center..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Reservations Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        {filteredReservations.length === 0 ? (
          <div className="text-center py-16">
            <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium mb-2">No reservations found</p>
            <p className="text-gray-400 text-sm">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Reservations will appear here when users book evacuation centers'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Reservation Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Center
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Time Info
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getStatusGradient(reservation.status)} flex items-center justify-center flex-shrink-0 shadow-md`}>
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                            {reservation.userName}
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Phone className="w-3 h-3" />
                              {reservation.userPhone}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Users className="w-3 h-3" />
                              {reservation.groupSize} {reservation.groupSize === 1 ? 'person' : 'people'}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            ID: #{reservation.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div className="text-sm text-gray-900">{reservation.centerName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(reservation.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          Reserved: {formatReservationDate(reservation.reservedAt)}
                        </div>
                        {reservation.status === 'pending' && (
                          <div className="flex items-center gap-1.5 text-xs font-medium text-orange-600">
                            <Clock className="w-3 h-3" />
                            Expires: {getTimeRemaining(reservation.expiresAt)}
                          </div>
                        )}
                        {reservation.status === 'confirmed' && reservation.estimatedArrival && (
                          <div className="flex items-center gap-1.5 text-xs text-blue-600">
                            <TrendingUp className="w-3 h-3" />
                            ETA: {formatReservationDate(reservation.estimatedArrival)}
                          </div>
                        )}
                        {reservation.status === 'arrived' && reservation.arrivedAt && (
                          <div className="flex items-center gap-1.5 text-xs text-green-600">
                            <CheckCircle className="w-3 h-3" />
                            Arrived: {formatReservationDate(reservation.arrivedAt)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {reservation.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleConfirm(reservation)}
                            disabled={actionLoading}
                            className="p-2 text-success-600 hover:bg-success-50 rounded-lg transition-all disabled:opacity-50"
                            title="Confirm Arrival"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRejectClick(reservation)}
                            disabled={actionLoading}
                            className="p-2 text-error-600 hover:bg-error-50 rounded-lg transition-all disabled:opacity-50"
                            title="Reject Reservation"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      {reservation.status !== 'pending' && (
                        <span className="text-xs text-gray-400">No actions</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Results Count */}
      {filteredReservations.length > 0 && (
        <div className="mt-4 text-center text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filteredReservations.length}</span> of{' '}
          <span className="font-semibold text-gray-900">{reservations.length}</span> reservations
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-error-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-error-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Reject Reservation</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700 mb-2">
                Rejecting reservation for:
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {selectedReservation.userName}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {selectedReservation.centerName}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Rejection *
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason (e.g., Center at full capacity, Invalid information, etc.)"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-error-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedReservation(null);
                }}
                disabled={actionLoading}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={actionLoading || !rejectReason.trim()}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-error-500 to-error-600 text-white rounded-lg hover:from-error-600 hover:to-error-700 transition-all font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Reject Reservation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, gradient }: any) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-white shadow-lg`}>
          {icon}
        </div>
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

// Helper function for status gradient
function getStatusGradient(status: Reservation['status']): string {
  switch (status) {
    case 'pending':
      return 'from-warning-500 to-warning-600';
    case 'confirmed':
      return 'from-info-500 to-info-600';
    case 'arrived':
      return 'from-success-500 to-success-600';
    case 'cancelled':
      return 'from-gray-500 to-gray-600';
    case 'expired':
      return 'from-error-500 to-error-600';
    default:
      return 'from-gray-500 to-gray-600';
  }
}
