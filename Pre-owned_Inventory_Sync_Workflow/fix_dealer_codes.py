#!/usr/bin/env python3
"""
Remove non-existent dealer codes from the mapping.
Keep only the dealer codes that actually exist in FTP files.
"""

import json

workflow_path = r'C:\Users\Michael.Sylvester\Comprehensive Ai Automation Marketing Worflow Buildout\Pre-owned_Inventory_Sync_Workflow\workflow_updated.json'

# Read workflow
with open(workflow_path, 'r', encoding='utf-8') as f:
    workflow = json.load(f)

print("Fixing dealer code mapping to remove non-existent codes...\n")

# Find the Generate URLs & Transform Fields node
generate_node = None
for node in workflow['nodes']:
    if node.get('name') == 'Generate URLs & Transform Fields':
        generate_node = node
        break

if not generate_node:
    print("[ERROR] Generate URLs & Transform Fields node not found!")
    exit(1)

current_code = generate_node['parameters']['jsCode']

# Replace with corrected dealer mapping (only codes that actually exist)
updated_code = current_code.replace(
    '''  const dealerMap = {
    // Audi Stores
    'AUDIAKL01': 'Audi Oakland',
    'AUDIBLG01': 'Audi Bellingham',
    'AUDIPA01': 'Audi Palo Alto',
    'AUDIOAKL01': 'Audi Oakland',
    'AUDIOANC01': 'Audi Anchorage',

    // BMW Stores
    'BMWEUG01': 'BMW Eugene',
    'BMWLYN01': 'BMW Lynnwood',
    'BMWPOR01': 'BMW Portland',
    'BMWSEA01': 'BMW Seattle',

    // Jaguar Land Rover
    'JLRSF01': 'JLR San Francisco',
    'LRSF01': 'Land Rover San Francisco',
    'LANDROVERSF01': 'Land Rover San Francisco',

    // Lexus Stores
    'LEXBEL01': 'Lexus of Bellevue',
    'LEXTAC01': 'Lexus of Tacoma at Fife',
    'LEXUS01': 'Lexus of Bellevue',

    // Mercedes-Benz Stores
    'MBLYN01': 'Mercedes-Benz of Lynnwood',
    'MBPA01': 'Mercedes-Benz of Palo Alto',
    'MBSEA01': 'Mercedes-Benz of Seattle',
    'MBTAC01': 'Mercedes-Benz of Tacoma',
    'MBSEATTL01': 'Mercedes-Benz of Seattle',
    'MBLYNNWOOD01': 'Mercedes-Benz of Lynnwood',
    'MBPALOALTO01': 'Mercedes-Benz of Palo Alto',
    'MBTACOMA01': 'Mercedes-Benz of Tacoma',
    'MBANC01': 'Mercedes-Benz of Anchorage',
    'MBHON01': 'Mercedes-Benz of Honolulu',
    'MBMARIN01': 'Mercedes-Benz of Marin',
    'MBMAUI01': 'Mercedes-Benz of Maui',

    // Porsche Stores
    'PORSC01': 'Porsche Stevens Creek',
    'PORSCHESC01': 'Porsche Stevens Creek',

    // Toyota / Scion
    'CROWNTOY01': 'Crown Toyota',
    'CROWN01': 'Crown Toyota',

    // Swickard dealerships (add more as needed)
    'SWICKARD01': 'Swickard Auto',
    'SWICKARD02': 'Swickard Auto',
    'SWICKARD03': 'Swickard Auto',
    'SWICKARD04': 'Swickard Auto',
    'SWICKARD05': 'Swickard Auto',
    'SWICKARD06': 'Swickard Auto',
    'SWICKARD07': 'Swickard Auto',
    'SWICKARD08': 'Swickard Auto',
    'SWICKARD09': 'Swickard Auto',
    'SWICKARD10': 'Swickard Auto',
    'SWICKARD11': 'Swickard Auto',
    'SWICKARD12': 'Swickard Auto'
  };''',
    '''  const dealerMap = {
    // Audi Stores (actual codes from FTP)
    'AUDIAKL01': 'Audi Oakland',
    'AUDIBLG01': 'Audi Bellingham',
    'AUDIPA01': 'Audi Palo Alto',

    // BMW Stores
    'BMWEUG01': 'BMW Eugene',
    'BMWLYN01': 'BMW Lynnwood',
    'BMWPOR01': 'BMW Portland',
    'BMWSEA01': 'BMW Seattle',

    // Jaguar Land Rover
    'JLRSF01': 'JLR San Francisco',
    'LRSF01': 'Land Rover San Francisco',

    // Lexus Stores
    'LEXBEL01': 'Lexus of Bellevue',
    'LEXTAC01': 'Lexus of Tacoma at Fife',

    // Mercedes-Benz Stores (actual codes from FTP)
    'MBLYN01': 'Mercedes-Benz of Lynnwood',
    'MBPA01': 'Mercedes-Benz of Palo Alto',
    'MBSEA01': 'Mercedes-Benz of Seattle',
    'MBTAC01': 'Mercedes-Benz of Tacoma',

    // Porsche Stores
    'PORSC01': 'Porsche Stevens Creek',

    // Toyota / Scion
    'CROWNTOY01': 'Crown Toyota',

    // Swickard dealerships (add specific codes as you identify them)
    'SWICKARD01': 'Swickard Auto',
    'SWICKARD02': 'Swickard Auto',
    'SWICKARD03': 'Swickard Auto',
    'SWICKARD04': 'Swickard Auto',
    'SWICKARD05': 'Swickard Auto',
    'SWICKARD06': 'Swickard Auto',
    'SWICKARD07': 'Swickard Auto',
    'SWICKARD08': 'Swickard Auto',
    'SWICKARD09': 'Swickard Auto',
    'SWICKARD10': 'Swickard Auto',
    'SWICKARD11': 'Swickard Auto',
    'SWICKARD12': 'Swickard Auto'
  };'''
)

generate_node['parameters']['jsCode'] = updated_code

# Write updated workflow
with open(workflow_path, 'w', encoding='utf-8') as f:
    json.dump(workflow, f, indent=2)

print("[OK] Removed non-existent dealer codes")
print("\nRemoved codes:")
print("  - AUDIOAKL01 (duplicate of AUDIAKL01)")
print("  - AUDIOANC01 (doesn't exist)")
print("  - LANDROVERSF01 (doesn't exist)")
print("  - LEXUS01 (doesn't exist)")
print("  - MBSEATTL01 (doesn't exist)")
print("  - MBLYNNWOOD01 (doesn't exist - user reported)")
print("  - MBPALOALTO01 (doesn't exist)")
print("  - MBTACOMA01 (doesn't exist)")
print("  - MBANC01 (doesn't exist)")
print("  - MBHON01 (doesn't exist)")
print("  - MBMARIN01 (doesn't exist)")
print("  - MBMAUI01 (doesn't exist)")
print("  - PORSCHESC01 (doesn't exist)")
print("  - CROWN01 (doesn't exist)")

print("\nKept codes (these should match your FTP files):")
print("  Audi: AUDIAKL01, AUDIBLG01, AUDIPA01")
print("  BMW: BMWEUG01, BMWLYN01, BMWPOR01, BMWSEA01")
print("  JLR: JLRSF01, LRSF01")
print("  Lexus: LEXBEL01, LEXTAC01")
print("  Mercedes: MBLYN01, MBPA01, MBSEA01, MBTAC01")
print("  Porsche: PORSC01")
print("  Toyota: CROWNTOY01")
print("  Swickard: SWICKARD01-12")

print("\n" + "="*60)
print("[SUCCESS] Dealer code mapping corrected!")
print("="*60)
print("\nIf you see other dealer codes in your FTP files that aren't")
print("in this list, let me know and I'll add them.")
