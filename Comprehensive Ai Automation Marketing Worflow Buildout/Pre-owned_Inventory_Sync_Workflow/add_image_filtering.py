#!/usr/bin/env python3
"""
Add image filtering logic + Sprinter mileage exception from Python script to n8n workflow
This adds:
1. 3-layer image filtering to the Filter Pre-Owned Specials node
2. Sprinter exception to mileage filter (Mercedes-Benz dealers)
"""

import json

workflow_path = r'C:\Users\Michael.Sylvester\Comprehensive Ai Automation Marketing Worflow Buildout\Pre-owned_Inventory_Sync_Workflow\workflow_updated.json'

# Read workflow
with open(workflow_path, 'r', encoding='utf-8') as f:
    workflow = json.load(f)

print("Adding image filtering to Filter Pre-Owned Specials node...\n")

# Find the Filter Pre-Owned Specials node
filter_node = None
for node in workflow['nodes']:
    if node.get('name') == 'Filter Pre-Owned Specials':
        filter_node = node
        break

if not filter_node:
    print("[ERROR] Filter Pre-Owned Specials node not found")
    exit(1)

# New filter code with image filtering and Sprinter exception
new_filter_code = '''// ===================================================================
// FILTER PRE-OWNED SPECIALS - PRODUCTION FILTERS + IMAGE FILTERING
// ===================================================================
// Applies multi-stage filtering to find high-quality pre-owned specials:
// 1. Condition: Must be USED
// 2. Stock Required: Must have stock number
// 3. Price Range: $2,001 - $99,999
// 4. Mileage: Must have >= 100 miles (EXCEPTION: Sprinter vehicles from MB dealers)
// 5. Price Validation: Price_Was must be > Price_Is
// 6. Required Fields: Must have all essential fields
// 7. Min Field Count: Must have at least 10 fields
// 8. Image Filtering (3 layers):
//    - Image must exist
//    - Image must not be placeholder
//    - Image count must be >= 10 images

const vehicles = $input.all();

// Sprinter exception dealers (Mercedes-Benz specialty commercial vehicles)
const SPRINTER_SUPPLEMENT_DEALERS = [
  "Mercedes-Benz of Anchorage",
  "Mercedes-Benz of Honolulu",
  "Mercedes-Benz of Marin",
  "Mercedes-Benz of Maui",
  "Mercedes-Benz of Palo Alto"
];

// ===================================================================
// HELPER FUNCTIONS
// ===================================================================

/**
 * Get field value with multiple possible field names (fallback pattern)
 * Tries each field name in order until one is found
 */
function getField(obj, fieldNames) {
  for (const name of fieldNames) {
    if (obj[name] !== undefined && obj[name] !== null && obj[name] !== '') {
      return obj[name];
    }
  }
  return null;
}

/**
 * Parse price - handles strings with $ and commas and "USD" suffix
 */
function parsePrice(value) {
  if (!value) return null;
  const str = String(value).replace(/[^0-9.]/g, ''); // Remove everything except numbers and decimal
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

/**
 * Parse mileage - handles strings with commas and "Miles" suffix
 */
function parseMileage(value) {
  if (!value) return null;
  const str = String(value).replace(/[^0-9]/g, ''); // Remove everything except numbers
  const num = parseInt(str, 10);
  return isNaN(num) ? null : num;
}

/**
 * Count vehicle images (main image + additional images)
 * Matches Python function: count_vehicle_images()
 */
function countVehicleImages(vehicle) {
  let count = 0;

  // Count main image
  const mainImage = getField(vehicle, ['image_link', 'Main_Photo', 'main_photo', 'PHOTO']);
  if (mainImage && String(mainImage).trim()) {
    count += 1;
  }

  // Count additional images (comma-separated)
  const additionalImages = getField(vehicle, ['additional_image_link', 'additional_images']);
  if (additionalImages && String(additionalImages).trim()) {
    const imageList = String(additionalImages).split(',')
      .map(img => img.trim())
      .filter(img => img.length > 0);
    count += imageList.length;
  }

  return count;
}

/**
 * Detect if image URL is a placeholder or "coming soon" image
 * Matches Python function: is_placeholder_image()
 */
function isPlaceholderImage(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return true; // No URL or invalid URL is considered a placeholder
  }

  const urlLower = imageUrl.toLowerCase();

  // Common placeholder patterns (17 patterns)
  const placeholderPatterns = [
    'nophoto',
    'no-photo',
    'no_photo',
    'placeholder',
    'coming-soon',
    'comingsoon',
    'coming_soon',
    'default',
    'unavailable',
    'image-not-available',
    'imagenotavailable',
    'temp',
    'temporary',
    'missing',
    'awaiting',
    'pending'
  ];

  // Check if any pattern is in the URL
  for (const pattern of placeholderPatterns) {
    if (urlLower.includes(pattern)) {
      return true;
    }
  }

  // Common placeholder filenames (8 filenames)
  const placeholderFilenames = [
    'placeholder.jpg',
    'placeholder.png',
    'nophoto.jpg',
    'nophoto.png',
    'default.jpg',
    'default.png',
    'coming-soon.jpg',
    'coming-soon.png'
  ];

  for (const filename of placeholderFilenames) {
    if (urlLower.endsWith(filename)) {
      return true;
    }
  }

  return false;
}

// ===================================================================
// FILTER CRITERIA (matching Python script)
// ===================================================================
const MIN_PRICE = 2001;
const MAX_PRICE = 99999;
const MIN_MILEAGE = 100;
const MIN_FIELDS = 10;
const MIN_IMAGE_COUNT = 10; // NEW: Minimum images required

// ===================================================================
// FILTERING LOGIC
// ===================================================================

const stats = {
  total: vehicles.length,
  condition_filtered: 0,
  stock_filtered: 0,
  price_too_low: 0,
  price_too_high: 0,
  price_invalid: 0,
  mileage_filtered: 0,
  price_validation_failed: 0,
  missing_fields: 0,
  min_fields_filtered: 0,
  skipped_image: 0,           // NEW
  skipped_placeholder: 0,     // NEW
  skipped_image_count: 0,     // NEW
  passed: 0
};

const filteredVehicles = vehicles.filter(item => {
  const vehicle = item.json;

  // === FILTER 1: Condition Check (USED only) ===
  // CSV has "Used" (capitalized), so we need case-insensitive check
  const condition = getField(vehicle, ['condition', 'Condition', 'CONDITION', 'Type', 'TYPE']);
  if (condition && condition.toUpperCase() !== 'USED') {
    stats.condition_filtered++;
    return false;
  }

  // === FILTER 2: Stock Number Required ===
  // CSV uses 'id' field for stock number
  const stockNum = getField(vehicle, ['id', 'Stock', 'StockNum', 'stock', 'Stock_Number', 'STOCK', 'Stock #']);
  if (!stockNum) {
    stats.stock_filtered++;
    return false;
  }

  // === FILTER 3: Price Range ===
  // CSV has price as "40650 USD" format
  const priceIs = parsePrice(getField(vehicle, ['price', 'Price', 'Price_Is', 'PRICE', 'Internet_Price', 'Sale_Price']));
  if (!priceIs) {
    stats.price_invalid++;
    return false;
  }
  if (priceIs <= MIN_PRICE) {
    stats.price_too_low++;
    return false;
  }
  if (priceIs > MAX_PRICE) {
    stats.price_too_high++;
    return false;
  }

  // === FILTER 4: Mileage (with Sprinter Exception) ===
  // CSV has mileage as "37806 Miles" format
  const mileage = parseMileage(getField(vehicle, ['mileage', 'Mileage', 'MILEAGE', 'Odometer', 'Miles']));
  if (!mileage || mileage < MIN_MILEAGE) {
    // EXCEPTION: Sprinter vehicles from Mercedes-Benz dealers are exempt
    // These are specialty commercial vehicles with different inventory patterns
    const dealerName = getField(vehicle, ['Dealer_Name', 'dealer_name', '_source_file']);
    const vehicleName = getField(vehicle, ['vehicle_name', 'title', 'Title']);
    const model = getField(vehicle, ['model', 'Model']);

    const isSprinter = (vehicleName && vehicleName.includes('Sprinter')) ||
                       (model && model.includes('Sprinter'));
    const isSprinterDealer = dealerName && SPRINTER_SUPPLEMENT_DEALERS.some(d => dealerName.includes(d));

    if (isSprinter && isSprinterDealer) {
      // Allow Sprinter from MB dealer regardless of mileage
      console.log(`Sprinter exception: Allowing ${dealerName} - ${vehicleName} with ${mileage || 0} miles`);
    } else {
      stats.mileage_filtered++;
      return false;
    }
  }

  // === FILTER 5: Price Validation (Was > Is) ===
  // CSV has vehicle_msrp as "43426 USD" format
  const priceWas = parsePrice(getField(vehicle, ['vehicle_msrp', 'Price_Was', 'MSRP', 'msrp', 'Original_Price']));
  if (priceWas && priceWas <= priceIs) {
    stats.price_validation_failed++;
    return false;
  }

  // === FILTER 6: Required Fields ===
  // CRITICAL FIX: CSV uses 'link_template' not 'link', and 'image_link' not 'image'
  const vin = getField(vehicle, ['VIN', 'vin']);
  const image = getField(vehicle, ['image_link', 'Main_Photo', 'Image', 'Photo', 'image']);
  const url = getField(vehicle, ['link_template', 'link', 'VDP_URL_1', 'URL', 'url']);

  if (!vin || !image || !url) {
    stats.missing_fields++;
    return false;
  }

  // === FILTER 7: Minimum Field Count ===
  // Ensures vehicle has sufficient data quality
  if (Object.keys(vehicle).length < MIN_FIELDS) {
    stats.min_fields_filtered++;
    return false;
  }

  // === FILTER 8: IMAGE FILTERING (3 LAYERS) ===

  // Layer 1: Image must exist
  const imageUrl = getField(vehicle, ['image_link', 'Main_Photo', 'main_photo', 'PHOTO']);
  if (!imageUrl) {
    stats.skipped_image++;
    return false;
  }

  // Layer 2: Image must not be placeholder
  if (isPlaceholderImage(imageUrl)) {
    stats.skipped_placeholder++;
    return false;
  }

  // Layer 3: Image count must meet minimum
  if (MIN_IMAGE_COUNT > 0) {
    const imageCount = countVehicleImages(vehicle);
    if (imageCount < MIN_IMAGE_COUNT) {
      stats.skipped_image_count++;
      const stock = stockNum || 'Unknown';
      console.log(`IMAGE COUNT FILTER: Skipping Stock ${stock} - has ${imageCount} images, requires ${MIN_IMAGE_COUNT}`);
      return false;
    }
  }

  stats.passed++;
  return true;
});

// ===================================================================
// LOG FILTER STATISTICS
// ===================================================================
console.log('=== Vehicle Filtering Stats ===');
console.log(`Total vehicles: ${stats.total}`);
console.log('Filtered out:');
console.log(`  - Condition (not USED): ${stats.condition_filtered}`);
console.log(`  - Missing stock number: ${stats.stock_filtered}`);
console.log(`  - Price too low (≤$${MIN_PRICE}): ${stats.price_too_low}`);
console.log(`  - Price too high (>$${MAX_PRICE}): ${stats.price_too_high}`);
console.log(`  - Price invalid/missing: ${stats.price_invalid}`);
console.log(`  - Mileage too low (<${MIN_MILEAGE}): ${stats.mileage_filtered}`);
console.log(`  - Price validation failed (Was≤Is): ${stats.price_validation_failed}`);
console.log(`  - Missing required fields: ${stats.missing_fields}`);
console.log(`  - Min field count (<${MIN_FIELDS}): ${stats.min_fields_filtered}`);
console.log(`  - Image missing: ${stats.skipped_image}`);
console.log(`  - Image is placeholder: ${stats.skipped_placeholder}`);
console.log(`  - Image count too low (<${MIN_IMAGE_COUNT}): ${stats.skipped_image_count}`);
console.log(`Passed filters: ${stats.passed} vehicles`);
console.log('================================');

return filteredVehicles;'''

# Update the filter node code
filter_node['parameters']['jsCode'] = new_filter_code

# Write updated workflow
with open(workflow_path, 'w', encoding='utf-8') as f:
    json.dump(workflow, f, indent=2)

print("[OK] Updated Filter Pre-Owned Specials node")
print("\n=== IMAGE FILTERING ===")
print("  - MIN_IMAGE_COUNT: 10 images")
print("  - Layer 1: Image must exist")
print("  - Layer 2: Image must not be placeholder")
print("  - Layer 3: Image count >= 10")
print("\nPlaceholder Detection:")
print("  - 17 patterns: nophoto, placeholder, coming-soon, etc.")
print("  - 8 filenames: placeholder.jpg, nophoto.png, etc.")
print("\nImage Counting:")
print("  - Counts main image (image_link)")
print("  - Counts additional images (comma-separated)")

print("\n=== MILEAGE FILTER UPDATE ===")
print("  - Sprinter exception added")
print("  - Mercedes-Benz dealers: Anchorage, Honolulu, Marin, Maui, Palo Alto")
print("  - Sprinter vehicles bypass MIN_MILEAGE requirement")
print("  - Specialty commercial vehicle handling")

print("\n=== STATISTICS TRACKED ===")
print("  - skipped_image: Missing image URL")
print("  - skipped_placeholder: Placeholder detected")
print("  - skipped_image_count: Below 10 image threshold")

print("\n" + "="*60)
print("[SUCCESS] Python to n8n migration complete!")
print("="*60)
print("\nChanges Applied:")
print("  1. countVehicleImages() function")
print("  2. isPlaceholderImage() function")
print("  3. MIN_IMAGE_COUNT = 10 constant")
print("  4. 3-layer image filtering logic")
print("  5. Sprinter mileage exception")
print("  6. SPRINTER_SUPPLEMENT_DEALERS list")
print("  7. Updated filter statistics")
print("\nWorkflow ready to import into n8n!")
