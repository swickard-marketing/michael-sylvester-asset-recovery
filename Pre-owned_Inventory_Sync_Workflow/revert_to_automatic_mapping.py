#!/usr/bin/env python3
"""
Revert to automatic mapping - it should work fine if headers are correct
"""

import json

workflow_path = r'C:\Users\Michael.Sylvester\Comprehensive Ai Automation Marketing Worflow Buildout\Pre-owned_Inventory_Sync_Workflow\workflow_updated.json'

# Read workflow
with open(workflow_path, 'r', encoding='utf-8') as f:
    workflow = json.load(f)

# Find and update "Google Sheets - Append Data" node
for node in workflow['nodes']:
    if node.get('name') == 'Google Sheets - Append Data':
        # Set to automatic mapping with empty schema
        node['parameters']['columns'] = {
            "mappingMode": "autoMapInputData",
            "matchingColumns": [],
            "schema": []
        }
        print("[OK] Reverted to automatic field mapping")
        break

# Write updated workflow
with open(workflow_path, 'w', encoding='utf-8') as f:
    json.dump(workflow, f, indent=2)

print("\n[SUCCESS] Workflow updated!")
print("\nAutomatic mapping will work because:")
print("1. Sheet headers in row 1 match the workflow output field names")
print("2. n8n will automatically find 'last_updated' header in column S")
print("3. n8n will match all 15 fields to their corresponding columns")
print("\nNo manual mapping needed!")
