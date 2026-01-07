// Emergency Contacts API Service

import api from './api';
import {
  ContactFilters,
  SearchContactsRequest,
  ContactsResponse,
  ContactResponse,
  CategoryContactsResponse,
  CategoriesResponse,
  SearchContactsResponse,
} from '../types/api';
import { EmergencyContact, GroupedContacts } from '../types/models';

export const contactsService = {
  // Get all contacts grouped by category
  getContacts: async (filters?: ContactFilters): Promise<GroupedContacts> => {
    const params = new URLSearchParams();
    
    if (filters?.category) params.append('category', filters.category);
    if (filters?.city) params.append('city', filters.city);
    if (filters?.province) params.append('province', filters.province);
    if (filters?.isNational !== undefined) params.append('is_national', String(filters.isNational));
    if (filters?.isActive !== undefined) params.append('is_active', String(filters.isActive));

    const response = await api.get<ContactsResponse>(`/emergency-contacts?${params.toString()}`);
    return response.data.data!;
  },

  // Get contact by ID
  getContactById: async (id: number): Promise<EmergencyContact> => {
    const response = await api.get<ContactResponse>(`/emergency-contacts/${id}`);
    return response.data.data!;
  },

  // Get contacts by category
  getByCategory: async (category: string, city?: string, province?: string): Promise<EmergencyContact[]> => {
    const params = new URLSearchParams();
    if (city) params.append('city', city);
    if (province) params.append('province', province);

    const response = await api.get<CategoryContactsResponse>(
      `/emergency-contacts/category/${category}?${params.toString()}`
    );
    return response.data.data!;
  },

  // Get all categories
  getCategories: async (): Promise<string[]> => {
    const response = await api.get<CategoriesResponse>('/emergency-contacts/categories');
    return response.data.data!;
  },

  // Search contacts
  searchContacts: async (params: SearchContactsRequest): Promise<EmergencyContact[]> => {
    const queryParams = new URLSearchParams();
    queryParams.append('q', params.q);
    if (params.category) queryParams.append('category', params.category);
    if (params.city) queryParams.append('city', params.city);
    if (params.province) queryParams.append('province', params.province);

    const response = await api.get<SearchContactsResponse>(`/emergency-contacts/search?${queryParams.toString()}`);
    return response.data.data!;
  },
};

export default contactsService;
