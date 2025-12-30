#!/usr/bin/env python3
"""
Add last_updated timestamp to workflow and configure manual column mapping
"""

import json

workflow_path = r'C:\Users\Michael.Sylvester\Comprehensive Ai Automation Marketing Worflow Buildout\Pre-owned_Inventory_Sync_Workflow\workflow_updated.json'

# Read workflow
with open(workflow_path, 'r', encoding='utf-8') as f:
    workflow = json.load(f)

print("Updating workflow...")

# Step 1: Update "Generate URLs & Transform Fields" node
for node in workflow['nodes']:
    if node.get('name') == 'Generate URLs & Transform Fields':
        code = node['parameters']['jsCode']

        # Find and replace the transformedVehicle object
        old_ending = '''    Mileage: mileage,
    certified_pre_owned: cpo
  };'''

        new_ending = '''    Mileage: mileage,
    certified_pre_owned: cpo,

    // Timestamp for column S
    last_updated: new Date().toISOString()
  };'''

        if old_ending in code:
            code = code.replace(old_ending, new_ending)
            node['parameters']['jsCode'] = code
            print("[OK] Added last_updated to Generate URLs & Transform Fields node")
        else:
            print("[FAIL] Could not find expected code pattern in transform node")

        # Update notes
        node['notes'] = '🔗 Generates URLs & transforms (15 fields: A-N + S)'

    # Step 2: Update "Google Sheets - Append Data" node
    elif node.get('name') == 'Google Sheets - Append Data':
        # Change from autoMapInputData to manual mapping
        node['parameters']['columns'] = {
            "mappingMode": "defineBelow",
            "matchingColumns": [
                "VIN", "Stock", "vehicle_name", "Dealer_Name", "VDP_URL_1",
                "Main_Photo", "Price_Is", "Price_Was", "Make", "Model",
                "Year", "Trim", "Mileage", "certified_pre_owned",
                "", "", "", "",  # O, P, Q, R - skipped
                "last_updated"
            ],
            "schema": [
                {"id": "VIN", "displayName": "VIN", "type": "string", "defaultMatch": True},
                {"id": "Stock", "displayName": "Stock", "type": "string", "defaultMatch": True},
                {"id": "vehicle_name", "displayName": "vehicle_name", "type": "string", "defaultMatch": True},
                {"id": "Dealer_Name", "displayName": "Dealer_Name", "type": "string", "defaultMatch": True},
                {"id": "VDP_URL_1", "displayName": "VDP_URL_1", "type": "string", "defaultMatch": True},
                {"id": "Main_Photo", "displayName": "Main_Photo", "type": "string", "defaultMatch": True},
                {"id": "Price_Is", "displayName": "Price_Is", "type": "string", "defaultMatch": True},
                {"id": "Price_Was", "displayName": "Price_Was", "type": "string", "defaultMatch": True},
                {"id": "Make", "displayName": "Make", "type": "string", "defaultMatch": True},
                {"id": "Model", "displayName": "Model", "type": "string", "defaultMatch": True},
                {"id": "Year", "displayName": "Year", "type": "string", "defaultMatch": True},
                {"id": "Trim", "displayName": "Trim", "type": "string", "defaultMatch": True},
                {"id": "Mileage", "displayName": "Mileage", "type": "string", "defaultMatch": True},
                {"id": "certified_pre_owned", "displayName": "certified_pre_owned", "type": "string", "defaultMatch": True},
                {"id": "", "displayName": "", "type": "string", "defaultMatch": False},  # O
                {"id": "", "displayName": "", "type": "string", "defaultMatch": False},  # P
                {"id": "", "displayName": "", "type": "string", "defaultMatch": False},  # Q
                {"id": "", "displayName": "", "type": "string", "defaultMatch": False},  # R
                {"id": "last_updated", "displayName": "last_updated", "type": "string", "defaultMatch": True}  # S
            ]
        }

        # Update notes
        node['notes'] = '📊 Appends 14 vehicle fields (A-N) + timestamp (S)'
        print("[OK] Updated Google Sheets Append Data node to manual column mapping")

# Write updated workflow
with open(workflow_path, 'w', encoding='utf-8') as f:
    json.dump(workflow, f, indent=2)

print("\n[SUCCESS] Workflow updated successfully!")
print("\nChanges made:")
print("1. Added last_updated field to Generate URLs & Transform node output")
print("2. Changed Google Sheets Append node to manual column mapping")
print("3. Mapped fields A-N (vehicle data) and S (timestamp), skipping O-R")
print("\nColumn layout:")
print("  A-N: 14 vehicle fields")
print("  O: Reserved (empty)")
print("  P-Q: Stock filters (preserved)")
print("  R: Reserved (empty)")
print("  S: last_updated timestamp")
print("  T-AS: Subject lines (preserved)")
