#!/usr/bin/env python3
import json

workflow_path = r'C:\Users\Michael.Sylvester\Comprehensive Ai Automation Marketing Worflow Buildout\Pre-owned_Inventory_Sync_Workflow\workflow_updated.json'

# Read workflow
with open(workflow_path, 'r', encoding='utf-8') as f:
    workflow = json.load(f)

# Update nodes
for node in workflow['nodes']:
    node_name = node.get('name', '')

    # Update "Generate URLs & Transform Fields"
    if node_name == 'Generate URLs & Transform Fields' and 'parameters' in node and 'jsCode' in node['parameters']:
        code = node['parameters']['jsCode']

        # Swap the fields and remove last_updated
        code = code.replace(
            '    certified_pre_owned: cpo,\n    Mileage: mileage,\n    \n    // Metadata\n    last_updated: new Date().toISOString()',
            '    Mileage: mileage,\n    certified_pre_owned: cpo'
        )

        # Update comments
        code = code.replace('(14 fields)', '(14 fields A-N, no timestamp)')

        node['parameters']['jsCode'] = code
        node['notes'] = '🔗 Generates URLs & transforms (14 fields A-N)'
        print("Updated: Generate URLs & Transform Fields")

    # Update "Clear Google Sheet"
    elif node_name == 'Clear Google Sheet':
        if 'parameters' in node and 'options' in node['parameters'] and 'range' in node['parameters']['options']:
            node['parameters']['options']['range'] = 'A2:N'
            print(f"Updated: Clear range to A2:N")

        node['notes'] = '🗑️ Clears A2:N, preserves P-Q (filters), S (timestamp), T+ (subject lines)'

    # Update "Google Sheets - Append Data"
    elif node_name == 'Google Sheets - Append Data':
        node['notes'] = '📊 Appends 14 vehicle fields to A-N'

# Write back
with open(workflow_path, 'w', encoding='utf-8') as f:
    json.dump(workflow, f, indent=2)

print("\nWorkflow updated!")
print("New order: A-N = 14 fields (Mileage and certified_pre_owned swapped, no last_updated)")
print("Column S will need last_updated added separately")
