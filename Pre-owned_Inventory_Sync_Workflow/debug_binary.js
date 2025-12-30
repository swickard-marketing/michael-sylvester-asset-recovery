// DEBUG: Check what binary data structure looks like
console.log('=== STARTING BINARY DEBUG ===');
console.log(`Total items received: ${items.length}`);

const results = [];

// Just check first 3 items to see structure
for (let i = 0; i < Math.min(3, items.length); i++) {
  const item = items[i];

  console.log(`\n--- Item ${i} ---`);
  console.log(`Has binary property: ${!!item.binary}`);

  if (item.binary) {
    console.log(`Binary keys: ${Object.keys(item.binary).join(', ')}`);

    if (item.binary.data) {
      console.log(`Binary.data exists: true`);
      console.log(`Binary.data type: ${typeof item.binary.data}`);
      console.log(`Binary.data keys: ${Object.keys(item.binary.data).join(', ')}`);

      if (item.binary.data.data) {
        console.log(`Binary.data.data type: ${typeof item.binary.data.data}`);
        console.log(`Binary.data.data length: ${item.binary.data.data.length}`);
      }
    }
  }

  if (item.json) {
    console.log(`JSON name: ${item.json.name}`);
    console.log(`JSON originalName: ${item.json.originalName}`);
  }

  // Return a test item
  results.push({
    json: {
      test: 'debug',
      itemNumber: i,
      hasData: !!item.binary?.data
    }
  });
}

console.log('\n=== DEBUG COMPLETE ===');
return results;
