'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { usersApi, handleApiError } from '@/lib/safehaven-api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Save,
  Loader2,
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Key,
  AlertCircle,
  UserX
} from 'lucide-react';

interface UserData {
  id: number;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  role: string;
  jurisdiction: string | null;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  city: string | null;
  province: string | null;
  barangay: string | null;
}

const roleOptions = [
  { value: 'citizen', label: '👤 Citizen', description: 'Regular app user', color: 'gray' },
  { value: 'lgu_officer', label: '👮 LGU Officer', description: 'Local government officer', color: 'blue' },
  { value: 'mdrrmo', label: '🚨 MDRRMO', description: 'Disaster management officer', color: 'orange' },
  { value: 'bfp', label: '🚒 BFP', description: 'Bureau of Fire Protection', color: 'red' },
  { value: 'pnp', label: '👮‍♂️ PNP', description: 'Philippine National Police', color: 'indigo' },
  { value: 'admin', label: '🛡️ Admin', description: 'System administrator', color: 'purple' },
  { value: 'super_admin', label: '⭐ Super Admin', description: 'Full system access', color: 'brand' }
];

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = parseInt(params.id as string);

  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: '',
    jurisdiction: '',
    is_active: true,
    city: '',
    province: '',
    barangay: ''
  });

  useEffect(() => {
    loadUser();
    
    // Check if edit mode should be enabled from URL params
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('edit') === 'true') {
      setIsEditing(true);
    }
  }, [userId]);

  const loadUser = async () => {
    try {
      setIsLoading(true);
      const response = await usersApi.getById(userId);
      
      if (response.status === 'success' && response.data) {
        setUser(response.data);
        setFormData({
          first_name: response.data.first_name || '',
          last_name: response.data.last_name || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          role: response.data.role || '',
          jurisdiction: response.data.jurisdiction || '',
          is_active: response.data.is_active !== false,
          city: response.data.city || '',
          province: response.data.province || '',
          barangay: response.data.barangay || ''
        });
      }
    } catch (error) {
      console.error('Error loading user:', error);
      toast.error(handleApiError(error));
      router.push('/users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await usersApi.update(userId, formData);
      toast.success('User updated successfully');
      setIsEditing(false);
      loadUser();
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      await usersApi.resetPassword(userId, newPassword);
      toast.success('Password reset successfully');
      setShowResetPassword(false);
      setNewPassword('');
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  const getRoleInfo = (role: string) => {
    return roleOptions.find(r => r.value === role) || roleOptions[0];
  };

  const needsJurisdiction = (role: string) => {
    return ['admin', 'pnp', 'bfp', 'mdrrmo', 'lgu_officer'].includes(role);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const roleInfo = getRoleInfo(user.role);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/users')}
          className="flex items-center gap-2 text-gray-600 hover:text-brand-600 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Users
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 bg-gradient-to-br from-${roleInfo.color}-500 to-${roleInfo.color}-600 rounded-xl flex items-center justify-center text-white shadow-lg`}>
              <User className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user.first_name} {user.last_name}
              </h1>
              <p className="text-gray-600 mt-1">{roleInfo.label}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-all font-semibold shadow-md hover:shadow-lg"
              >
                Edit User
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    loadUser();
                  }}
                  className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-success-500 text-white rounded-lg hover:bg-success-600 transition-all font-semibold shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            {user.is_active ? (
              <CheckCircle2 className="w-6 h-6 text-success-500" />
            ) : (
              <XCircle className="w-6 h-6 text-error-500" />
            )}
            <h3 className="text-lg font-bold text-gray-900">Account Status</h3>
          </div>
          <p className={`text-2xl font-bold ${user.is_active ? 'text-success-600' : 'text-error-600'}`}>
            {user.is_active ? 'Active' : 'Inactive'}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-6 h-6 text-info-500" />
            <h3 className="text-lg font-bold text-gray-900">Member Since</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {format(new Date(user.created_at), 'MMM d, yyyy')}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6 text-warning-500" />
            <h3 className="text-lg font-bold text-gray-900">Last Login</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {user.last_login ? format(new Date(user.last_login), 'MMM d, yyyy') : 'Never'}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-brand-500" />
            Personal Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 font-medium">{user.first_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 font-medium">{user.last_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <p className="text-gray-900 font-medium">{user.email}</p>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone
              </label>
              <p className="text-gray-900 font-medium">{user.phone}</p>
              <p className="text-xs text-gray-500 mt-1">Phone cannot be changed</p>
            </div>
          </div>
        </div>

        {/* Role & Access */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-brand-500" />
            Role & Access
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              {isEditing ? (
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} - {option.description}
                    </option>
                  ))}
                </select>
              ) : (
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-${roleInfo.color}-100 text-${roleInfo.color}-700 border border-${roleInfo.color}-200`}>
                  <span className="font-semibold">{roleInfo.label}</span>
                </div>
              )}
            </div>

            {needsJurisdiction(isEditing ? formData.role : user.role) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jurisdiction</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.jurisdiction}
                    onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                    placeholder="e.g., Legazpi City, Albay Province"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{user.jurisdiction || 'Not set'}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Status</label>
              {isEditing ? (
                <select
                  value={formData.is_active ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                >
                  <option value="true">✅ Active</option>
                  <option value="false">❌ Inactive</option>
                </select>
              ) : (
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
                  user.is_active
                    ? 'bg-success-100 text-success-700 border border-success-200'
                    : 'bg-error-100 text-error-700 border border-error-200'
                }`}>
                  {user.is_active ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  <span className="font-semibold">{user.is_active ? 'Active' : 'Inactive'}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-brand-500" />
            Location
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g., Legazpi City"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 font-medium">{user.city || 'Not set'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  placeholder="e.g., Albay"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 font-medium">{user.province || 'Not set'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Barangay</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.barangay}
                  onChange={(e) => setFormData({ ...formData, barangay: e.target.value })}
                  placeholder="e.g., Barangay 1"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 font-medium">{user.barangay || 'Not set'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Key className="w-5 h-5 text-brand-500" />
            Security
          </h2>

          {!showResetPassword ? (
            <button
              onClick={() => setShowResetPassword(true)}
              className="w-full px-4 py-3 bg-warning-100 text-warning-700 rounded-lg hover:bg-warning-200 transition-all font-semibold border border-warning-200 flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4" />
              Reset Password
            </button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-2 p-3 bg-warning-50 border border-warning-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-warning-600 mt-0.5" />
                <p className="text-sm text-warning-700">
                  This will reset the user's password. They will need to use the new password to log in.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 8 characters)"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowResetPassword(false);
                    setNewPassword('');
                  }}
                  className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetPassword}
                  className="flex-1 px-4 py-2.5 bg-warning-500 text-white rounded-lg hover:bg-warning-600 transition-all font-semibold"
                >
                  Reset Password
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle2 className="w-4 h-4 text-success-500" />
              <span>Email Verified: {user.is_verified ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
