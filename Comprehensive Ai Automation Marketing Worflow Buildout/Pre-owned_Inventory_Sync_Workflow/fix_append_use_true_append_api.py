#!/usr/bin/env python3
"""
Fix Append to use true APPEND API which is faster and won't get confused by P-Q columns
"""

import json

workflow_path = r'C:\Users\Michael.Sylvester\Comprehensive Ai Automation Marketing Worflow Buildout\Pre-owned_Inventory_Sync_Workflow\workflow_updated.json'

# Read workflow
with open(workflow_path, 'r', encoding='utf-8') as f:
    workflow = json.load(f)

print("Fixing Append Data to use APPEND API...\n")

for node in workflow['nodes']:
    if node.get('name') == 'Google Sheets - Append Data':
        # Set useAppend to TRUE to use the actual APPEND API
        # This is faster and works correctly after clearing
        if 'options' not in node['parameters']:
            node['parameters']['options'] = {}

        node['parameters']['options']['useAppend'] = True

        # Keep locationDefine for clarity
        node['parameters']['options']['locationDefine'] = {
            "values": {
                "headerRow": 1
            }
        }

        print("[OK] Changed to use APPEND API (useAppend: true)")
        print("\nWhy this works:")
        print("  - Clear operation removes A2:N500")
        print("  - APPEND API starts from first empty row in columns A-N")
        print("  - Since A2 is empty after clear, appends from row 2")
        print("  - Faster and more efficient")
        print("  - Ignores columns P-Q completely")
        print("\nOld setting (useAppend: false):")
        print("  - Used UPDATE API (slower)")
        print("  - Scanned entire sheet")
        print("  - Got confused by P-Q having data")
        break

# Write updated workflow
with open(workflow_path, 'w', encoding='utf-8') as f:
    json.dump(workflow, f, indent=2)

print("\n" + "="*60)
print("[SUCCESS] Append API fixed!")
print("="*60)
print("\nImport workflow_updated.json and test")
print("Vehicle data should now append to rows 2+ in columns A-N")
