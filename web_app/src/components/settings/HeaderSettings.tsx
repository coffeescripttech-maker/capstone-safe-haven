"use client";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";

interface HeaderConfig {
  id: number;
  active_preset: string;
  updated_at: string;
}

const PRESETS = [
  {
    value: 'default',
    label: 'Default Layout',
    description: 'Logo left, menu right - optimized for horizontal logo'
  },
  {
    value: 'reversed',
    label: 'Reversed Layout',
    description: 'Logo right, menu left - comprehensive layout'
  }
];

export default function HeaderSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activePreset, setActivePreset] = useState('default');

  useEffect(() => {
    fetchHeaderConfig();
  }, []);

  const fetchHeaderConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings/header');
      
      if (!response.ok) {
        throw new Error('Failed to fetch header config');
      }

      const data = await response.json();
      setActivePreset(data.active_preset || 'default');
    } catch (error) {
      console.error('Error fetching header config:', error);
      toast.error('Failed to load header config');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);

      const response = await fetch('/api/settings/header', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active_preset: activePreset }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save header config');
      }

      toast.success('Header preset saved successfully');
    } catch (error) {
      console.error('Error saving header config:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save header config');
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
      {/* Header Preset Selection */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-800/50">
        <h4 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
          Header Layout Preset
        </h4>
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          Choose which header layout to display on your portfolio website. The preset configurations are managed in your portfolio website's <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">header.json</code> file.
        </p>
        
        <div className="space-y-4">
          {PRESETS.map(preset => (
            <label
              key={preset.value}
              className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                activePreset === preset.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
              }`}
            >
              <input
                type="radio"
                name="preset"
                value={preset.value}
                checked={activePreset === preset.value}
                onChange={(e) => setActivePreset(e.target.value)}
                className="mt-1 mr-3"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {preset.label}
                  </span>
                  {activePreset === preset.value && (
                    <span className="px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-100 rounded dark:bg-blue-900/30 dark:text-blue-400">
                      Active
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {preset.description}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-900/30 dark:bg-blue-900/10">
        <h4 className="mb-3 text-sm font-semibold text-blue-900 dark:text-blue-300">
          💡 How It Works
        </h4>
        <div className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
          <p>
            • The selected preset controls which header layout is displayed on your portfolio website
          </p>
          <p>
            • Logo images and layout configurations are stored in <code className="px-1 py-0.5 bg-white/50 dark:bg-gray-900/50 rounded text-xs">final_portfolio_website/data/header.json</code>
          </p>
          <p>
            • To change logos or layout settings, edit the <code className="px-1 py-0.5 bg-white/50 dark:bg-gray-900/50 rounded text-xs">header.json</code> file directly
          </p>
          <p>
            • Changes take effect immediately when you save this setting
          </p>
        </div>
      </div>



      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
