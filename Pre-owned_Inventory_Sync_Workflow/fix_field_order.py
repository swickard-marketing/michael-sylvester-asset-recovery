#!/usr/bin/env python3
"""
Fix field order in workflow:
1. Swap Mileage and certified_pre_owned
2. Remove last_updated from transformedVehicle (will be added to column S separately)
3. Update clear range to A2:N
"""

import json

def update_workflow():
    workflow_path = r'C:\Users\Michael.Sylvester\Comprehensive Ai Automation Marketing Worflow Buildout\Pre-owned_Inventory_Sync_Workflow\workflow_updated.json'

    # Read workflow
    with open(workflow_path, 'r', encoding='utf-8') as f:
        workflow = json.load(f)

    changes = []

    # Find and update nodes
    for node in workflow['nodes']:
        node_name = node.get('name', '')

        # Update "Generate URLs & Transform Fields"
        if node_name == 'Generate URLs & Transform Fields':
            if 'parameters' in node and 'jsCode' in node['parameters']:
                code = node['parameters']['jsCode']

                # Find and replace the transformedVehicle object
                # Old order: ... Trim: trim, certified_pre_owned: cpo, Mileage: mileage, last_updated: ...
                # New order: ... Trim: trim, Mileage: mileage, certified_pre_owned: cpo (NO last_updated)

                old_snippet = '''    Trim: trim,
    certified_pre_owned: cpo,
    Mileage: mileage,

    // Metadata
    last_updated: new Date().toISOString()'''

                new_snippet = '''    Trim: trim,
    Mileage: mileage,
    certified_pre_owned: cpo'''

                if old_snippet in code:
                    code = code.replace(old_snippet, new_snippet)
                    changes.append("✓ Swapped Mileage ↔ certified_pre_owned")
                    changes.append("✓ Removed last_updated from output")
                else:
                    print("WARNING: Could not find expected code pattern")
                    print("Searching for alternative pattern...")

                    # Try alternative pattern with different spacing
                    import re
                    pattern = r'Trim:\s*trim,\s*certified_pre_owned:\s*cpo,\s*Mileage:\s*mileage,\s*//\s*Metadata\s*last_updated:.*?\n\s*\}'

                    if re.search(pattern, code):
                        code = re.sub(
                            pattern,
                            'Trim: trim,\n    Mileage: mileage,\n    certified_pre_owned: cpo\n  }',
                            code
                        )
                        changes.append("✓ Swapped Mileage ↔ certified_pre_owned (alternative pattern)")
                        changes.append("✓ Removed last_updated from output")

                # Update comment about field count
                code = code.replace('// Core vehicle data (14 fields)', '// Core vehicle data (14 fields A-N)')
                code = code.replace('// Note: Subject lines (26 fields) come from sheet columns AC-AZ',
                                  '// Note: Subject lines (26 fields) come from sheet columns T-AS\n  // Note: last_updated will be in column S (added separately)')

                node['parameters']['jsCode'] = code
                node['notes'] = '🔗 Generates URLs & transforms (14 fields A-N)'

        # Update "Clear Google Sheet"
        elif node_name == 'Clear Google Sheet':
            if 'parameters' in node and 'options' in node['parameters']:
                if 'range' in node['parameters']['options']:
                    old_range = node['parameters']['options']['range']
                    node['parameters']['options']['range'] = 'A2:N'
                    changes.append(f"✓ Updated clear range: {old_range} → A2:N")

            if 'notes' in node:
                node['notes'] = '🗑️ Clears A2:N (vehicle data), preserves P-Q (filters), S (timestamp), T+ (subject lines)'

        # Update "Google Sheets - Append Data"
        elif node_name == 'Google Sheets - Append Data':
            if 'notes' in node:
                node['notes'] = '📊 Appends 14 vehicle fields to A-N (last_updated goes to S separately)'

    # Write updated workflow
    with open(workflow_path, 'w', encoding='utf-8') as f:
        json.dump(workflow, f, indent=2)

    print("="*60)
    print("Workflow Updated Successfully!")
    print("="*60)
    for change in changes:
        print(change)
    print("\nNew field order (A-N):")
    print("  A: VIN")
    print("  B: Stock")
    print("  C: vehicle_name")
    print("  D: Dealer_Name")
    print("  E: VDP_URL_1")
    print("  F: Main_Photo")
    print("  G: Price_Is")
    print("  H: Price_Was")
    print("  I: Make")
    print("  J: Model")
    print("  K: Year")
    print("  L: Trim")
    print("  M: Mileage (SWAPPED)")
    print("  N: certified_pre_owned (SWAPPED)")
    print("\nOther columns:")
    print("  O: Reserved")
    print("  P-Q: Stock filters")
    print("  R: Reserved")
    print("  S: last_updated (TODO: add via formula or Apps Script)")
    print("  T-AS: Subject lines")

if __name__ == '__main__':
    update_workflow()
