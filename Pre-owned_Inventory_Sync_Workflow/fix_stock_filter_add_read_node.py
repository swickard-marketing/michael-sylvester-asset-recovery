#!/usr/bin/env python3
"""
Add Google Sheets Read node to read stock filters from columns P-Q
Then update Filter by Stock List code to use that data instead of trying to read it directly
"""

import json

workflow_path = r'C:\Users\Michael.Sylvester\Comprehensive Ai Automation Marketing Worflow Buildout\Pre-owned_Inventory_Sync_Workflow\workflow_updated.json'

# Read workflow
with open(workflow_path, 'r', encoding='utf-8') as f:
    workflow = json.load(f)

print("Adding Google Sheets Read node for stock filters...\n")

# Find the "Generate URLs & Transform Fields" node position
generate_node = None
filter_node = None

for node in workflow['nodes']:
    if node.get('name') == 'Generate URLs & Transform Fields':
        generate_node = node
    elif node.get('name') == 'Filter by Stock List':
        filter_node = node

if not generate_node or not filter_node:
    print("[ERROR] Could not find required nodes")
    exit(1)

# Create new "Read Stock Filters" node
new_read_node = {
    "parameters": {
        "operation": "read",
        "documentId": {
            "__rl": True,
            "value": "1PkU3Sh9fgWWaz25OqymT2P_EWzB_UvWghgrizTWjHlA",
            "mode": "id"
        },
        "sheetName": {
            "__rl": True,
            "value": "Pre-Owned Specials Automation",
            "mode": "name"
        },
        "filtersUI": {
            "values": []
        },
        "options": {
            "dataLocationOnSheet": {
                "values": {
                    "rangeDefinition": "specifyRangeA1",
                    "range": "P2:Q"
                }
            }
        }
    },
    "id": "read-stock-filters-123",
    "name": "Read Stock Filters",
    "type": "n8n-nodes-base.googleSheets",
    "typeVersion": 4.4,
    "position": [
        generate_node['position'][0] + 200,  # Place between Generate and Filter
        generate_node['position'][1] - 200   # Offset vertically
    ],
    "credentials": {
        "googleSheetsOAuth2Api": {
            "id": "r97IPYNy0EoZGTUr",
            "name": "Google Sheets account"
        }
    },
    "notes": "📋 Reads stock filters from P (Include) & Q (Exclude)"
}

# Add the new node
workflow['nodes'].append(new_read_node)

print("[OK] Added 'Read Stock Filters' node")
print(f"  Position: {new_read_node['position']}")
print(f"  Reads: Columns P-Q (Stock_Include & Stock_Exclude)")

# Update connections
# Current: Generate -> Filter
# New: Generate -> Read Stock Filters (data) + Generate -> Filter (vehicle data)
# Then: Filter uses both inputs

print("\n[INFO] Manual step required:")
print("  After importing, you need to:")
print("  1. Connect 'Generate URLs & Transform Fields' to 'Read Stock Filters'")
print("  2. Connect 'Read Stock Filters' to 'Filter by Stock List' (input 1)")
print("  3. Keep 'Generate URLs & Transform Fields' connected to 'Filter by Stock List' (input 0)")
print("  4. Update Filter code to read from input(1) instead of API calls")

# Write updated workflow
with open(workflow_path, 'w', encoding='utf-8') as f:
    json.dump(workflow, f, indent=2)

print("\n" + "="*60)
print("[SUCCESS] Node added!")
print("="*60)
print("\nNext: Import workflow, then I'll update the Filter code to use the new input")
