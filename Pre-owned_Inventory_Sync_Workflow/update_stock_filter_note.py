#!/usr/bin/env python3
"""
Update Filter by Stock List node note to reflect correct column references
"""

import json

workflow_path = r'C:\Users\Michael.Sylvester\Comprehensive Ai Automation Marketing Worflow Buildout\Pre-owned_Inventory_Sync_Workflow\workflow_updated.json'

# Read workflow
with open(workflow_path, 'r', encoding='utf-8') as f:
    workflow = json.load(f)

print("Updating Filter by Stock List node note...\n")

for node in workflow['nodes']:
    if node.get('name') == 'Filter by Stock List':
        old_note = node.get('notes', 'No note')
        print(f"Current note found")

        # Update to more descriptive note with correct column references
        new_note = '📋 Filters by stock lists: P (Stock_Include) | Q (Stock_Exclude - priority)'
        node['notes'] = new_note

        print(f"[OK] Updated node note")
        print(f"\nClarifications:")
        print(f"  - Column P: Stock_Include (whitelist)")
        print(f"  - Column Q: Stock_Exclude (blacklist - highest priority)")
        break

# Write updated workflow
with open(workflow_path, 'w', encoding='utf-8') as f:
    json.dump(workflow, f, indent=2)

print("\n" + "="*60)
print("[SUCCESS] Stock filter note updated!")
print("="*60)
print("\nImport workflow_updated.json to see updated note")
