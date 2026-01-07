"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import ProjectTable from "@/components/projects/ProjectTable";
import ProjectForm from "@/components/projects/ProjectForm";
import ProjectFilters from "@/components/projects/ProjectFilters";
import BulkImport from "@/components/projects/BulkImport";
import { Project } from "@/lib/db";
import { PlusIcon, ArrowUpIcon, TrashBinIcon } from "@/icons";
import { toast } from "sonner";

export default function ProjectManagement() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    category: '',
    featured: '',
    published: '',
    search: ''
  });

  // Fetch projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.featured) params.append('featured', filters.featured);
      if (filters.published) params.append('published', filters.published);

      const response = await fetch(`/api/projects?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        let filteredProjects = data.projects;

        // Apply search filter on client side
        if (filters.search) {
          filteredProjects = filteredProjects.filter((project: Project) =>
            project.title.toLowerCase().includes(filters.search.toLowerCase()) ||
            project.client?.toLowerCase().includes(filters.search.toLowerCase()) ||
            project.category?.toLowerCase().includes(filters.search.toLowerCase())
          );
        }

        setProjects(filteredProjects);
      } else {
        console.error('Failed to fetch projects');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [filters]);

  const handleCreateProject = () => {
    setEditingProject(null);
    setShowForm(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) {
      return;
    }

    const loadingToast = toast.loading('Deleting project...');

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Project Deleted!', {
          description: 'The project has been deleted successfully.',
          id: loadingToast
        });
        await fetchProjects(); // Refresh the list
      } else {
        const error = await response.json();
        toast.error('Delete Failed', {
          description: error.error || 'Failed to delete project',
          id: loadingToast
        });
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Error', {
        description: 'An error occurred while deleting the project',
        id: loadingToast
      });
    }
  };

  const handleFormSubmit = async (projectData: Partial<Project>) => {
    try {
      const url = editingProject 
        ? `/api/projects/${editingProject.id}`
        : '/api/projects';
      
      const method = editingProject ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (response.ok) {
        setShowForm(false);
        setEditingProject(null);
        await fetchProjects(); // Refresh the list
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save project');
      }
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Error saving project');
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProject(null);
  };

  const handleBulkImport = () => {
    setShowBulkImport(true);
    setShowForm(false);
  };

  const handleBulkImportComplete = async () => {
    setShowBulkImport(false);
    await fetchProjects();
  };

  const handleBulkImportCancel = () => {
    setShowBulkImport(false);
  };

  const handleBulkDelete = async () => {
    if (selectedProjects.length === 0) {
      toast.error('No Projects Selected', {
        description: 'Please select projects to delete'
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedProjects.length} project(s)?`)) {
      return;
    }

    const loadingToast = toast.loading('Deleting Projects', {
      description: `Deleting ${selectedProjects.length} project(s)...`
    });

    let successCount = 0;
    let errorCount = 0;

    for (const projectId of selectedProjects) {
      try {
        const response = await fetch(`/api/projects/${projectId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        console.error('Error deleting project:', error);
        errorCount++;
      }
    }

    if (successCount > 0) {
      toast.success('Projects Deleted!', {
        description: `Successfully deleted ${successCount} project(s)${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
        id: loadingToast
      });
      setSelectedProjects([]);
      await fetchProjects();
    } else {
      toast.error('Delete Failed', {
        description: 'Failed to delete projects',
        id: loadingToast
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Project Management" />

      {!showForm && !showBulkImport ? (
        <>
          {/* Header with Create Button */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Projects
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage your film projects and portfolio content
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleBulkImport}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                <ArrowUpIcon className="w-4 h-4" />
                Bulk Import
              </button>
              <button
                onClick={handleCreateProject}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <PlusIcon className="w-4 h-4" />
                Create Project
              </button>
            </div>
          </div>

          {/* Filters */}
          <ComponentCard title="Filters">
            <ProjectFilters 
              filters={filters}
              onFiltersChange={setFilters}
            />
          </ComponentCard>

          {/* Bulk Actions Bar */}
          {selectedProjects.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between dark:bg-blue-900/20 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                  {selectedProjects.length} project(s) selected
                </span>
                <button
                  onClick={() => setSelectedProjects([])}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Clear selection
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBulkDelete}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  <TrashBinIcon className="w-4 h-4" />
                  Delete Selected
                </button>
              </div>
            </div>
          )}

          {/* Projects Table */}
          <ComponentCard title={`Projects (${projects.length})`}>
            <ProjectTable
              projects={projects}
              loading={loading}
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
              selectedProjects={selectedProjects}
              onSelectionChange={setSelectedProjects}
            />
          </ComponentCard>
        </>
      ) : showBulkImport ? (
        /* Bulk Import */
        <ComponentCard title="Bulk Import Projects">
          <BulkImport
            onImportComplete={handleBulkImportComplete}
            onCancel={handleBulkImportCancel}
            existingProjects={projects.length}
          />
        </ComponentCard>
      ) : (
        /* Project Form */
        <ComponentCard 
          title={editingProject ? "Edit Project" : "Create Project"}
          onBack={handleFormCancel}
        >
          <ProjectForm
            project={editingProject}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            existingProjects={projects}
          />
        </ComponentCard>
      )}
    </div>
  );
}