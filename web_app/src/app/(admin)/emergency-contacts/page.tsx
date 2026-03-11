'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { emergencyContactsApi, handleApiError } from '@/lib/safehaven-api';
import toast from 'react-hot-toast';
import {
  Phone,
  Mail,
  MapPin,
  Plus,
  Search,
  Filter,
  Loader2,
  Edit2,
  Trash2,
  RefreshCw,
  PhoneCall,
  Globe,
  Building2,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<EmergencyContact | null>(null);

  useEffect(() => {
    loadContacts();
    loadCategories();
  }, [categoryFilter]);

  // Refetch when page becomes visible (e.g., after navigating back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadContacts(true);
      }
    };

    const handleFocus = () => {
      loadContacts(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Listen for route changes to refetch data
  useEffect(() => {
    // Refetch when component mounts or route changes
    loadContacts(true);
  }, [router]);

  const loadContacts = async (silent = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      const params: any = {
        _t: Date.now() // Cache buster
      };
      
      if (categoryFilter) params.category = categoryFilter;

      const response = await emergencyContactsApi.getAll(params);
      
      if (response.status === 'success' && response.data) {
        const contactsData = response.data;
        
        if (typeof contactsData === 'object' && !Array.isArray(contactsData)) {
          const flatContacts: EmergencyContact[] = [];
          Object.entries(contactsData).forEach(([category, categoryContacts]: [string, any]) => {
            if (Array.isArray(categoryContacts)) {
              flatContacts.push(...categoryContacts);
            }
          });
          setContacts(flatContacts);
        } else if (Array.isArray(contactsData)) {
          setContacts(contactsData);
        } else {
          setContacts([]);
        }
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      toast.error(handleApiError(error));
      setContacts([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
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

  const handleDeleteClick = (contact: EmergencyContact) => {
    setContactToDelete(contact);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!contactToDelete) return;

    try {
      await emergencyContactsApi.delete(contactToDelete.id);
      toast.success('Contact deleted successfully');
      setShowDeleteDialog(false);
      setContactToDelete(null);
      loadContacts(true);
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error(handleApiError(error));
    }
  };

  const getCategoryColor = (category: string) => {
    // All categories use info gradient
    return 'from-info-500 to-info-600';
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'police': return '👮';
      case 'fire': return '🚒';
      case 'medical': return '🏥';
      case 'rescue': return '🚁';
      case 'government': return '🏛️';
      case 'utility': return '⚡';
      default: return '📞';
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading emergency contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8 
      bg-gradient-to-br from-info-500 to-info-600 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Emergency Contacts
            </h1>
            <p className="text-info-50">
              Manage emergency hotlines and contact information
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* <button
              onClick={() => loadContacts(true)}
              disabled={isRefreshing}
              className="px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 text-white rounded-lg hover:bg-opacity-30 transition flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button> */}
            <button
              onClick={() => router.push('/emergency-contacts/create')}
              className="px-4 py-2 bg-white text-info-600 rounded-lg hover:bg-info-50 transition flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Add Contact
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Contacts"
          value={contacts.length}
          subtitle="All emergency contacts"
          icon={<Phone className="w-6 h-6" />}
          gradient="from-brand-500 to-brand-600"
        />
        <StatCard
          title="Categories"
          value={categories.length}
          subtitle="Contact categories"
          icon={<Filter className="w-6 h-6" />}
          gradient="from-info-500 to-info-600"
        />
        <StatCard
          title="National Hotlines"
          value={contacts.filter(c => c.is_national).length}
          subtitle="Nationwide coverage"
          icon={<Globe className="w-6 h-6" />}
          gradient="from-success-500 to-success-600"
        />
        <StatCard
          title="Active Contacts"
          value={contacts.filter(c => c.is_active).length}
          subtitle="Currently active"
          icon={<CheckCircle2 className="w-6 h-6" />}
          gradient="from-electric-500 to-electric-600"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-bold text-gray-900">Search & Filter</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Contacts
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, phone, or category..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {getCategoryIcon(category)} {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Contacts by Category */}
      {Object.keys(groupedContacts).length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-16 text-center border border-gray-100">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium mb-2">No contacts found</p>
          <p className="text-gray-400 text-sm">
            {searchTerm ? 'Try adjusting your search or filters' : 'Add your first emergency contact to get started'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedContacts).map(([category, categoryContacts]) => (
            <div key={category} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
              <div className={`bg-gradient-to-r ${getCategoryColor(category)} px-6 py-4`}>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-2xl">{getCategoryIcon(category)}</span>
                  {category}
                  {/* <span className="ml-auto bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                    {categoryContacts.length} {categoryContacts.length === 1 ? 'contact' : 'contacts'}
                  </span> */}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Contact Information
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Phone Numbers
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categoryContacts.map((contact) => (
                      <tr key={contact.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getCategoryColor(category)} flex items-center justify-center flex-shrink-0 shadow-md`}>
                              <Phone className="w-5 h-5 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                                {contact.name}
                              </div>
                              {contact.email && (
                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                  <Mail className="w-3 h-3" />
                                  {contact.email}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <a
                              href={`tel:${contact.phone}`}
                              className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium"
                            >
                              <PhoneCall className="w-4 h-4" />
                              {contact.phone}
                            </a>
                            {contact.alternate_phone && (
                              <a
                                href={`tel:${contact.alternate_phone}`}
                                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-700"
                              >
                                <Phone className="w-3 h-3" />
                                {contact.alternate_phone}
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-1.5 text-sm">
                            {contact.is_national ? (
                              <div className="flex items-center gap-1.5 text-info-600 font-medium">
                                <Globe className="w-4 h-4" />
                                National
                              </div>
                            ) : (
                              <div className="flex items-start gap-1.5 text-gray-900">
                                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div>
                                  {contact.city && `${contact.city}, `}
                                  {contact.province}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border ${
                            contact.is_active
                              ? 'bg-success-100 text-success-700 border-success-200'
                              : 'bg-gray-100 text-gray-700 border-gray-200'
                          }`}>
                            {contact.is_active ? (
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
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => router.push(`/emergency-contacts/${contact.id}/edit`)}
                              className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                              title="Edit Contact"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(contact)}
                              className="p-2 text-error-600 hover:bg-error-50 rounded-lg transition-all"
                              title="Delete Contact"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && contactToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Delete Contact</h2>
              <p className="text-gray-600 mt-1">Are you sure you want to delete this emergency contact?</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-error-50 border border-error-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-error-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{contactToDelete.name}</p>
                    <p className="text-sm text-gray-600">{contactToDelete.category}</p>
                    <p className="text-sm text-gray-600">{contactToDelete.phone}</p>
                  </div>
                </div>
              </div>

              <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-warning-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-warning-800">
                    This action cannot be undone. The contact will be permanently removed from the system.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setContactToDelete(null);
                }}
                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-2.5 bg-error-500 text-white rounded-lg hover:bg-error-600 transition-all font-semibold shadow-md hover:shadow-lg"
              >
                Delete Contact
              </button>
            </div>
          </div>
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
