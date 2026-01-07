"use client";
import React, { useState } from "react";
import { Project } from "@/lib/db";
import { exportToExcel, exportToJSONFile } from "@/lib/export";
import { DownloadIcon } from "@/icons";

interface ExportMenuProps {
  projects: Project[];
  selectedProjects?: string[];
}

export default function ExportMenu({ projects, selectedProjects = [] }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const projectsToExport = selectedProjects.length > 0
    ? projects.filter(p => selectedProjects.includes(p.id))
    : projects;

  const handleExportCSV = () => {
    exportToExcel(projectsToExport);
    setIsOpen(false);
  };

  const handleExportJSON = () => {
    exportToJSONFile(projectsToExport);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
      >
        <DownloadIcon className="w-4 h-4" />
        Export
        {selectedProjects.length > 0 && (
          <span className="px-2 py-0.5 text-xs font-medium text-blue-600 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300">
            {selectedProjects.length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute right-0 z-20 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                Export {projectsToExport.length} project{projectsToExport.length > 1 ? 's' : ''}
              </div>

              <button
                onClick={handleExportCSV}
                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                  <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                </svg>
                Export as CSV
              </button>

              <button
                onClick={handleExportJSON}
                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Export as JSON
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}