#!/usr/bin/env python3
"""
Replace "Read Stock Filters" Google Sheets node with a simple "Set" node
This allows configuring stock filters directly in n8n UI
"""

import json

workflow_path = r'C:\Users\Michael.Sylvester\Comprehensive Ai Automation Marketing Worflow Buildout\Pre-owned_Inventory_Sync_Workflow\workflow_updated.json'

# Read workflow
with open(workflow_path, 'r', encoding='utf-8') as f:
    workflow = json.load(f)

print("Replacing Read Stock Filters with Set node...\n")

# Find the Read Stock Filters node
read_filters_node = None
read_filters_node_idx = None

for idx, node in enumerate(workflow['nodes']):
    if node.get('name') == 'Read Stock Filters':
        read_filters_node = node
        read_filters_node_idx = idx
        break

if not read_filters_node:
    print("[ERROR] Read Stock Filters node not found")
    exit(1)

# Create a new Set node to replace it
set_node = {
    "parameters": {
        "mode": "manual",
        "duplicateItem": False,
        "assignments": {
            "assignments": [
                {
                    "id": "stock-include-1",
                    "name": "Stock_Include",
                    "value": "",
                    "type": "string"
                },
                {
                    "id": "stock-exclude-1",
                    "name": "Stock_Exclude",
                    "value": "",
                    "type": "string"
                }
            ]
        },
        "options": {
            "includeOtherFields": False
        }
    },
    "id": read_filters_node['id'],  # Keep same ID to preserve connections
    "name": "Stock Filters Config",
    "type": "n8n-nodes-base.set",
    "typeVersion": 3.4,
    "position": read_filters_node['position'],
    "notes": "📋 Configure stock filters here (comma-separated)\nStock_Include: 12345,67890,11111\nStock_Exclude: 99999,88888"
}

# Replace the node
workflow['nodes'][read_filters_node_idx] = set_node

print("[OK] Replaced 'Read Stock Filters' with 'Stock Filters Config'")
print(f"    Type: Set node")
print(f"    Position: {set_node['position']}")
print(f"    Fields:")
print(f"      - Stock_Include (comma-separated stock numbers)")
print(f"      - Stock_Exclude (comma-separated stock numbers)")

# Update Filter by Stock List code to parse comma-separated values
filter_node = None
for node in workflow['nodes']:
    if node.get('name') == 'Filter by Stock List':
        filter_node = node
        break

if filter_node:
    new_filter_code = '''// ===================================================================
// FILTER BY STOCK LIST - using Stock Filters Config node
// ===================================================================
// Input 0: Vehicle data from Generate node
// Input 1: Stock filter config from Stock Filters Config node
// ===================================================================

const MIN_VEHICLES = 12;

let allVehicles = $input(0).all();
let configData = $input(1).all();

// Helper: Get stock number from vehicle
function getStockNumber(vehicle) {
  const possibleFields = ['Stock', 'StockNum', 'Stock_Number', 'STOCK', 'Stock #', 'stock', 'id'];
  for (const field of possibleFields) {
    if (vehicle[field]) {
      return String(vehicle[field]).trim().toUpperCase();
    }
  }
  return null;
}

// Parse stock filters from Set node (comma-separated values)
let stockNumbersInclude = [];
let stockNumbersExclude = [];

if (configData.length > 0) {
  const config = configData[0].json;

  // Parse Stock_Include (comma-separated)
  if (config.Stock_Include && String(config.Stock_Include).trim()) {
    const includeStr = String(config.Stock_Include).trim();
    stockNumbersInclude = includeStr.split(',')
      .map(s => s.trim().toUpperCase())
      .filter(s => s.length > 0);
  }

  // Parse Stock_Exclude (comma-separated)
  if (config.Stock_Exclude && String(config.Stock_Exclude).trim()) {
    const excludeStr = String(config.Stock_Exclude).trim();
    stockNumbersExclude = excludeStr.split(',')
      .map(s => s.trim().toUpperCase())
      .filter(s => s.length > 0);
  }
}

console.log(`Stock filters loaded:`);
console.log(`  - Include: ${stockNumbersInclude.length} stocks`);
console.log(`  - Exclude: ${stockNumbersExclude.length} stocks`);

// STEP 1: Remove excluded vehicles
if (stockNumbersExclude.length > 0) {
  const originalCount = allVehicles.length;
  allVehicles = allVehicles.filter(item => {
    const vehicleStock = getStockNumber(item.json);
    return !stockNumbersExclude.includes(vehicleStock);
  });
  console.log(`Excluded ${originalCount - allVehicles.length} vehicles`);
}

// STEP 2: If no include list, return all (after exclusions)
if (stockNumbersInclude.length === 0) {
  console.log(`No include list - returning ${allVehicles.length} vehicles`);
  return allVehicles;
}

// STEP 3: Get matching vehicles
const matchingVehicles = [];
const remainingVehicles = [];

for (const item of allVehicles) {
  const vehicleStock = getStockNumber(item.json);
  if (!vehicleStock) continue;

  if (stockNumbersInclude.includes(vehicleStock)) {
    matchingVehicles.push(item);
  } else {
    remainingVehicles.push(item);
  }
}

console.log(`Matched ${matchingVehicles.length} vehicles from include list`);

// STEP 4: If enough, return
if (matchingVehicles.length >= MIN_VEHICLES) {
  return matchingVehicles;
}

// STEP 5: Add more to reach minimum
const itemsNeeded = MIN_VEHICLES - matchingVehicles.length;
console.log(`Adding ${itemsNeeded} more vehicles to reach minimum ${MIN_VEHICLES}`);

// Sort remaining by price
remainingVehicles.sort((a, b) => {
  const priceA = parseFloat(String(a.json.Price_Is || '0').replace(/,/g, '')) || 0;
  const priceB = parseFloat(String(b.json.Price_Is || '0').replace(/,/g, '')) || 0;
  return priceB - priceA;
});

const additionalVehicles = remainingVehicles.slice(0, itemsNeeded);
const finalVehicles = [...matchingVehicles, ...additionalVehicles];

console.log(`Final: ${finalVehicles.length} vehicles`);
return finalVehicles;'''

    filter_node['parameters']['jsCode'] = new_filter_code
    print("\n[OK] Updated Filter by Stock List code")
    print(f"    Now parses comma-separated stock numbers")

# Write updated workflow
with open(workflow_path, 'w', encoding='utf-8') as f:
    json.dump(workflow, f, indent=2)

print("\n" + "="*60)
print("[SUCCESS] Stock filters now use Set node!")
print("="*60)
print("\nHow to use:")
print("\n1. Import workflow_updated.json")
print("\n2. Open 'Stock Filters Config' node in n8n")
print("\n3. Configure stock filters:")
print("   Stock_Include: 12345,67890,11111")
print("   Stock_Exclude: 99999,88888")
print("\n4. No Google Sheet columns needed!")
print("\nBenefits:")
print("  - Easy to edit directly in n8n UI")
print("  - No spreadsheet columns needed")
print("  - Comma-separated (simple format)")
print("  - Persists with workflow")
