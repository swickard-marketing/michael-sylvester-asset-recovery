#!/usr/bin/env python3
"""
Complete fix for stock filter:
1. Add Read Stock Filters node
2. Update connections automatically
3. Update Filter code to use the read data
"""

import json
import uuid

workflow_path = r'C:\Users\Michael.Sylvester\Comprehensive Ai Automation Marketing Worflow Buildout\Pre-owned_Inventory_Sync_Workflow\workflow_updated.json'

# Read workflow
with open(workflow_path, 'r', encoding='utf-8') as f:
    workflow = json.load(f)

print("Applying complete stock filter fix...\n")

# Find required nodes
generate_node = None
filter_node = None

for node in workflow['nodes']:
    if node.get('name') == 'Generate URLs & Transform Fields':
        generate_node = node
    elif node.get('name') == 'Filter by Stock List':
        filter_node = node

if not generate_node or not filter_node:
    print("[ERROR] Could not find required nodes")
    exit(1)

# Create Read Stock Filters node with unique ID
read_node_id = str(uuid.uuid4())

new_read_node = {
    "parameters": {
        "operation": "read",
        "documentId": {
            "__rl": True,
            "value": "1PkU3Sh9fgWWaz25OqymT2P_EWzB_UvWghgrizTWjHlA",
            "mode": "id"
        },
        "sheetName": {
            "__rl": True,
            "value": "Pre-Owned Specials Automation",
            "mode": "name"
        },
        "filtersUI": {
            "values": []
        },
        "options": {
            "dataLocationOnSheet": {
                "values": {
                    "rangeDefinition": "specifyRangeA1",
                    "range": "P2:Q500"
                }
            }
        }
    },
    "id": read_node_id,
    "name": "Read Stock Filters",
    "type": "n8n-nodes-base.googleSheets",
    "typeVersion": 4.4,
    "position": [
        1448,  # Between Generate (1232) and Filter (1664)
        1600   # Above the main flow
    ],
    "credentials": {
        "googleSheetsOAuth2Api": {
            "id": "r97IPYNy0EoZGTUr",
            "name": "Google Sheets account"
        }
    },
    "notes": "📋 Reads P (Stock_Include) & Q (Stock_Exclude)"
}

# Add the new node
workflow['nodes'].append(new_read_node)
print("[OK] Added 'Read Stock Filters' node")

# Update connections
# Add connection: Generate -> Read Stock Filters
if 'connections' not in workflow:
    workflow['connections'] = {}

generate_node_name = generate_node['name']
read_node_name = new_read_node['name']
filter_node_name = filter_node['name']

# Initialize connections if needed
if generate_node_name not in workflow['connections']:
    workflow['connections'][generate_node_name] = {"main": [[]]}

# Add connection from Generate to Read Stock Filters
workflow['connections'][generate_node_name]['main'][0].append({
    "node": read_node_name,
    "type": "main",
    "index": 0
})

# Add connection from Read Stock Filters to Filter
workflow['connections'][read_node_name] = {
    "main": [[
        {
            "node": filter_node_name,
            "type": "main",
            "index": 1  # Second input (filters data)
        }
    ]]
}

print("[OK] Updated connections")
print(f"  {generate_node_name} -> {read_node_name}")
print(f"  {read_node_name} -> {filter_node_name} (input 1)")

#Update Filter code to read from $input(1)
new_filter_code = '''// ===================================================================
// FILTER BY STOCK LIST - using data from Read Stock Filters node
// ===================================================================
// Input 0: Vehicle data from Generate node
// Input 1: Stock filters from Read Stock Filters node (columns P-Q)
// ===================================================================

const MIN_VEHICLES = 12;

let allVehicles = $input(0).all();  // Vehicle data
let filterData = $input(1).all();   // Stock filter data from sheet

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

// Parse stock filters from Read Stock Filters node
let stockNumbersInclude = [];
let stockNumbersExclude = [];

for (const item of filterData) {
  const row = item.json;
  // Stock_Include from column P
  if (row.Stock_Include && String(row.Stock_Include).trim()) {
    stockNumbersInclude.push(String(row.Stock_Include).trim().toUpperCase());
  }
  // Stock_Exclude from column Q
  if (row.Stock_Exclude && String(row.Stock_Exclude).trim()) {
    stockNumbersExclude.push(String(row.Stock_Exclude).trim().toUpperCase());
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

# Update the filter node code
filter_node['parameters']['jsCode'] = new_filter_code
print("[OK] Updated Filter by Stock List code")

# Write updated workflow
with open(workflow_path, 'w', encoding='utf-8') as f:
    json.dump(workflow, f, indent=2)

print("\n" + "="*60)
print("[SUCCESS] Complete fix applied!")
print("="*60)
print("\nWhat changed:")
print("1. Added 'Read Stock Filters' node (reads P2:Q500)")
print("2. Connected: Generate -> Read Stock Filters -> Filter")
print("3. Updated Filter code to use Read Stock Filters data")
print("\nThe stock filter will now properly read columns P-Q!")
print("\nImport workflow_updated.json to apply all changes")
