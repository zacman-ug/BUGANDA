/**
 * Export utilities for generating downloadable files
 */

export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  let csv = headers.join(',') + '\n';
  
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      // Escape quotes and wrap in quotes if contains comma
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || '';
    });
    csv += values.join(',') + '\n';
  });

  // Download file
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToJSON = (data, filename = 'export.json') => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const generateFamilyTreeReport = (individuals) => {
  const report = {
    exportDate: new Date().toISOString(),
    totalMembers: individuals.length,
    genderBreakdown: {
      male: individuals.filter(p => p.gender === 'Male').length,
      female: individuals.filter(p => p.gender === 'Female').length
    },
    clanBreakdown: {},
    members: individuals.map(p => ({
      id: p.id,
      name: p.full_name,
      gender: p.gender,
      clan: p.clan_name,
      bio: p.bio,
      fatherId: p.father_id,
      motherId: p.mother_id
    }))
  };

  // Count by clan
  individuals.forEach(person => {
    const clan = person.clan_name || 'Unassigned';
    report.clanBreakdown[clan] = (report.clanBreakdown[clan] || 0) + 1;
  });

  return report;
};
