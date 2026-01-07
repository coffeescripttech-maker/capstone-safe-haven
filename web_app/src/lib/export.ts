import { Project } from './db';

// Export projects to CSV
export function exportToCSV(projects: Project[]): string {
  const headers = [
    'ID',
    'Title',
    'Client',
    'Category',
    'Data Category',
    'Languages',
    'Classification',
    'Vimeo ID',
    'Video URL',
    'Poster Image',
    'Order Index',
    'Featured',
    'Published',
    'Created At',
    'Updated At'
  ];

  const rows = projects.map(project => [
    project.id,
    `"${project.title?.replace(/"/g, '""') || ''}"`,
    `"${project.client?.replace(/"/g, '""') || ''}"`,
    `"${project.category?.replace(/"/g, '""') || ''}"`,
    project.data_cat || '',
    project.languages || '',
    project.classification || '',
    project.vimeo_id || '',
    project.video_url || '',
    project.poster_image || '',
    project.order_index,
    project.is_featured ? 'Yes' : 'No',
    project.is_published ? 'Yes' : 'No',
    project.created_at,
    project.updated_at
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csvContent;
}

// Export projects to JSON
export function exportToJSON(projects: Project[]): string {
  return JSON.stringify(projects, null, 2);
}

// Download file helper
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export to Excel-compatible format
export function exportToExcel(projects: Project[]) {
  const csv = exportToCSV(projects);
  downloadFile(csv, `projects-export-${Date.now()}.csv`, 'text/csv;charset=utf-8;');
}

// Export to JSON file
export function exportToJSONFile(projects: Project[]) {
  const json = exportToJSON(projects);
  downloadFile(json, `projects-export-${Date.now()}.json`, 'application/json');
}