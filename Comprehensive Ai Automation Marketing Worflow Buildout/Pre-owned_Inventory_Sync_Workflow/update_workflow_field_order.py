#!/usr/bin/env python3
"""
Updates workflow field order:
1. Swap Mileage and certified_pre_owned (M ↔ N)
2. Move last_updated from column O to column S
3. Update clear range from A2:O to A2:N
"""

import json
import re

def update_workflow(workflow_path):
    # Read workflow
    with open(workflow_path, 'r', encoding='utf-8') as f:
        workflow = json.load(f)

    changes = []

    # Update each node
    for node in workflow['nodes']:
        node_name = node.get('name', '')

        # 1. Update "Generate URLs & Transform Fields" node
        if node_name == 'Generate URLs & Transform Fields':
            if 'parameters' in node and 'jsCode' in node['parameters']:
                code = node['parameters']['jsCode']

                # Find the transformedVehicle object definition
                # Swap the order of certified_pre_owned and Mileage
                # Change from:  certified_pre_owned: cpo, Mileage: mileage, last_updated: ...
                # To:           Mileage: mileage, certified_pre_owned: cpo, (remove last_updated here)

                # Pattern to find the object assignment
                old_pattern = r'(Trim:\s*trim,)\s*(certified_pre_owned:\s*cpo,)\s*(Mileage:\s*mileage,)\s*(\/\/ Metadata\s*last_updated:.*?\})'
                new_replacement = r'\1\n  \3\n  \2\n  \n  // NOTE: last_updated is in column S, not here\n}'

                if re.search(old_pattern, code, re.DOTALL):
                    code = re.sub(old_pattern, new_replacement, code, flags=re.DOTALL)
                    changes.append("✓ Updated field order: Swapped Mileage ↔ certified_pre_owned")
                    changes.append("✓ Removed last_updated from output (will add to column S separately)")

                node['parameters']['jsCode'] = code
                node['notes'] = '🔗 Generates URLs & transforms to Customer.io format (14 fields A-N)'

        # 2. Update "Clear Google Sheet" node
        elif node_name == 'Clear Google Sheet':
            if 'parameters' in node and 'options' in node['parameters']:
                if 'range' in node['parameters']['options']:
                    old_range = node['parameters']['options']['range']
                    node['parameters']['options']['range'] = 'A2:N'
                    changes.append(f"✓ Updated clear range: {old_range} → A2:N")

            # Update notes
            if 'notes' in node:
                node['notes'] = '🗑️ Clears vehicle data (A2:N), preserves P-Q filters, S timestamp, T+ subject lines'

        # 3. Update "Google Sheets - Append Data" node notes
        elif node_name == 'Google Sheets - Append Data':
            if 'notes' in node:
                node['notes'] = '📊 Appends 14 vehicle fields (A-N) + last_updated (S via formula)'

    # Write updated workflow
    with open(workflow_path, 'w', encoding='utf-8') as f:
        json.dump(workflow, f, indent=2)

    # Print changes
    print("Workflow updated successfully!\n")
    for change in changes:
        print(change)

    print(f"\nUpdated file: {workflow_path}")
    print("\nNew column structure:")
    print("  A-N (14): Vehicle data (Mileage and certified_pre_owned swapped)")
    print("  O: Reserved")
    print("  P-Q: Stock filters")
    print("  R: Reserved")
    print("  S: last_updated (set via Google Sheets formula or Apps Script)")
    print("  T-AS: Subject lines")

if __name__ == '__main__':
    workflow_path = r'C:\Users\Michael.Sylvester\Comprehensive Ai Automation Marketing Worflow Buildout\Pre-owned_Inventory_Sync_Workflow\workflow_updated.json'
    update_workflow(workflow_path)
