'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { emergencyContactsApi, handleApiError } from '@/lib/safehaven-api';
import toast from 'react-hot-toast';

interface EmergencyContact {
  id: number;
  name: string;
  category: string;
  phone: string;
  alternate_phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  is_national: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function EmergencyContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    loadContacts();
    loadCategories();
  }, [categoryFilter]);

  const loadContacts = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      
      if (categoryFilter) params.category = categoryFilter;

      const response = await emergencyContactsApi.getAll(params);
      console.log('📦 Emergency contacts response:', response);
      
      if (response.status === 'success' && response.data) {
        // Backend returns grouped by category: { "Police": [...], "Fire": [...] }
        // Flatten to array
        const contactsData = response.data;
        console.log('📋 Contacts data type:', typeof contactsData, 'isArray:', Array.isArray(contactsData));
        console.log('📋 Contacts data:', contactsData);
        
        if (typeof contactsData === 'object' && !Array.isArray(contactsData)) {
          const flatContacts: EmergencyContact[] = [];
          Object.entries(contactsData).forEach(([category, categoryContacts]: [string, any]) => {
            console.log(`📂 Processing category "${category}":`, categoryContacts);
            if (Array.isArray(categoryContacts)) {
              flatContacts.push(...categoryContacts);
            }
          });
          console.log('✅ Flattened contacts:', flatContacts.length, 'items');
          setContacts(flatContacts);
        } else if (Array.isArray(contactsData)) {
          console.log('✅ Contacts already array:', contactsData.length, 'items');
          setContacts(contactsData);
        } else {
          console.warn('⚠️ Unexpected contacts data structure');
          setContacts([]);
        }
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      toast.error(handleApiError(error));
      setContacts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await emergencyContactsApi.getCategories();
      if (response.status === 'success' && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      await emergencyContactsApi.delete(id);
      toast.success('Contact deleted successfully');
      loadContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error(handleApiError(error));
    }
  };

  const filteredContacts = contacts.filter(contact =>
    searchTerm === '' ||
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.includes(searchTerm) ||
    contact.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedContacts = filteredContacts.reduce((acc, contact) => {
    if (!acc[contact.category]) {
      acc[contact.category] = [];
    }
    acc[contact.category].push(contact);
    return acc;
  }, {} as Record<string, EmergencyContact[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Emergency Contacts</h1>
          <p className="text-gray-600">Manage emergency hotlines and contact information</p>
        </div>
        <button
          onClick={() => router.push('/emergency-contacts/create')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          + Add Contact
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600">Total Contacts</div>
          <div className="text-3xl font-bold text-gray-900">{contacts.length}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600">Categories</div>
          <div className="text-3xl font-bold text-gray-900">{categories.length}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600">National Hotlines</div>
          <div className="text-3xl font-bold text-gray-900">
            {contacts.filter(c => c.is_national).length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, phone, or category..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Contacts by Category */}
      {isLoading ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading contacts...</p>
        </div>
      ) : Object.keys(groupedContacts).length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
          No contacts found
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedContacts).map(([category, categoryContacts]) => (
            <div key={category} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">{category}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categoryContacts.map((contact) => (
                      <tr key={contact.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                          {contact.email && (
                            <div className="text-sm text-gray-500">{contact.email}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{contact.phone}</div>
                          {contact.alternate_phone && (
                            <div className="text-sm text-gray-500">{contact.alternate_phone}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {contact.is_national ? (
                            <span className="text-blue-600 font-medium">National</span>
                          ) : (
                            <>
                              {contact.city && `${contact.city}, `}
                              {contact.province}
                            </>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            contact.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {contact.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm space-x-2">
                          <button
                            onClick={() => router.push(`/emergency-contacts/${contact.id}/edit`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(contact.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
