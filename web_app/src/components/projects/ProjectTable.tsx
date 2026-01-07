"use client";
import React from "react";
import { Project } from "@/lib/db";
import { PencilIcon, TrashBinIcon, EyeIcon } from "@/icons";

interface ProjectTableProps {
  projects: Project[];
  loading: boolean;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  selectedProjects?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

export default function ProjectTable({ 
  projects, 
  loading, 
  onEdit, 
  onDelete, 
  selectedProjects = [], 
  onSelectionChange 
}: ProjectTableProps) {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange?.(projects.map(p => p.id));
    } else {
      onSelectionChange?.([]);
    }
  };

  const handleSelectOne = (projectId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange?.([...selectedProjects, projectId]);
    } else {
      onSelectionChange?.(selectedProjects.filter(id => id !== projectId));
    }
  };

  const isAllSelected = projects.length > 0 && selectedProjects.length === projects.length;
  const isSomeSelected = selectedProjects.length > 0 && selectedProjects.length < projects.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin dark:border-gray-700"></div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 dark:text-gray-400">
          <p className="text-lg font-medium">No projects found</p>
          <p className="text-sm">Create your first project to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            {onSelectionChange && (
              <th scope="col" className="px-4 py-3 w-12">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) {
                      input.indeterminate = isSomeSelected;
                    }
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </th>
            )}
            <th scope="col" className="px-6 py-3">Project</th>
            <th scope="col" className="px-6 py-3">Client</th>
            <th scope="col" className="px-6 py-3">Category</th>
            <th scope="col" className="px-6 py-3">Classification</th>
            <th scope="col" className="px-6 py-3">Status</th>
            <th scope="col" className="px-6 py-3">Order</th>
            <th scope="col" className="px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => {
            const isSelected = selectedProjects.includes(project.id);
            return (
              <tr key={project.id} className={`border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800'}`}>
                {onSelectionChange && (
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleSelectOne(project.id, e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </td>
                )}
                <td className="px-6 py-4">
                <div className="flex items-center space-x-3">
                  {project.poster_image && (
                    <img
                      src={project.poster_image}
                      alt={project.title}
                      className="w-12 h-8 object-cover rounded"
                    />
                  )}
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {project.title}
                    </div>
                    {project.languages && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {project.languages}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-gray-900 dark:text-white">
                  {project.client || '-'}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-gray-900 dark:text-white">
                  {project.category || '-'}
                </div>
                {project.data_cat && (
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    project.data_cat === 'government' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                      : project.data_cat === 'corporate'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : project.data_cat === 'tourism'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                  }`}>
                    {project.data_cat}
                  </span>
                )}
              </td>
              <td className="px-6 py-4">
                <div className="text-gray-900 dark:text-white">
                  {project.classification || '-'}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col space-y-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    project.is_published 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {project.is_published ? 'Published' : 'Draft'}
                  </span>
                  {project.is_featured && (
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                      Featured
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-gray-900 dark:text-white">
                  {project.order_index}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center space-x-2">
                  {project.video_url && (
                    <a
                      href={project.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      title="View Video"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => onEdit(project)}
                    className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                    title="Edit Project"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(project.id)}
                    className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    title="Delete Project"
                  >
                    <TrashBinIcon className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}