#!/usr/bin/env python3
"""
Alternative approach: Clear entire range A2:S500 (including P-Q) before append
This ensures Append finds row 2 as the first empty row
Stock filters in P-Q will be empty after sync (user would need to manually re-add them)
"""

import json

workflow_path = r'C:\Users\Michael.Sylvester\Comprehensive Ai Automation Marketing Worflow Buildout\Pre-owned_Inventory_Sync_Workflow\workflow_updated.json'

# Read workflow
with open(workflow_path, 'r', encoding='utf-8') as f:
    workflow = json.load(f)

print("Checking alternative approach: Clear all columns A-S...\n")

for node in workflow['nodes']:
    if node.get('name') == 'Clear Google Sheet':
        current_range = node['parameters'].get('range', 'Not set')
        print(f"Current Clear range: {current_range}")
        print(f"\nOption 1 (CURRENT): Clear A2:N500")
        print("  Pros: Preserves stock filters in P-Q")
        print("  Cons: Append sees P-Q data and may append after those rows")
        print(f"\nOption 2 (ALTERNATIVE): Clear A2:S500")
        print("  Pros: Append will start from row 2 (no confusion)")
        print("  Cons: Stock filters in P-Q are cleared (need manual re-entry)")
        print(f"\n❓ Question for user:")
        print("  - Are the stock filters in P-Q changed frequently?")
        print("  - If YES: Keep current approach (A2:N500)")
        print("  - If NO: Use alternative (A2:S500) - simpler, always works")
        break

print("\n" + "="*60)
print("RECOMMENDATION")
print("="*60)
print("\nThe real issue might be that Append with 'useAppend: true'")
print("still looks at ALL columns to find the last row.")
print("\nBetter solution: Test the current configuration first!")
print("The locationDefine setting might work even if not shown in UI.")
print("\nTo test:")
print("1. Import workflow")
print("2. Add a few rows to P-Q (stock filters)")
print("3. Run the workflow")
print("4. Check if vehicle data appends to row 2 or after P-Q data")
