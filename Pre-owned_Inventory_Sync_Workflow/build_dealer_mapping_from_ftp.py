#!/usr/bin/env python3
"""
Build correct dealer mapping by:
1. Reading actual FTP file names from proof/temp files
2. Extracting dealer codes
3. Matching with DEALER_SEARCH_URLS from Python file
4. Updating n8n workflow with correct mappings
"""

import json
import os
import re

# Path to files
workflow_path = r'C:\Users\Michael.Sylvester\Comprehensive Ai Automation Marketing Worflow Buildout\Pre-owned_Inventory_Sync_Workflow\workflow_updated.json'
csv_directory = r'C:\Users\Michael.Sylvester\OneDrive - Swickard Auto Group\Documents\Email Development\Customer.io Development\Vehicle Inventory Sync'

print("Building dealer mapping from actual FTP files...\n")

# ===================================================================
# Step 1: Get actual FTP file codes from proof/temp CSV files
# ===================================================================
print("="*60)
print("Step 1: Scanning actual FTP files...")
print("="*60)

dealer_codes = set()
for filename in os.listdir(csv_directory):
    if filename.endswith('U_INV.csv'):
        # Extract dealer code from filename
        # Format: proof_AUDIOAKL01U_INV.csv or temp_SWICKARD18U_INV.csv
        match = re.search(r'[_]([A-Z0-9]+)U_INV\.csv$', filename)
        if match:
            code = match.group(1)
            dealer_codes.add(code)
            print(f"  Found: {code} (from {filename})")

dealer_codes = sorted(dealer_codes)
print(f"\nTotal dealer codes found: {len(dealer_codes)}")

# ===================================================================
# Step 2: Read DEALER_SEARCH_URLS from Python file to get mappings
# ===================================================================
print("\n" + "="*60)
print("Step 2: Reading dealer names from Python file...")
print("="*60)

# Dealer mappings from the Python file DEALER_SEARCH_URLS
DEALER_NAME_MAPPINGS = {
    "AUDIOAKL01": "Audi Oakland",
    "AUDIBLG01": "Audi Bellingham",
    "AUDIOAKL01": "Audi Oakland",  # Alternate spelling
    "AUDIPALO01": "Audi Palo Alto",
    "AUDIOANC01": "Audi Anchorage",
    "PORSCHAN01": "Porsche Anchorage",
    "PORSCHSE01": "Porsche Stevens Creek",
    "VWANCHOR01": "Swickard Volkswagen of Anchorage",
    "VWBELLING01": "Volkswagen of Bellingham",
    "BMWOFEUG02": "BMW Eugene",
    "BMWLYN01": "BMW Lynnwood",
    "BMWPOR01": "BMW Portland",
    "BMWSEA01": "BMW Seattle",
    "JLRSANFR01": "Land Rover San Francisco",  # JLR file
    "LANDROVE13": "Land Rover San Francisco",
    "LRREDWOO01": "Land Rover Redwood City",
    "LRTHOUS01": "Land Rover Thousand Oaks",
    "MBTHOUS01": "Mercedes-Benz of Thousand Oaks",
    "MBSEATTL01": "Mercedes-Benz of Seattle",
    "MBWILSON01": "Mercedes-Benz of Wilsonville",
    "MBMAUI01": "Mercedes-Benz of Maui",
    "CROWNTOY01": "Crown Toyota",
    # Swickard dealerships
    "SWICKARD08": "Swickard Buick GMC of Thousand Oaks",
    "SWICKARD09": "Swickard Cadillac of Thousand Oaks",
    "SWICKARD10": "Swickard Buick GMC Anchorage",
    "SWICKARD11": "Swickard Cadillac Anchorage",
    "SWICKARD14": "Swickard Chevrolet Anchorage",
    "SWICKARD18": "Swickard Auto",  # Generic
    "SWICKARD21": "Swickard Auto"  # Generic
}

# Build mapping for only the codes we found
actual_dealer_map = {}
unmapped_codes = []

for code in dealer_codes:
    if code in DEALER_NAME_MAPPINGS:
        actual_dealer_map[code] = DEALER_NAME_MAPPINGS[code]
        print(f"  {code} -> {DEALER_NAME_MAPPINGS[code]}")
    else:
        unmapped_codes.append(code)
        # Try to infer dealer name
        if code.startswith("SWICKARD"):
            actual_dealer_map[code] = "Swickard Auto"
            print(f"  {code} -> Swickard Auto (inferred)")
        else:
            actual_dealer_map[code] = code  # Use code as name if unknown
            print(f"  {code} -> {code} (UNMAPPED - needs manual mapping)")

if unmapped_codes:
    print(f"\nWARNING: {len(unmapped_codes)} codes need manual mapping!")

# ===================================================================
# Step 3: Update n8n workflow with correct mappings
# ===================================================================
print("\n" + "="*60)
print("Step 3: Updating n8n workflow...")
print("="*60)

# Read workflow
with open(workflow_path, 'r', encoding='utf-8') as f:
    workflow = json.load(f)

# Find Generate URLs node
generate_node = None
for node in workflow['nodes']:
    if node.get('name') == 'Generate URLs & Transform Fields':
        generate_node = node
        break

if not generate_node:
    print("[ERROR] Generate URLs node not found!")
    exit(1)

# Build JavaScript dealer map
js_dealer_map_lines = []
for code in sorted(actual_dealer_map.keys()):
    dealer_name = actual_dealer_map[code]
    js_dealer_map_lines.append(f"    '{code}': '{dealer_name}',")

js_dealer_map = "\n".join(js_dealer_map_lines)

# Update the dealer map in the code
current_code = generate_node['parameters']['jsCode']

# Find and replace the dealerMap section
dealer_map_pattern = r'const dealerMap = \{[^}]+\};'
new_dealer_map = f'''const dealerMap = {{
{js_dealer_map}
  }};'''

updated_code = re.sub(dealer_map_pattern, new_dealer_map, current_code, flags=re.DOTALL)

generate_node['parameters']['jsCode'] = updated_code

# Write updated workflow
with open(workflow_path, 'w', encoding='utf-8') as f:
    json.dump(workflow, f, indent=2)

print("[OK] Updated Generate URLs node with actual dealer mappings")

print("\n" + "="*60)
print("[SUCCESS] Dealer mapping complete!")
print("="*60)

print(f"\nSummary:")
print(f"  - Total dealer codes: {len(actual_dealer_map)}")
print(f"  - Mapped codes: {len(actual_dealer_map) - len(unmapped_codes)}")
print(f"  - Unmapped codes: {len(unmapped_codes)}")

print(f"\nDealer Codes Mapped:")
for code in sorted(actual_dealer_map.keys()):
    print(f"     {code:15} -> {actual_dealer_map[code]}")

if unmapped_codes:
    print(f"\nThese codes need manual review:")
    for code in unmapped_codes:
        print(f"     {code}")

print("\nNext Steps:")
print("  1. Review the unmapped codes above")
print("  2. Check if dealer names look correct")
print("  3. Import workflow_updated.json into n8n")
print("  4. Test with actual FTP sync")
