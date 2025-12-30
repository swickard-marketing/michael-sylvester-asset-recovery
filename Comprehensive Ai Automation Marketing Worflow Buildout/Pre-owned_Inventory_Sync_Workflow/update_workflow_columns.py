#!/usr/bin/env python3
"""
Update workflow column layout to new structure:
- A-O: Vehicle data (14 fields + last_updated)
- P-Q: Stock filters (manual entry)
- S: Reserved for future last_updated (if we reorganize)
- T+: Subject lines (manual entry)
"""

import json
import sys

def update_workflow(workflow_path):
    # Read workflow
    with open(workflow_path, 'r', encoding='utf-8') as f:
        workflow = json.load(f)

    # Track changes
    changes = []

    # Update each node
    for node in workflow['nodes']:
        node_name = node.get('name', '')

        # 1. Update "Filter by Stock List" node
        if node_name == 'Filter by Stock List':
            if 'parameters' in node and 'jsCode' in node['parameters']:
                old_code = node['parameters']['jsCode']

                # Replace AA-AB with P-Q in comments
                new_code = old_code.replace('columns AA-AB', 'columns P-Q')
                new_code = new_code.replace('Column AA:', 'Column P:')
                new_code = new_code.replace('Column AB:', 'Column Q:')

                # Replace API URL
                new_code = new_code.replace('!AA2:AB', '!P2:Q')

                # Update inline comment about column indexes
                new_code = new_code.replace('// Column AA (index 0): Include list', '// Column P (index 0): Include list')
                new_code = new_code.replace('// Column AB (index 1): Exclude list', '// Column Q (index 1): Exclude list')

                node['parameters']['jsCode'] = new_code

                # Update node notes
                if 'notes' in node:
                    node['notes'] = node['notes'].replace('AA-AB', 'P-Q')

                changes.append(f"✓ Updated 'Filter by Stock List' node: AA-AB → P-Q")

        # 2. Update "Clear Google Sheet" node
        elif node_name == 'Clear Google Sheet':
            if 'parameters' in node and 'options' in node['parameters']:
                if 'range' in node['parameters']['options']:
                    old_range = node['parameters']['options']['range']
                    node['parameters']['options']['range'] = 'A2:O'
                    changes.append(f"✓ Updated 'Clear Google Sheet' range: {old_range} → A2:O")

            # Update node notes
            if 'notes' in node:
                node['notes'] = '🗑️ Clears vehicle data (A2:O), preserves stock filters (P-Q) and subject lines (T+)'

        # 3. Update "Google Sheets - Append Data" node notes
        elif node_name == 'Google Sheets - Append Data':
            if 'notes' in node:
                node['notes'] = '📊 Uploads 15 fields to A-O (14 vehicle fields + last_updated)'

    # Write updated workflow
    with open(workflow_path, 'w', encoding='utf-8') as f:
        json.dump(workflow, f, indent=2)

    # Print changes
    print("Workflow updated successfully!\n")
    for change in changes:
        print(change)

    print(f"\nUpdated file: {workflow_path}")
    print("\nNew column layout:")
    print("  A-N: 14 vehicle fields (VIN, Stock, vehicle_name, etc.)")
    print("  O: last_updated")
    print("  P-Q: Stock filters (manual entry, read by workflow)")
    print("  T+: Subject lines (manual entry, uploaded by Apps Script)")

if __name__ == '__main__':
    workflow_path = r'C:\Users\Michael.Sylvester\Comprehensive Ai Automation Marketing Worflow Buildout\Pre-owned_Inventory_Sync_Workflow\workflow_updated.json'
    update_workflow(workflow_path)
