'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { usersApi, handleApiError } from '@/lib/safehaven-api';
import toast from 'react-hot-toast';

interface UserDetails {
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
  profile: {
    address: string | null;
    city: string | null;
    province: string | null;
    barangay: string | null;
    blood_type: string | null;
    medical_conditions: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    latitude: number | null;
    longitude: number | null;
  };
}

export default function UserDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserDetails | null>(null);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    role: '',
    is_active: true
  });
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [resettingPassword, setResettingPassword] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getById(Number(userId));
      
      if (response.status === 'success' && response.data) {
        setUser(response.data);
        setFormData({
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          phone: response.data.phone,
          role: response.data.role,
          is_active: response.data.is_active
        });
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const updateData = {
        firstName: formData.first_name,
        lastName: formData.last_name,
        phone: formData.phone,
        role: formData.role,
        is_active: formData.is_active
      };

      await usersApi.update(Number(userId), updateData);
      toast.success('User updated successfully');
      setIsEditing(false);
      fetchUser();
    } catch (err) {
      console.error('Error updating user:', err);
      toast.error(handleApiError(err));
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (!confirm('Are you sure you want to reset this user\'s password?')) {
      return;
    }

    try {
      setResettingPassword(true);
      await usersApi.resetPassword(Number(userId), newPassword);
      toast.success('Password reset successfully');
      setShowPasswordReset(false);
      setNewPassword('');
    } catch (err) {
      console.error('Error resetting password:', err);
      toast.error(handleApiError(err));
    } finally {
      setResettingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'User not found'}
        </div>
        <button
          onClick={() => router.push('/users')}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          ← Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push('/users')}
            className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-1"
          >
            ← Back to Users
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {user.first_name} {user.last_name}
          </h1>
          <p className="text-gray-600 mt-1">{user.email}</p>
        </div>
        <div className="flex gap-3">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Edit User
            </button>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="lgu_officer">LGU Officer</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                    Active
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600">Email</div>
                  <div className="text-gray-900 font-medium">{user.email}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-600">Phone</div>
                  <div className="text-gray-900 font-medium">{user.phone}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-600">Role</div>
                  <div className="text-gray-900 font-medium">
                    {user.role === 'lgu_officer' ? 'LGU Officer' : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600">Account Status</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                    {user.is_verified && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600">Created</div>
                  <div className="text-gray-900">
                    {new Date(user.created_at).toLocaleString()}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600">Last Login</div>
                  <div className="text-gray-900">
                    {user.last_login
                      ? new Date(user.last_login).toLocaleString()
                      : 'Never'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600">Address</div>
                <div className="text-gray-900">
                  {user.profile.address || 'Not provided'}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-600">City</div>
                  <div className="text-gray-900">{user.profile.city || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Province</div>
                  <div className="text-gray-900">{user.profile.province || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Barangay</div>
                  <div className="text-gray-900">{user.profile.barangay || '-'}</div>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600">Blood Type</div>
                <div className="text-gray-900">{user.profile.blood_type || 'Not provided'}</div>
              </div>

              <div>
                <div className="text-sm text-gray-600">Medical Conditions</div>
                <div className="text-gray-900">
                  {user.profile.medical_conditions || 'None reported'}
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h2>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600">Contact Name</div>
                <div className="text-gray-900">
                  {user.profile.emergency_contact_name || 'Not provided'}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600">Contact Phone</div>
                <div className="text-gray-900">
                  {user.profile.emergency_contact_phone || 'Not provided'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            
            <div className="space-y-3">
              <button
                onClick={() => setShowPasswordReset(!showPasswordReset)}
                className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
              >
                Reset Password
              </button>
            </div>

            {showPasswordReset && (
              <div className="mt-4 p-4 bg-yellow-50 rounded-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 mb-2"
                />
                <button
                  onClick={handleResetPassword}
                  disabled={resettingPassword}
                  className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:bg-gray-400"
                >
                  {resettingPassword ? 'Resetting...' : 'Confirm Reset'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
