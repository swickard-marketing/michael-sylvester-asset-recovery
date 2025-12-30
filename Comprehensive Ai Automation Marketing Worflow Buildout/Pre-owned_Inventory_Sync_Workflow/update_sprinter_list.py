#!/usr/bin/env python3
"""
Update Sprinter exception list - no MB dealers in FTP files
"""

import json

workflow_path = r'C:\Users\Michael.Sylvester\Comprehensive Ai Automation Marketing Worflow Buildout\Pre-owned_Inventory_Sync_Workflow\workflow_updated.json'

# Read workflow
with open(workflow_path, 'r', encoding='utf-8') as f:
    workflow = json.load(f)

print("Updating Sprinter exception list...\n")

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

# Update Sprinter dealer list to empty (no MB dealers in FTP)
updated_code = current_code.replace(
    '''// Sprinter exception dealers (Mercedes-Benz specialty commercial vehicles)
// Only includes dealers that actually exist in FTP files
const SPRINTER_SUPPLEMENT_DEALERS = [
  "Mercedes-Benz of Palo Alto",  // MBPA01 - exists in FTP
  "Mercedes-Benz of Lynnwood",   // MBLYN01 - exists in FTP
  "Mercedes-Benz of Seattle",    // MBSEA01 - exists in FTP
  "Mercedes-Benz of Tacoma"      // MBTAC01 - exists in FTP
];''',
    '''// Sprinter exception dealers (Mercedes-Benz specialty commercial vehicles)
// Currently empty - no Mercedes-Benz dealers in FTP files
// Add dealer names here if MB dealers are added later
const SPRINTER_SUPPLEMENT_DEALERS = [];'''
)

filter_node['parameters']['jsCode'] = updated_code

# Write updated workflow
with open(workflow_path, 'w', encoding='utf-8') as f:
    json.dump(workflow, f, indent=2)

print("[OK] Updated Sprinter exception list")
print("\nSprinter exception dealers: NONE (no Mercedes-Benz dealers in FTP)")
print("\nIf Mercedes-Benz dealers are added later, update this list with:")
print("  - Mercedes-Benz of [Location]")

print("\n" + "="*60)
print("[SUCCESS] Sprinter list updated!")
print("="*60)
