#!/usr/bin/env python3
"""
Update Sprinter exception dealer list to only include actual dealers
"""

import json

workflow_path = r'C:\Users\Michael.Sylvester\Comprehensive Ai Automation Marketing Worflow Buildout\Pre-owned_Inventory_Sync_Workflow\workflow_updated.json'

# Read workflow
with open(workflow_path, 'r', encoding='utf-8') as f:
    workflow = json.load(f)

print("Updating Sprinter dealer exception list...\n")

# Find the Filter Pre-Owned Specials node
filter_node = None
for node in workflow['nodes']:
    if node.get('name') == 'Filter Pre-Owned Specials':
        filter_node = node
        break

if not filter_node:
    print("[ERROR] Filter Pre-Owned Specials node not found!")
    exit(1)

current_code = filter_node['parameters']['jsCode']

# Update Sprinter dealer list to only include actual dealers
updated_code = current_code.replace(
    '''// Sprinter exception dealers (Mercedes-Benz specialty commercial vehicles)
const SPRINTER_SUPPLEMENT_DEALERS = [
  "Mercedes-Benz of Anchorage",
  "Mercedes-Benz of Honolulu",
  "Mercedes-Benz of Marin",
  "Mercedes-Benz of Maui",
  "Mercedes-Benz of Palo Alto"
];''',
    '''// Sprinter exception dealers (Mercedes-Benz specialty commercial vehicles)
// Only includes dealers that actually exist in FTP files
const SPRINTER_SUPPLEMENT_DEALERS = [
  "Mercedes-Benz of Palo Alto",  // MBPA01 - exists in FTP
  "Mercedes-Benz of Lynnwood",   // MBLYN01 - exists in FTP
  "Mercedes-Benz of Seattle",    // MBSEA01 - exists in FTP
  "Mercedes-Benz of Tacoma"      // MBTAC01 - exists in FTP
];'''
)

filter_node['parameters']['jsCode'] = updated_code

# Write updated workflow
with open(workflow_path, 'w', encoding='utf-8') as f:
    json.dump(workflow, f, indent=2)

print("[OK] Updated Sprinter dealer exception list")
print("\nRemoved (don't exist in FTP):")
print("  - Mercedes-Benz of Anchorage")
print("  - Mercedes-Benz of Honolulu")
print("  - Mercedes-Benz of Marin")
print("  - Mercedes-Benz of Maui")

print("\nKept/Added (exist in FTP):")
print("  - Mercedes-Benz of Palo Alto (MBPA01)")
print("  - Mercedes-Benz of Lynnwood (MBLYN01)")
print("  - Mercedes-Benz of Seattle (MBSEA01)")
print("  - Mercedes-Benz of Tacoma (MBTAC01)")

print("\n" + "="*60)
print("[SUCCESS] Sprinter exception list updated!")
print("="*60)
print("\nIf you get Sprinter vehicles from any of these dealers,")
print("they will bypass the 100 mile minimum mileage filter.")
