"use client";
import React, { useState } from "react";
import { Project } from "@/lib/db";
import { TrashBinIcon, PencilIcon, CheckCircleIcon } from "@/icons";

interface BulkActionsProps {
  selectedProjects: string[];
  projects: Project[];
  onBulkUpdate: (projectIds: string[], updates: Partial<Project>) => Promise<void>;
  onBulkDelete: (projectIds: string[]) => Promise<void>;
  onClearSelection: () => void;
}

export default function BulkActions({
  selectedProjects,
  projects,
  onBulkUpdate,
  onBulkDelete,
  onClearSelection
}: BulkActionsProps) {
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [bulkEditData, setBulkEditData] = useState({
    is_published: '',
    is_featured: '',
    data_cat: ''
  });
  const [loading, setLoading] = useState(false);

  if (selectedProjects.length === 0) return null;

  const handleBulkEdit = async () => {
    setLoading(true);
    try {
      const updates: Partial<Project> = {};
      
      if (bulkEditData.is_published !== '') {
        updates.is_published = bulkEditData.is_published === 'true';
      }
      if (bulkEditData.is_featured !== '') {
        updates.is_featured = bulkEditData.is_featured === 'true';
      }
      if (bulkEditData.data_cat !== '') {
        updates.data_cat = bulkEditData.data_cat;
      }

      await onBulkUpdate(selectedProjects, updates);
      setShowBulkEdit(false);
      setBulkEditData({ is_published: '', is_featured: '', data_cat: '' });
      onClearSelection();
    } catch (error) {
      console.error('Bulk update failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedProjects.length} projects? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      await onBulkDelete(selectedProjects);
      onClearSelection();
    } catch (error) {
      console.error('Bulk delete failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 dark:bg-blue-900/20 dark:border-blue-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CheckCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
            {selectedProjects.length} project{selectedProjects.length > 1 ? 's' : ''} selected
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowBulkEdit(!showBulkEdit)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-blue-800 dark:text-blue-100 dark:hover:bg-blue-700"
          >
            <PencilIcon className="w-4 h-4" />
            Bulk Edit
          </button>

          <button
            onClick={handleBulkDelete}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-red-800 dark:text-red-100 dark:hover:bg-red-700"
          >
            <TrashBinIcon className="w-4 h-4" />
            Delete All
          </button>

          <button
            onClick={onClearSelection}
            className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Clear Selection
          </button>
        </div>
      </div>

      {/* Bulk Edit Form */}
      {showBulkEdit && (
        <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-700">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                Publication Status
              </label>
              <select
                value={bulkEditData.is_published}
                onChange={(e) => setBulkEditData(prev => ({ ...prev, is_published: e.target.value }))}
                className="w-full rounded-lg border border-blue-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-blue-600 dark:bg-blue-900/50 dark:text-blue-100"
              >
                <option value="">No change</option>
                <option value="true">Published</option>
                <option value="false">Draft</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                Featured Status
              </label>
              <select
                value={bulkEditData.is_featured}
                onChange={(e) => setBulkEditData(prev => ({ ...prev, is_featured: e.target.value }))}
                className="w-full rounded-lg border border-blue-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-blue-600 dark:bg-blue-900/50 dark:text-blue-100"
              >
                <option value="">No change</option>
                <option value="true">Featured</option>
                <option value="false">Not Featured</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                Category
              </label>
              <select
                value={bulkEditData.data_cat}
                onChange={(e) => setBulkEditData(prev => ({ ...prev, data_cat: e.target.value }))}
                className="w-full rounded-lg border border-blue-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-blue-600 dark:bg-blue-900/50 dark:text-blue-100"
              >
                <option value="">No change</option>
                <option value="government">Government</option>
                <option value="corporate">Corporate</option>
                <option value="tourism">Tourism</option>
                <option value="business">Business</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => setShowBulkEdit(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkEdit}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Apply Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}