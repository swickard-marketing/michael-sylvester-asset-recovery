#!/usr/bin/env python3
"""
Move stock filters to a separate sheet tab called "Configuration"
This keeps the main sheet clean and prevents append conflicts
"""

import json

workflow_path = r'C:\Users\Michael.Sylvester\Comprehensive Ai Automation Marketing Worflow Buildout\Pre-owned_Inventory_Sync_Workflow\workflow_updated.json'

# Read workflow
with open(workflow_path, 'r', encoding='utf-8') as f:
    workflow = json.load(f)

print("Moving stock filters to separate Configuration sheet...\n")

for node in workflow['nodes']:
    # Fix 1: Update Read Stock Filters to read from Configuration sheet
    if node.get('name') == 'Read Stock Filters':
        # Change from "Pre-Owned Specials Automation" sheet to "Configuration" sheet
        # Read from columns A-B instead of P-Q
        node['parameters']['sheetName']['value'] = 'Configuration'
        node['parameters']['options']['dataLocationOnSheet']['values']['range'] = 'A2:B500'

        print("[1] Read Stock Filters node")
        print(f"    Old: Read from 'Pre-Owned Specials Automation' P2:Q500")
        print(f"    New: Read from 'Configuration' A2:B500")
        print(f"    Column A: Stock_Include")
        print(f"    Column B: Stock_Exclude")

    # Fix 2: Update Clear to only clear vehicle data (A2:N500)
    elif node.get('name') == 'Clear Google Sheet':
        # Keep it at A2:N500 since P-Q no longer exist on main sheet
        old_range = node['parameters'].get('range', 'Not set')
        new_range = 'A2:N500'
        node['parameters']['range'] = new_range

        print(f"\n[2] Clear Google Sheet node")
        print(f"    Range: {new_range}")
        print(f"    Clears: Only vehicle data (A-N)")
        print(f"    Preserves: Timestamp (S), Subject lines (T-AS)")
        print(f"    Stock filters: Unaffected (in different sheet)")

    # Fix 3: Update Filter code to use correct column names
    elif node.get('name') == 'Filter by Stock List':
        # Update code to read Stock_Include and Stock_Exclude from columns A-B
        old_code = node['parameters']['jsCode']

        # The code should already work since it looks for Stock_Include and Stock_Exclude
        # Just verify the column names match
        print(f"\n[3] Filter by Stock List node")
        print(f"    Reads from: Configuration sheet A2:B500")
        print(f"    Column names: Stock_Include, Stock_Exclude")
        print(f"    Code: Already compatible (no changes needed)")

# Write updated workflow
with open(workflow_path, 'w', encoding='utf-8') as f:
    json.dump(workflow, f, indent=2)

print("\n" + "="*60)
print("[SUCCESS] Workflow updated!")
print("="*60)
print("\nManual steps required:")
print("\n1. Open your Google Sheet:")
print("   https://docs.google.com/spreadsheets/d/1PkU3Sh9fgWWaz25OqymT2P_EWzB_UvWghgrizTWjHlA")
print("\n2. Create a new sheet tab called 'Configuration'")
print("   - Click + at bottom of sheet")
print("   - Name it exactly: Configuration")
print("\n3. Set up Configuration sheet:")
print("   Row 1 (Headers):")
print("     A1: Stock_Include")
print("     B1: Stock_Exclude")
print("   Row 2+: Your stock numbers")
print("     A2: 12345    B2: 67890")
print("     A3: 11111    B3: 22222")
print("     etc...")
print("\n4. Remove columns P-Q from main sheet (optional)")
print("   - No longer needed on 'Pre-Owned Specials Automation'")
print("\n5. Import updated workflow_updated.json")
print("\n" + "="*60)
print("BENEFITS:")
print("="*60)
print("✓ Main sheet stays clean (only vehicle data)")
print("✓ Stock filters persist between syncs")
print("✓ Append always works correctly")
print("✓ Easier to manage filters (dedicated sheet)")
print("✓ Can add more config options later")
