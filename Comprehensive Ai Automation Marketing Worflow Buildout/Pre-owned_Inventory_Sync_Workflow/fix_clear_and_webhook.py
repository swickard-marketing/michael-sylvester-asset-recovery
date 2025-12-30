#!/usr/bin/env python3
"""
Fix two issues:
1. Clear Google Sheet node - move range to correct location
2. Webhook node - set proper response mode for GET method
"""

import json

workflow_path = r'C:\Users\Michael.Sylvester\Comprehensive Ai Automation Marketing Worflow Buildout\Pre-owned_Inventory_Sync_Workflow\workflow_updated.json'

# Read workflow
with open(workflow_path, 'r', encoding='utf-8') as f:
    workflow = json.load(f)

print("Fixing workflow issues...\n")

for node in workflow['nodes']:
    # Fix 1: Clear Google Sheet node
    if node.get('name') == 'Clear Google Sheet':
        print("[ISSUE 1] Fixing Clear Google Sheet node...")

        # Check if range is in options (wrong location)
        if 'options' in node.get('parameters', {}) and 'range' in node['parameters']['options']:
            old_range = node['parameters']['options']['range']

            # Remove from options
            del node['parameters']['options']['range']

            # If options is now empty, remove it
            if not node['parameters']['options']:
                del node['parameters']['options']

            # Add clear type and range at correct level
            node['parameters']['clear'] = 'specificRange'
            node['parameters']['range'] = old_range

            print(f"  [OK] Moved range from options to parameters level")
            print(f"  [OK] Set clear type to 'specificRange'")
            print(f"  [OK] Range: {old_range}")
        else:
            print("  [INFO] Range already at correct location or not found")

    # Fix 2: Webhook node
    elif node.get('name') == 'Webhook':
        print("\n[ISSUE 2] Fixing Webhook node...")

        # Check current configuration
        params = node.get('parameters', {})
        http_method = params.get('httpMethod', 'GET')
        response_mode = params.get('responseMode')

        print(f"  Current HTTP Method: {http_method}")
        print(f"  Current Response Mode: {response_mode}")

        # Set response mode to 'onReceived' for immediate response
        # This allows the webhook to respond quickly while workflow continues
        if response_mode != 'onReceived':
            node['parameters']['responseMode'] = 'onReceived'
            print(f"  [OK] Set response mode to 'onReceived' (immediate response)")
        else:
            print("  [INFO] Response mode already correct")

        # Ensure httpMethod is set
        if 'httpMethod' not in node['parameters']:
            node['parameters']['httpMethod'] = 'GET'
            print("  [OK] Set HTTP method to GET")

# Write updated workflow
with open(workflow_path, 'w', encoding='utf-8') as f:
    json.dump(workflow, f, indent=2)

print("\n" + "="*60)
print("[SUCCESS] Workflow fixed!")
print("="*60)
print("\nChanges made:")
print("\n1. Clear Google Sheet Node:")
print("   - Moved 'range' from options to parameters")
print("   - Added 'clear': 'specificRange'")
print("   - Range will now be properly applied: A2:N")
print("\n2. Webhook Node:")
print("   - Set responseMode to 'onReceived'")
print("   - Webhook responds immediately")
print("   - Workflow continues to run subsequent nodes")
print("\nNext steps:")
print("1. Import updated workflow_updated.json into n8n")
print("2. Test webhook trigger from Google Sheets")
print("3. Verify Clear node only clears A2:N (preserves row 1)")
