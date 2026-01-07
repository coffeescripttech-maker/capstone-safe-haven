"use client";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";

interface ContactInfo {
  id: number;
  email: string;
  phone: string;
  city: string;
  street: string;
  vimeo_url: string;
  instagram_url: string;
  updated_at: string;
}

interface ValidationErrors {
  email?: string;
  phone?: string;
  city?: string;
  vimeo_url?: string;
  instagram_url?: string;
}

export default function ContactSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ContactInfo>({
    id: 1,
    email: '',
    phone: '',
    city: '',
    street: '',
    vimeo_url: '',
    instagram_url: '',
    updated_at: '',
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings/contact');
      
      if (!response.ok) {
        throw new Error('Failed to fetch contact info');
      }

      const data = await response.json();
      setFormData(data);
    } catch (error) {
      console.error('Error fetching contact info:', error);
      toast.error('Failed to load contact info');
    } finally {
      setLoading(false);
    }
  };

  // Validation functions
  const validateEmail = (value: string): string | undefined => {
    if (!value.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Please enter a valid email address';
    return undefined;
  };

  const validatePhone = (value: string): string | undefined => {
    if (!value.trim()) return 'Phone number is required';
    return undefined;
  };

  const validateCity = (value: string): string | undefined => {
    if (!value.trim()) return 'City is required';
    return undefined;
  };

  const validateURL = (value: string): string | undefined => {
    if (!value.trim()) return undefined; // Optional field
    try {
      new URL(value);
      return undefined;
    } catch {
      return 'Please enter a valid URL';
    }
  };

  const handleFieldChange = (field: keyof ContactInfo, value: string) => {
    setFormData({ ...formData, [field]: value });
    setTouched({ ...touched, [field]: true });

    // Validate on change
    let error: string | undefined;
    if (field === 'email') error = validateEmail(value);
    if (field === 'phone') error = validatePhone(value);
    if (field === 'city') error = validateCity(value);
    if (field === 'vimeo_url') error = validateURL(value);
    if (field === 'instagram_url') error = validateURL(value);

    setErrors({ ...errors, [field]: error });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all required fields
    const emailError = validateEmail(formData.email);
    const phoneError = validatePhone(formData.phone);
    const cityError = validateCity(formData.city);
    const vimeoError = validateURL(formData.vimeo_url);
    const instagramError = validateURL(formData.instagram_url);

    if (emailError || phoneError || cityError || vimeoError || instagramError) {
      setErrors({
        email: emailError,
        phone: phoneError,
        city: cityError,
        vimeo_url: vimeoError,
        instagram_url: instagramError,
      });
      setTouched({
        email: true,
        phone: true,
        city: true,
        vimeo_url: true,
        instagram_url: true,
      });
      toast.error('Please fix validation errors');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/settings/contact', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save contact info');
      }

      const updated = await response.json();
      setFormData(updated);
      toast.success('Contact info saved successfully');
    } catch (error) {
      console.error('Error saving contact info:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save contact info');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Contact Details */}
      <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800 dark:bg-gray-800/50">
        <h4 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
          Contact Details
        </h4>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              onBlur={() => setTouched({ ...touched, email: true })}
              className={`w-full px-4 py-3 text-sm border rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 ${
                touched.email && errors.email
                  ? 'border-red-500 focus:ring-red-500'
                  : touched.email && !errors.email && formData.email
                  ? 'border-green-500 focus:ring-green-500'
                  : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500'
              }`}
              placeholder="hello@example.com"
            />
            {touched.email && errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email}</p>
            )}
            {touched.email && !errors.email && formData.email && (
              <p className="mt-1 text-xs text-green-500 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Valid email format
              </p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              onBlur={() => setTouched({ ...touched, phone: true })}
              className={`w-full px-4 py-3 text-sm border rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 ${
                touched.phone && errors.phone
                  ? 'border-red-500 focus:ring-red-500'
                  : touched.phone && !errors.phone && formData.phone
                  ? 'border-green-500 focus:ring-green-500'
                  : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500'
              }`}
              placeholder="+971 50 123 4567"
            />
            {touched.phone && errors.phone && (
              <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
            )}
            {touched.phone && !errors.phone && formData.phone && (
              <p className="mt-1 text-xs text-green-500 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Looks good!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="rounded-lg border border-gray-200  p-6 dark:border-gray-800 dark:bg-gray-800/50">
        <h4 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
          Address
        </h4>
        
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              City
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Dubai, UAE"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Street Address (Optional)
            </label>
            <input
              type="text"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Street address"
            />
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="rounded-lg border border-gray-200  p-6 dark:border-gray-800 dark:bg-gray-800/50">
        <h4 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
          Social Media Links
        </h4>
        
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Vimeo URL
            </label>
            <input
              type="url"
              value={formData.vimeo_url}
              onChange={(e) => setFormData({ ...formData, vimeo_url: e.target.value })}
              className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://vimeo.com/username"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Instagram URL
            </label>
            <input
              type="url"
              value={formData.instagram_url}
              onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
              className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://www.instagram.com/username/"
            />
          </div>
        </div>
      </div>

      {/* Last Updated */}
      {formData.updated_at && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {new Date(formData.updated_at).toLocaleString()}
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
        <button
          type="submit"
          disabled={saving || !!(errors.email || errors.phone || errors.city || errors.vimeo_url || errors.instagram_url)}
          className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
