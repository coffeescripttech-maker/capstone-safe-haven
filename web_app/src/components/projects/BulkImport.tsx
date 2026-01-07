"use client";
import React, { useState, useRef } from "react";
import { toast } from "sonner";
import { PlusIcon, ArrowUpIcon } from "@/icons";

interface BulkImportProps {
  onImportComplete: () => void;
  onCancel: () => void;
  existingProjects: number; // Count of existing projects
}

interface ProjectRow {
  title: string;
  client: string;
  languages: string;
  classification: string;
  vimeo_url: string;
  order?: number;
}

export default function BulkImport({ onImportComplete, onCancel, existingProjects }: BulkImportProps) {
  const [importing, setImporting] = useState(false);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [startingOrder, setStartingOrder] = useState(existingProjects);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string): ProjectRow[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const projects: ProjectRow[] = [];

    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Split by tab or comma
      const columns = line.split(/\t|,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(col => 
        col.replace(/^"|"$/g, '').trim()
      );

      if (columns.length >= 5) {
        projects.push({
          title: columns[0],
          client: columns[1],
          languages: columns[2],
          classification: columns[3],
          vimeo_url: columns[4],
          order: columns[5] ? parseInt(columns[5]) : undefined
        });
      }
    }

    return projects;
  };

  const extractVimeoId = (url: string): string => {
    // Extract Vimeo ID from URL
    // https://vimeo.com/414307456 -> 414307456
    // https://vimeo.com/1121147230/bc7e8ebc72 -> 1121147230
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : '';
  };

  const mapClassification = (classification: string): { category: string; data_cat: string } => {
    const upperClass = classification.toUpperCase();
    
    const mapping: Record<string, { category: string; data_cat: string }> = {
      'TVC': { category: 'Television Commercial', data_cat: 'commercial' },
      'BRAND FILM': { category: 'Brand Film / Corporate', data_cat: 'corporate' },
      'DOCUMENTARY': { category: 'Documentary', data_cat: 'documentary' },
      'COMMERCIAL': { category: 'Commercial', data_cat: 'commercial' },
      'GOVERNMENT': { category: 'Government / Strategic Communication', data_cat: 'government' },
      'TOURISM': { category: 'Tourism / Destination Marketing', data_cat: 'tourism' },
      'CORPORATE': { category: 'Corporate Video', data_cat: 'corporate' }
    };

    return mapping[upperClass] || { category: 'Commercial', data_cat: 'commercial' };
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsedProjects = parseCSV(text);
      
      if (parsedProjects.length === 0) {
        toast.error('No Projects Found', {
          description: 'Could not parse any projects from the file'
        });
        return;
      }

      setProjects(parsedProjects);
      toast.success('File Loaded', {
        description: `Found ${parsedProjects.length} projects to import`
      });
    };

    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (projects.length === 0) {
      toast.error('No Projects', {
        description: 'Please load a CSV file first'
      });
      return;
    }

    setImporting(true);
    let successCount = 0;
    let errorCount = 0;

    const loadingToast = toast.loading('Importing Projects', {
      description: `Processing 0 of ${projects.length}...`
    });

    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];
      
      try {
        const vimeoId = extractVimeoId(project.vimeo_url);
        const mapping = mapClassification(project.classification);

        const projectData = {
          title: project.title,
          client: project.client,
          category: mapping.category,
          data_cat: mapping.data_cat,
          languages: project.languages,
          classification: project.classification,
          vimeo_id: vimeoId,
          video_url: `https://player.vimeo.com/video/${vimeoId}`,
          poster_image: '', // Will need to be added manually
          poster_image_srcset: '',
          credits: [],
          order_index: project.order !== undefined ? project.order : (startingOrder + i),
          is_featured: false,
          is_published: true
        };

        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectData)
        });

        if (response.ok) {
          successCount++;
        } else {
          errorCount++;
          console.error(`Failed to import: ${project.title}`);
        }

        // Update progress
        toast.loading('Importing Projects', {
          description: `Processing ${i + 1} of ${projects.length}...`,
          id: loadingToast
        });

      } catch (error) {
        errorCount++;
        console.error(`Error importing ${project.title}:`, error);
      }
    }

    setImporting(false);

    if (successCount > 0) {
      toast.success('Import Complete!', {
        description: `Successfully imported ${successCount} projects${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
        id: loadingToast
      });
      onImportComplete();
    } else {
      toast.error('Import Failed', {
        description: 'No projects were imported successfully',
        id: loadingToast
      });
    }
  };

  const handlePasteData = () => {
    const textarea = document.createElement('textarea');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      const text = e.clipboardData?.getData('text');
      if (text) {
        const parsedProjects = parseCSV(text);
        if (parsedProjects.length > 0) {
          setProjects(parsedProjects);
          toast.success('Data Pasted', {
            description: `Found ${parsedProjects.length} projects`
          });
        }
      }
      document.body.removeChild(textarea);
    };

    textarea.addEventListener('paste', handlePaste);
    document.execCommand('paste');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Bulk Import Projects
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Import multiple projects from CSV or paste from Excel/Google Sheets
        </p>
      </div>

      {/* Upload Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CSV Upload */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:border-gray-600 dark:hover:border-blue-500 dark:hover:bg-blue-900/20 transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
          <ArrowUpIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            Upload CSV File
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Click to select a CSV file
          </p>
        </div>

        {/* Paste Data */}
        <div
          onClick={handlePasteData}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:border-gray-600 dark:hover:border-blue-500 dark:hover:bg-blue-900/20 transition-colors"
        >
          <PlusIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            Paste from Excel
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Copy from Excel/Sheets and click here
          </p>
        </div>
      </div>

      {/* Starting Order Configuration */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              Starting Order Index
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {existingProjects > 0 
                ? `You have ${existingProjects} existing projects. New projects will start from order ${startingOrder}.`
                : 'New projects will start from order 0.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">Start from:</label>
            <input
              type="number"
              min="0"
              value={startingOrder}
              onChange={(e) => setStartingOrder(parseInt(e.target.value) || 0)}
              className="w-20 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* CSV Format Guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900/20 dark:border-blue-800">
        <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
          Expected Format (Tab or Comma Separated)
        </h3>
        <div className="text-xs text-blue-700 dark:text-blue-400 font-mono bg-white dark:bg-gray-900 p-3 rounded overflow-x-auto">
          <div>Project name, Client Name, Available Languages, Classification, English Video Link, Order (optional)</div>
          <div className="mt-1 text-gray-600 dark:text-gray-400">
            The Abu Dhabi Plan, Abu Dhabi Executive Council, Arabic & English, TVC, https://vimeo.com/414307456
          </div>
          <div className="mt-1 text-gray-600 dark:text-gray-400">
            Or with custom order: ..., https://vimeo.com/414307456, 5
          </div>
        </div>
      </div>

      {/* Preview */}
      {projects.length > 0 && (
        <div className="border border-gray-200 rounded-lg dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Preview ({projects.length} projects)
            </h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Order</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Title</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Client</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {projects.map((project, index) => {
                  const orderIndex = project.order !== undefined ? project.order : (startingOrder + index);
                  return (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-2 text-gray-900 dark:text-white font-mono text-sm">{orderIndex}</td>
                      <td className="px-4 py-2 text-gray-900 dark:text-white">{project.title}</td>
                      <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{project.client}</td>
                      <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{project.classification}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={importing}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleImport}
          disabled={importing || projects.length === 0}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {importing ? `Importing... (${projects.length} projects)` : `Import ${projects.length} Projects`}
        </button>
      </div>
    </div>
  );
}
