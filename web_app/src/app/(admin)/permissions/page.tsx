'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  Shield,
  Plus,
  Trash2,
  Loader2,
  RefreshCw,
  History,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Filter,
  Search
} from 'lucide-react';

type Role = 
  | 'super_admin'
  | 'admin'
  | 'pnp'
  | 'bfp'
  | 'mdrrmo'
  | 'lgu_officer'
  | 'citizen';

type Action = 'create' | 'read' | 'update' | 'delete' | 'execute';

interface Permission {
  id: number;
  role: Role;
  resource: string;
  action: Action;
  created_at: string;
}

interface AuditLog {
  id: number;
  userId: number;
  role: string;
  action: string;
  resource: string;
  status: string;
  createdAt: string;
}

export default function PermissionsPage() {
  // Use environment variable for API URL, fallback to localhost for development
  // Remove /api/v1 suffix if present since we'll add it in the fetch calls
  const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api\/v1$/, '');
  
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [newPermission, setNewPermission] = useState({
    role: '' as Role | '',
    resource: '',
    action: '' as Action | ''
  });

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async (silent = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      const token = localStorage.getItem('safehaven_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Call backend using environment variable
      const response = await fetch(`${API_URL}/api/v1/admin/permissions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load permissions');
      }

      const data = await response.json();
      if (data.success) {
        setPermissions(data.data || []);
      }
    } catch (error: any) {
      console.error('Error loading permissions:', error);
      toast.error(error.message || 'Failed to load permissions');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const token = localStorage.getItem('safehaven_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Call backend using environment variable
      const response = await fetch(`${API_URL}/api/v1/admin/permissions/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load audit logs');
      }

      const data = await response.json();
      if (data.success) {
        setAuditLogs(data.data || []);
      }
    } catch (error: any) {
      console.error('Error loading audit logs:', error);
      toast.error(error.message || 'Failed to load audit logs');
    }
  };

  const handleAddPermission = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPermission.role || !newPermission.resource || !newPermission.action) {
      toast.error('All fields are required');
      return;
    }

    try {
      const token = localStorage.getItem('safehaven_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Call backend using environment variable
      const response = await fetch(`${API_URL}/api/v1/admin/permissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newPermission)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add permission');
      }

      toast.success('Permission added successfully');
      setShowAddModal(false);
      setNewPermission({ role: '', resource: '', action: '' });
      loadPermissions(true);
    } catch (error: any) {
      console.error('Error adding permission:', error);
      toast.error(error.message || 'Failed to add permission');
    }
  };

  const handleRemovePermission = async (id: number, permission: Permission) => {
    if (!confirm(`Remove permission: ${permission.role} can ${permission.action} ${permission.resource}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('safehaven_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Call backend using environment variable
      const response = await fetch(`${API_URL}/api/v1/admin/permissions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove permission');
      }

      toast.success('Permission removed successfully');
      loadPermissions(true);
    } catch (error: any) {
      console.error('Error removing permission:', error);
      toast.error(error.message || 'Failed to remove permission');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'admin':
        return 'bg-brand-100 text-brand-700 border-brand-200';
      case 'mdrrmo':
        return 'bg-error-100 text-error-700 border-error-200';
      case 'pnp':
        return 'bg-info-100 text-info-700 border-info-200';
      case 'bfp':
        return 'bg-warning-100 text-warning-700 border-warning-200';
      case 'lgu_officer':
        return 'bg-success-100 text-success-700 border-success-200';
      case 'citizen':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-success-100 text-success-700 border-success-200';
      case 'read':
        return 'bg-info-100 text-info-700 border-info-200';
      case 'update':
        return 'bg-warning-100 text-warning-700 border-warning-200';
      case 'delete':
        return 'bg-error-100 text-error-700 border-error-200';
      case 'execute':
        return 'bg-electric-100 text-electric-700 border-electric-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredPermissions = permissions.filter(permission => {
    if (roleFilter && permission.role !== roleFilter) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        permission.role.toLowerCase().includes(search) ||
        permission.resource.toLowerCase().includes(search) ||
        permission.action.toLowerCase().includes(search)
      );
    }
    return true;
  });

  // Group permissions by role
  const groupedPermissions = filteredPermissions.reduce((acc, permission) => {
    if (!acc[permission.role]) {
      acc[permission.role] = [];
    }
    acc[permission.role].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading permissions...</p>
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
              <Shield className="w-8 h-8 text-brand-500" />
              Permission Management
            </h1>
            <p className="text-gray-600 mt-1">Manage role-based access control permissions</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setShowHistory(!showHistory);
                if (!showHistory) loadAuditLogs();
              }}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
            >
              <History className="w-4 h-4" />
              {showHistory ? 'Hide History' : 'View History'}
            </button>
            <button
              onClick={() => loadPermissions(true)}
              disabled={isRefreshing}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Add Permission
            </button>
          </div>
        </div>
      </div>

      {/* Alert */}
      <div className="bg-warning-50 border border-warning-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-semibold text-warning-900 mb-1">Super Admin Only</h3>
          <p className="text-sm text-warning-700">
            Only super administrators can modify permissions. Changes take effect immediately for all users.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-bold text-gray-900">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Permissions
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by role, resource, or action..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
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
              <option value="admin">Admin</option>
              <option value="pnp">PNP</option>
              <option value="bfp">BFP</option>
              <option value="mdrrmo">MDRRMO</option>
              <option value="lgu_officer">LGU Officer</option>
              <option value="citizen">Citizen</option>
            </select>
          </div>
        </div>
      </div>

      {/* Permissions List */}
      {showHistory ? (
        <PermissionHistory logs={auditLogs} />
      ) : (
        <div className="space-y-6">
          {Object.keys(groupedPermissions).length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-16 text-center border border-gray-100">
              <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium mb-2">No permissions found</p>
              <p className="text-gray-400 text-sm">
                {searchTerm || roleFilter ? 'Try adjusting your filters' : 'Add permissions to get started'}
              </p>
            </div>
          ) : (
            Object.entries(groupedPermissions).map(([role, perms]) => (
              <div key={role} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-gray-600" />
                      <h3 className="text-lg font-bold text-gray-900">
                        {role.toUpperCase().replace('_', ' ')}
                      </h3>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getRoleBadgeColor(role)}`}>
                        {perms.length} {perms.length === 1 ? 'permission' : 'permissions'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Resource
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Action
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Created At
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {perms.map((permission) => (
                        <tr key={permission.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">
                              {permission.resource}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${getActionBadgeColor(permission.action)}`}>
                              {permission.action.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {format(new Date(permission.created_at), 'MMM d, yyyy HH:mm')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button
                              onClick={() => handleRemovePermission(permission.id, permission)}
                              className="p-2 text-error-600 hover:bg-error-50 rounded-lg transition-all"
                              title="Remove Permission"
                              disabled={permission.role === 'super_admin'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Permission Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Plus className="w-6 h-6 text-brand-500" />
                Add Permission
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddPermission} className="space-y-4">
              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role <span className="text-error-500">*</span>
                </label>
                <select
                  value={newPermission.role}
                  onChange={(e) => setNewPermission({ ...newPermission, role: e.target.value as Role })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select a role</option>
                  <option value="admin">Admin</option>
                  <option value="pnp">PNP</option>
                  <option value="bfp">BFP</option>
                  <option value="mdrrmo">MDRRMO</option>
                  <option value="lgu_officer">LGU Officer</option>
                  <option value="citizen">Citizen</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Super admin permissions cannot be modified
                </p>
              </div>

              {/* Resource */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resource <span className="text-error-500">*</span>
                </label>
                <input
                  type="text"
                  value={newPermission.resource}
                  onChange={(e) => setNewPermission({ ...newPermission, resource: e.target.value })}
                  placeholder="e.g., alerts, incidents, users"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Action */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Action <span className="text-error-500">*</span>
                </label>
                <select
                  value={newPermission.action}
                  onChange={(e) => setNewPermission({ ...newPermission, action: e.target.value as Action })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select an action</option>
                  <option value="create">Create</option>
                  <option value="read">Read</option>
                  <option value="update">Update</option>
                  <option value="delete">Delete</option>
                  <option value="execute">Execute</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-all font-semibold flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Add Permission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Permission History Component
function PermissionHistory({ logs }: { logs: AuditLog[] }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <History className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-bold text-gray-900">Permission Change History</h3>
        </div>
      </div>
      {logs.length === 0 ? (
        <div className="text-center py-16">
          <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">No history available</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Permission
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${
                      log.action === 'permission_add'
                        ? 'bg-success-100 text-success-700 border-success-200'
                        : 'bg-error-100 text-error-700 border-error-200'
                    }`}>
                      {log.action === 'permission_add' ? (
                        <>
                          <Plus className="w-3 h-3 mr-1" />
                          Added
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-3 h-3 mr-1" />
                          Removed
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900">
                      {log.resource}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${
                      log.status === 'success'
                        ? 'bg-success-100 text-success-700 border-success-200'
                        : 'bg-error-100 text-error-700 border-error-200'
                    }`}>
                      {log.status === 'success' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Success
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Failed
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm:ss')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
