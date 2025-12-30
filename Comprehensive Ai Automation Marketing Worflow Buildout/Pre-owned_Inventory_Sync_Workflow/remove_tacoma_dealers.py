#!/usr/bin/env python3
"""
Remove Tacoma dealers from the workflow mapping
"""

import json

workflow_path = r'C:\Users\Michael.Sylvester\Comprehensive Ai Automation Marketing Worflow Buildout\Pre-owned_Inventory_Sync_Workflow\workflow_updated.json'

# Read workflow
with open(workflow_path, 'r', encoding='utf-8') as f:
    workflow = json.load(f)

print("Removing Tacoma dealers from mapping...\n")

# ===================================================================
# 1. Remove from Generate URLs node dealer mapping
# ===================================================================
generate_node = None
for node in workflow['nodes']:
    if node.get('name') == 'Generate URLs & Transform Fields':
        generate_node = node
        break

if generate_node:
    current_code = generate_node['parameters']['jsCode']

    # Remove Lexus of Tacoma at Fife
    updated_code = current_code.replace(
        "    'LEXTAC01': 'Lexus of Tacoma at Fife',\n",
        ""
    )

    # Remove Mercedes-Benz of Tacoma
    updated_code = updated_code.replace(
        "    'MBTAC01': 'Mercedes-Benz of Tacoma',\n",
        ""
    )

    # Also remove from URL templates if present
    updated_code = updated_code.replace(
        '  "Mercedes-Benz of Tacoma": "https://www.mboftacoma.com/searchused.aspx?utype=U&search=",\n',
        ""
    )

    generate_node['parameters']['jsCode'] = updated_code
    print("[OK] Removed Tacoma dealers from Generate URLs node")
else:
    print("[ERROR] Generate URLs node not found!")

# ===================================================================
# 2. Remove from Filter node Sprinter exception list
# ===================================================================
filter_node = None
for node in workflow['nodes']:
    if node.get('name') == 'Filter Pre-Owned Specials':
        filter_node = node
        break

if filter_node:
    current_code = filter_node['parameters']['jsCode']

    # Remove Mercedes-Benz of Tacoma from Sprinter exception list
    updated_code = current_code.replace(
        '  "Mercedes-Benz of Tacoma"      // MBTAC01 - exists in FTP\n',
        ""
    )

    filter_node['parameters']['jsCode'] = updated_code
    print("[OK] Removed Mercedes-Benz of Tacoma from Sprinter exception list")
else:
    print("[ERROR] Filter Pre-Owned Specials node not found!")

# Write updated workflow
with open(workflow_path, 'w', encoding='utf-8') as f:
    json.dump(workflow, f, indent=2)

print("\n" + "="*60)
print("[SUCCESS] Tacoma dealers removed!")
print("="*60)

print("\nRemoved dealers:")
print("  - Lexus of Tacoma at Fife (LEXTAC01)")
print("  - Mercedes-Benz of Tacoma (MBTAC01)")

print("\nRemaining dealers: 27")
print("  - Audi: 3 dealers")
print("  - BMW: 4 dealers")
print("  - JLR: 2 dealers")
print("  - Lexus: 1 dealer (Bellevue only)")
print("  - Mercedes-Benz: 3 dealers (Lynnwood, Palo Alto, Seattle)")
print("  - Porsche: 1 dealer")
print("  - Toyota: 1 dealer")
print("  - Swickard: 12 dealers")

print("\nSprinter exception dealers (3 remaining):")
print("  - Mercedes-Benz of Palo Alto")
print("  - Mercedes-Benz of Lynnwood")
print("  - Mercedes-Benz of Seattle")
