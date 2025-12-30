// Parse CSV from binary data - FILESYSTEM MODE FIX
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

// Process all items using $binary helper (works with filesystem mode)
for (let i = 0; i < items.length; i++) {
  const item = items[i];

  if (!item.binary || !item.binary.data) {
    console.log(`Item ${i}: No binary data found`);
    continue;
  }

  try {
    // Use the helpers to get binary data buffer (handles filesystem mode)
    const binaryDataBuffer = await this.helpers.getBinaryDataBuffer(i, 'data');

    // Convert buffer to string
    const csvText = binaryDataBuffer.toString('utf-8');

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

  } catch (error) {
    console.log(`Item ${i}: Error parsing CSV - ${error.message}`);
    continue;
  }
}

console.log(`Parsed ${allVehicles.length} total vehicles from ${items.length} CSV files`);

return allVehicles;
