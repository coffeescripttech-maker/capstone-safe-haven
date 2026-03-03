'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Users, Plus, Trash2, Loader2, ArrowLeft, MapPin } from 'lucide-react';
import { smsBlastAPI } from '@/lib/sms-blast-api';

interface ContactGroup {
  id: string;
  name: string;
  memberCount: number;
  recipientFilters: {
    provinces?: string[];
    cities?: string[];
    barangays?: string[];
  };
  createdAt: string;
}

export default function ContactGroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<ContactGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    provinces: [] as string[],
    cities: [] as string[],
    barangays: [] as string[]
  });

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setIsLoading(true);
      const data: any = await smsBlastAPI.getContactGroups();
      setGroups(data.data || []);
    } catch (error) {
      console.error('Error loading contact groups:', error);
      toast.error('Failed to load contact groups');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error('Please enter a group name');
        return;
      }

      if (formData.provinces.length === 0) {
        toast.error('Please select at least one province');
        return;
      }

      await smsBlastAPI.createContactGroup({
        name: formData.name,
        recipientFilters: {
          provinces: formData.provinces,
          cities: formData.cities,
          barangays: formData.barangays
        }
      });

      toast.success('Contact group created successfully');
      setShowCreateModal(false);
      resetForm();
      loadGroups();
    } catch (error: any) {
      console.error('Error creating contact group:', error);
      toast.error(error.message || 'Failed to create contact group');
    }
  };

  const handleDelete = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this contact group?')) return;

    try {
      await smsBlastAPI.deleteContactGroup(groupId);
      toast.success('Contact group deleted successfully');
      loadGroups();
    } catch (error: any) {
      console.error('Error deleting contact group:', error);
      toast.error(error.message || 'Failed to delete contact group');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      provinces: [],
      cities: [],
      barangays: []
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contact Groups</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage recipient groups for faster SMS targeting
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-brand-600 to-brand-700 rounded-lg hover:from-brand-700 hover:to-brand-800 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          New Group
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No contact groups found. Create your first group to get started.
            </p>
          </div>
        ) : (
          groups.map(group => (
            <div
              key={group.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {group.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>{group.memberCount.toLocaleString()} members</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {group.recipientFilters.provinces && group.recipientFilters.provinces.length > 0 && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Provinces:</p>
                      <p className="text-gray-900 dark:text-white">
                        {group.recipientFilters.provinces.join(', ')}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleDelete(group.id)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Create Contact Group
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Metro Manila Residents"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Provinces
                </label>
                <select
                  multiple
                  value={formData.provinces}
                  onChange={(e) => setFormData({ ...formData, provinces: Array.from(e.target.selectedOptions, option => option.value) })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  size={4}
                >
                  <option value="Metro Manila">Metro Manila</option>
                  <option value="Cebu">Cebu</option>
                  <option value="Davao">Davao</option>
                  <option value="Benguet">Benguet</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-lg hover:from-brand-700 hover:to-brand-800 shadow-lg"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
