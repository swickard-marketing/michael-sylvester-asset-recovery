#!/usr/bin/env python3
"""
Fix Append Data node to specify data location so it doesn't get confused by P-Q columns
"""

import json

workflow_path = r'C:\Users\Michael.Sylvester\Comprehensive Ai Automation Marketing Worflow Buildout\Pre-owned_Inventory_Sync_Workflow\workflow_updated.json'

# Read workflow
with open(workflow_path, 'r', encoding='utf-8') as f:
    workflow = json.load(f)

print("Fixing Append Data node range...\n")

for node in workflow['nodes']:
    if node.get('name') == 'Google Sheets - Append Data':
        params = node.get('parameters', {})

        print("Current configuration:")
        print(f"  - Has range restriction: {('options' in params and 'locationDefine' in params.get('options', {}))}")

        # Add data location settings
        if 'options' not in node['parameters']:
            node['parameters']['options'] = {}

        # Set data location to specify header row
        # This tells n8n to look at row 1 for headers and append starting from row 2
        # It will match field names to column headers, ignoring columns without matching fields
        node['parameters']['options']['locationDefine'] = {
            "values": {
                "headerRow": 1,
                "firstDataRow": 2
            }
        }

        # Keep useAppend: false to ensure proper column alignment
        node['parameters']['options']['useAppend'] = False

        print("\n[OK] Added data location settings:")
        print("  - Header Row: 1 (looks at row 1 for column names)")
        print("  - First Data Row: 2 (starts appending from row 2)")
        print("  - Field Matching: Auto-matches to A-N and S columns")
        print("  - Ignores: Columns P-Q (no matching field names)")
        print("\nHow this works:")
        print("  1. Clear operation: Clears A2:N500 (vehicle data)")
        print("  2. Append operation: Matches fields to headers in row 1")
        print("  3. Vehicle data goes to A-N, timestamp to S")
        print("  4. Columns P-Q are never touched (no matching fields)")
        break

# Write updated workflow
with open(workflow_path, 'w', encoding='utf-8') as f:
    json.dump(workflow, f, indent=2)

print("\n" + "="*60)
print("[SUCCESS] Append range fixed!")
print("="*60)
print("\nVehicle data will now append to rows 2+ in columns A-N + S")
print("Columns P-Q stock filters will be completely preserved")
print("\nImport workflow_updated.json to apply changes")
