// Parse CSV from binary data - Process ALL downloaded files
const allVehicles = [];

// Helper function to parse CSV line with quote handling
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// items is the array of all input items in "Run Once for All Items" mode
for (let i = 0; i < items.length; i++) {
  const item = items[i];

  // Check if binary data exists (FTP download stores in 'data' property)
  if (!item.binary || !item.binary.data || !item.binary.data.data) {
    console.log(`Item ${i}: No binary data found - ${item.json?.name || 'unknown file'}`);
    continue;
  }

  // Get binary object and extract base64 data
  const binaryObject = item.binary.data;
  const csvText = Buffer.from(binaryObject.data, 'base64').toString('utf-8');

  // Split into lines
  const lines = csvText.split('\n').filter(line => line.trim());

  if (lines.length === 0) {
    console.log(`Item ${i}: Empty CSV file`);
    continue;
  }

  // Get headers from first line
  const headers = parseCSVLine(lines[0]);

  // Parse all data rows from this CSV
  for (let j = 1; j < lines.length; j++) {
    const values = parseCSVLine(lines[j]);

    // Create object from headers and values
    const vehicle = {};
    headers.forEach((header, index) => {
      vehicle[header] = values[index] || '';
    });

    // Add source file for tracking
    vehicle['_source_file'] = item.json.originalName || item.json.name || 'unknown';

    allVehicles.push({ json: vehicle });
  }
}

console.log(`Parsed ${allVehicles.length} total vehicles from ${items.length} CSV files`);

return allVehicles;
