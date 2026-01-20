'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usersApi, handleApiError } from '@/lib/safehaven-api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  Users,
  Plus,
  Filter,
  Eye,
  Loader2,
  Search,
  MapPin,
  User,
  Shield,
  CheckCircle2,
  XCircle,
  RefreshCw,
  TrendingUp,
  UserCheck,
  UserX,
  Clock,
  Mail,
  Phone,
  Calendar,
  Activity
} from 'lucide-react';

interface UserData {
  id: number;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  role: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  city: string | null;
  province: string | null;
}

export default function UsersListPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stats, setStats] = useState({
    total_users: 0,
    active_users: 0,
    verified_users: 0,
    admin_users: 0,
    lgu_users: 0,
    new_today: 0,
    new_this_week: 0,
    new_this_month: 0
  });

  useEffect(() => {
    loadUsers();
    loadStatistics();
  }, [roleFilter, statusFilter]);

  const loadUsers = async (silent = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      const params: any = {};
      
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.is_active = statusFilter;
      if (searchTerm) params.search = searchTerm;

      const response = await usersApi.getAll(params);
      
      if (response.status === 'success' && response.data) {
        const usersData = response.data.users || [];
        setUsers(Array.isArray(usersData) ? usersData : []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error(handleApiError(error));
      setUsers([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await usersApi.getStatistics();
      if (response.status === 'success' && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const handleSearch = () => {
    loadUsers();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to deactivate this user?')) {
      return;
    }

    try {
      await usersApi.delete(id);
      toast.success('User deactivated successfully');
      loadUsers(true);
      loadStatistics();
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return { color: 'bg-brand-100 text-brand-700 border-brand-200', icon: Shield };
      case 'lgu_officer':
        return { color: 'bg-info-100 text-info-700 border-info-200', icon: UserCheck };
      default:
        return { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: User };
    }
  };

  const getRoleGradient = (role: string) => {
    switch (role) {
      case 'admin':
        return 'from-brand-500 to-brand-600';
      case 'lgu_officer':
        return 'from-info-500 to-info-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      user.email.toLowerCase().includes(search) ||
      user.first_name.toLowerCase().includes(search) ||
      user.last_name.toLowerCase().includes(search) ||
      user.phone.includes(search)
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading users...</p>
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
              <Users className="w-8 h-8 text-brand-500" />
              User Management
            </h1>
            <p className="text-gray-600 mt-1">Manage app users and their permissions</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => loadUsers(true)}
              disabled={isRefreshing}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats.total_users}
          subtitle="All registered users"
          icon={<Users className="w-6 h-6" />}
          gradient="from-brand-500 to-brand-600"
        />
        <StatCard
          title="Active Users"
          value={stats.active_users}
          subtitle="Currently active"
          icon={<UserCheck className="w-6 h-6" />}
          gradient="from-success-500 to-success-600"
        />
        <StatCard
          title="Verified"
          value={stats.verified_users}
          subtitle="Email verified"
          icon={<CheckCircle2 className="w-6 h-6" />}
          gradient="from-info-500 to-info-600"
        />
        <StatCard
          title="New This Week"
          value={stats.new_this_week}
          subtitle="Last 7 days"
          icon={<TrendingUp className="w-6 h-6" />}
          gradient="from-electric-500 to-electric-600"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <InfoCard
          title="User Roles"
          icon={<Shield className="w-5 h-5" />}
          iconColor="text-brand-500"
          iconBg="bg-brand-50"
        >
          <div className="space-y-3">
            <StatusRow
              label="Administrators"
              value={stats.admin_users}
              color="text-brand-600"
              bgColor="bg-brand-50"
            />
            <StatusRow
              label="LGU Officers"
              value={stats.lgu_users}
              color="text-info-600"
              bgColor="bg-info-50"
            />
            <StatusRow
              label="Regular Users"
              value={stats.total_users - stats.admin_users - stats.lgu_users}
              color="text-gray-600"
              bgColor="bg-gray-50"
            />
          </div>
        </InfoCard>

        <InfoCard
          title="User Activity"
          icon={<Activity className="w-5 h-5" />}
          iconColor="text-success-500"
          iconBg="bg-success-50"
        >
          <div className="space-y-3">
            <StatusRow
              label="Active"
              value={stats.active_users}
              color="text-success-600"
              bgColor="bg-success-50"
            />
            <StatusRow
              label="Inactive"
              value={stats.total_users - stats.active_users}
              color="text-gray-600"
              bgColor="bg-gray-50"
            />
            <StatusRow
              label="Verified"
              value={stats.verified_users}
              color="text-info-600"
              bgColor="bg-info-50"
            />
          </div>
        </InfoCard>

        <InfoCard
          title="New Registrations"
          icon={<Calendar className="w-5 h-5" />}
          iconColor="text-electric-500"
          iconBg="bg-electric-50"
        >
          <div className="space-y-3">
            <StatusRow
              label="Today"
              value={stats.new_today}
              color="text-electric-600"
              bgColor="bg-electric-50"
              prefix="+"
            />
            <StatusRow
              label="This Week"
              value={stats.new_this_week}
              color="text-success-600"
              bgColor="bg-success-50"
              prefix="+"
            />
            <StatusRow
              label="This Month"
              value={stats.new_this_month}
              color="text-info-600"
              bgColor="bg-info-50"
              prefix="+"
            />
          </div>
        </InfoCard>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-bold text-gray-900">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Users
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by name, email, or phone..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-6 py-2.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-all font-semibold"
              >
                Search
              </button>
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            >
              <option value="">All Roles</option>
              <option value="user">👤 User</option>
              <option value="admin">🛡️ Admin</option>
              <option value="lgu_officer">👮 LGU Officer</option>
            </select>
          </div>

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
              <option value="">All Status</option>
              <option value="true">✅ Active</option>
              <option value="false">❌ Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium mb-2">No users found</p>
            <p className="text-gray-400 text-sm">
              {searchTerm ? 'Try adjusting your search or filters' : 'No users in the system'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    User Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => {
                  const roleBadge = getRoleBadge(user.role);
                  const RoleIcon = roleBadge.icon;
                  
                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getRoleGradient(user.role)} flex items-center justify-center flex-shrink-0 shadow-md`}>
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-sm text-gray-900">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {user.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-1.5 text-sm text-gray-900">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            {user.city && user.province
                              ? `${user.city}, ${user.province}`
                              : '-'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border ${roleBadge.color}`}>
                          <RoleIcon className="w-3 h-3" />
                          {user.role === 'lgu_officer' ? 'LGU Officer' : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border ${
                            user.is_active
                              ? 'bg-success-100 text-success-700 border-success-200'
                              : 'bg-gray-100 text-gray-700 border-gray-200'
                          }`}>
                            {user.is_active ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3" />
                                Inactive
                              </>
                            )}
                          </span>
                          {user.is_verified && (
                            <span className="text-info-600" title="Email Verified">
                              <CheckCircle2 className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {user.last_login
                            ? format(new Date(user.last_login), 'MMM d, yyyy')
                            : 'Never'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/users/${user.id}`)}
                            className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-2 text-error-600 hover:bg-error-50 rounded-lg transition-all"
                            title="Deactivate User"
                            disabled={!user.is_active}
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Results Count */}
      {filteredUsers.length > 0 && (
        <div className="mt-4 text-center text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filteredUsers.length}</span> of{' '}
          <span className="font-semibold text-gray-900">{users.length}</span> users
        </div>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, subtitle, icon, gradient }: any) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-white shadow-lg`}>
          {icon}
        </div>
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  );
}

// Info Card Component
function InfoCard({ title, icon, iconColor, iconBg, children }: any) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center ${iconColor}`}>
          {icon}
        </div>
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// Status Row Component
function StatusRow({ label, value, color, bgColor, prefix = '' }: any) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-600 font-medium">{label}</span>
      <span className={`${color} font-bold text-lg px-3 py-1 ${bgColor} rounded-lg`}>
        {prefix}{value}
      </span>
    </div>
  );
}
