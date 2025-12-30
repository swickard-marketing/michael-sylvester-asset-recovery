#!/usr/bin/env python3
"""
Set Clear Sheet range to 500 rows
"""

import json

workflow_path = r'C:\Users\Michael.Sylvester\Comprehensive Ai Automation Marketing Worflow Buildout\Pre-owned_Inventory_Sync_Workflow\workflow_updated.json'

# Read workflow
with open(workflow_path, 'r', encoding='utf-8') as f:
    workflow = json.load(f)

print("Setting Clear range to 500 rows...\n")

for node in workflow['nodes']:
    if node.get('name') == 'Clear Google Sheet':
        params = node.get('parameters', {})

        current_range = params.get('range', 'Not set')
        print(f"Current range: {current_range}")

        # Set to 500 rows
        new_range = 'A2:N500'
        node['parameters']['range'] = new_range

        print(f"[OK] Updated range to: {new_range}")
        print(f"\n500 rows should handle:")
        print(f"  - Typical inventory: 100-300 vehicles")
        print(f"  - Room for growth without performance hit")
        print(f"  - Fast clear operation (~2-3 seconds)")
        break

# Write updated workflow
with open(workflow_path, 'w', encoding='utf-8') as f:
    json.dump(workflow, f, indent=2)

print("\n" + "="*60)
print("[SUCCESS] Clear range set to 500 rows!")
print("="*60)
print("\nImport workflow_updated.json to apply changes")
