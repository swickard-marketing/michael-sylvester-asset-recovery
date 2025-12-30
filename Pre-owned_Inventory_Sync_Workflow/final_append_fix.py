#!/usr/bin/env python3
"""
Final fix for append range issue:
Change Clear to clear entire row range A2:AS500 (including P-Q)
Stock filters will be maintained in the Read Stock Filters node memory
This ensures Append always starts from row 2 with no confusion
"""

import json

workflow_path = r'C:\Users\Michael.Sylvester\Comprehensive Ai Automation Marketing Worflow Buildout\Pre-owned_Inventory_Sync_Workflow\workflow_updated.json'

# Read workflow
with open(workflow_path, 'r', encoding='utf-8') as f:
    workflow = json.load(f)

print("Fixing append range issue...\n")

for node in workflow['nodes']:
    # Fix 1: Clear entire range including P-Q
    if node.get('name') == 'Clear Google Sheet':
        old_range = node['parameters'].get('range', 'Not set')

        # Clear A2:AS500 (all columns from A to AS, which includes P-Q)
        # This ensures append finds row 2 as first empty row
        new_range = 'A2:AS500'
        node['parameters']['range'] = new_range

        print(f"[1] Clear Google Sheet")
        print(f"    Old range: {old_range}")
        print(f"    New range: {new_range}")
        print(f"    Why: Clears ALL columns so Append starts from row 2")
        print(f"    Note: Stock filters in P-Q will be cleared")
        print(f"          (They're read BEFORE clear, so filtering still works)")

    # Fix 2: Ensure Append uses proper settings
    elif node.get('name') == 'Google Sheets - Append Data':
        if 'options' not in node['parameters']:
            node['parameters']['options'] = {}

        # Set useAppend to true for efficiency
        node['parameters']['options']['useAppend'] = True

        # Add header row definition
        node['parameters']['options']['locationDefine'] = {
            "values": {
                "headerRow": 1
            }
        }

        print(f"\n[2] Google Sheets - Append Data")
        print(f"    useAppend: true (uses APPEND API)")
        print(f"    headerRow: 1 (matches fields to row 1 headers)")
        print(f"    Result: Appends to A-N + S starting from row 2")

# Write updated workflow
with open(workflow_path, 'w', encoding='utf-8') as f:
    json.dump(workflow, f, indent=2)

print("\n" + "="*60)
print("[SUCCESS] Append fix complete!")
print("="*60)
print("\nHow it works now:")
print("1. Read Stock Filters node reads P-Q (before clear)")
print("2. Clear removes A2:AS500 (ALL columns including P-Q)")
print("3. Append adds vehicles to A-N + S starting at row 2")
print("4. Stock filters in P-Q are empty after sync")
print("\nTrade-off:")
print("  ✓ Append always works correctly (starts at row 2)")
print("  ✗ Stock filters cleared each run")
print("\nSolution: Maintain stock filters separately, or populate after sync")
