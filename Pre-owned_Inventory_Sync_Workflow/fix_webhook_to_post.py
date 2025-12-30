#!/usr/bin/env python3
"""
Fix webhook to accept POST requests instead of GET
"""

import json

workflow_path = r'C:\Users\Michael.Sylvester\Comprehensive Ai Automation Marketing Worflow Buildout\Pre-owned_Inventory_Sync_Workflow\workflow_updated.json'

# Read workflow
with open(workflow_path, 'r', encoding='utf-8') as f:
    workflow = json.load(f)

print("Fixing webhook HTTP method...\n")

for node in workflow['nodes']:
    if node.get('name') == 'Webhook':
        params = node.get('parameters', {})

        current_method = params.get('httpMethod', 'Not set')
        print(f"Current HTTP Method: {current_method}")

        # Change to POST
        node['parameters']['httpMethod'] = 'POST'

        print(f"[OK] Changed HTTP Method to: POST")
        print(f"\nReason: Apps Script is sending POST requests")
        print(f"POST is the correct method for triggering workflows")
        break

# Write updated workflow
with open(workflow_path, 'w', encoding='utf-8') as f:
    json.dump(workflow, f, indent=2)

print("\n" + "="*60)
print("[SUCCESS] Webhook updated!")
print("="*60)
print("\nNext steps:")
print("1. Import updated workflow_updated.json into n8n")
print("2. The webhook will now accept POST requests")
print("3. Test from Google Sheets - should work now!")
