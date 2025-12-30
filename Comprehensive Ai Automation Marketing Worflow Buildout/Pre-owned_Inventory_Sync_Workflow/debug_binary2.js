// DEBUG: Check what's actually IN the binary data
console.log('=== CHECKING BINARY DATA CONTENT ===');

const item = items[0]; // Just check first item

if (item.binary && item.binary.data) {
  const binaryObj = item.binary.data;

  console.log(`\nBinary object properties:`);
  console.log(`  mimeType: ${binaryObj.mimeType}`);
  console.log(`  fileType: ${binaryObj.fileType}`);
  console.log(`  fileName: ${binaryObj.fileName}`);
  console.log(`  fileSize: ${binaryObj.fileSize}`);
  console.log(`  id: ${binaryObj.id}`);

  console.log(`\nData field:`);
  console.log(`  Type: ${typeof binaryObj.data}`);
  console.log(`  Length: ${binaryObj.data ? binaryObj.data.length : 'N/A'}`);
  console.log(`  First 100 chars: ${binaryObj.data ? binaryObj.data.substring(0, 100) : 'N/A'}`);
  console.log(`  Full value: "${binaryObj.data}"`);
}

// Also check if there's a different property that has the actual data
console.log(`\nAll binary.data properties:`);
const binaryDataObj = items[0].binary.data;
for (const key in binaryDataObj) {
  const value = binaryDataObj[key];
  const type = typeof value;
  const preview = type === 'string' ? `"${value.substring(0, 50)}${value.length > 50 ? '...' : ''}"` : value;
  console.log(`  ${key} (${type}): ${preview}`);
}

return [{ json: { test: 'complete' } }];
