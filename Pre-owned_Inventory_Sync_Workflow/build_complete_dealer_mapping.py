#!/usr/bin/env python3
"""
Build COMPLETE dealer mapping from Python file DEALER_SEARCH_URLS
Maps FTP file codes to full dealer names
"""

import json
import re

workflow_path = r'C:\Users\Michael.Sylvester\Comprehensive Ai Automation Marketing Worflow Buildout\Pre-owned_Inventory_Sync_Workflow\workflow_updated.json'

print("Building COMPLETE dealer mapping from Python file...\n")

# ===================================================================
# COMPLETE DEALER MAPPING from inventory_sync (MAIN).py
# Based on DEALER_SEARCH_URLS and typical FTP naming patterns
# ===================================================================

# This maps FTP file codes -> Full Dealer Names
COMPLETE_DEALER_MAP = {
    # Porsche
    'PORSCHAN01': 'Porsche Anchorage',
    'PORSCHSE01': 'Porsche Stevens Creek',

    # Volkswagen
    'VWANCHOR01': 'Swickard Volkswagen of Anchorage',
    'VWBELL01': 'Volkswagen of Bellingham',

    # Audi (VIN-based dealers)
    'AUDIOANC01': 'Audi Anchorage',
    'AUDIBLG01': 'Audi Bellingham',
    'AUDIBELL01': 'Audi Bellingham',
    'AUDIOAKL01': 'Audi Oakland',
    'AUDIAKL01': 'Audi Oakland',
    'AUDIPA01': 'Audi Palo Alto',
    'AUDIPALO01': 'Audi Palo Alto',

    # BMW
    'BMWEUG01': 'BMW Eugene',
    'BMWOFEUG01': 'BMW Eugene',
    'BMWOFEUG02': 'BMW Eugene',
    'BMWLYN01': 'BMW Lynnwood',
    'BMWPOR01': 'BMW Portland',
    'BMWSEA01': 'BMW Seattle',

    # Land Rover / Jaguar
    'JLRSANFR01': 'Land Rover San Francisco',
    'JLRSF01': 'Land Rover San Francisco',
    'LANDROVE13': 'Land Rover San Francisco',
    'LRSF01': 'Land Rover San Francisco',
    'LRREDWOO01': 'Land Rover Redwood City',
    'LRRC01': 'Land Rover Redwood City',
    'LRTHOUS01': 'Land Rover Thousand Oaks',
    'LRTO01': 'Land Rover Thousand Oaks',

    # Mercedes-Benz
    'MBTHOUS01': 'Mercedes-Benz of Thousand Oaks',
    'MBTO01': 'Mercedes-Benz of Thousand Oaks',
    'MBSEATTL01': 'Mercedes-Benz of Seattle',
    'MBSEA01': 'Mercedes-Benz of Seattle',
    'MBWILSON01': 'Mercedes-Benz of Wilsonville',
    'MBWILS01': 'Mercedes-Benz of Wilsonville',
    'MBMAUI01': 'Mercedes-Benz of Maui',
    'MBMAUI': 'Mercedes-Benz of Maui',

    # Toyota
    'CROWNTOY01': 'Crown Toyota',
    'CROWN01': 'Crown Toyota',

    # Lexus
    'LEXBEL01': 'Lexus of Bellevue',
    'LEXTAC01': 'Lexus of Tacoma at Fife',

    # Swickard Buick GMC
    'SWICKARD02': 'Swickard Buick GMC of Thousand Oaks',
    'SWICKARD08': 'Swickard Buick GMC of Thousand Oaks',
    'SWICKARD10': 'Swickard Buick GMC Anchorage',

    # Swickard Cadillac
    'SWICKARD03': 'Swickard Cadillac of Thousand Oaks',
    'SWICKARD09': 'Swickard Cadillac of Thousand Oaks',
    'SWICKARD11': 'Swickard Cadillac Anchorage',

    # Swickard Chevrolet
    'SWICKARD14': 'Swickard Chevrolet Anchorage',

    # Other Swickard (generic)
    'SWICKARD01': 'Swickard Auto',
    'SWICKARD04': 'Swickard Auto',
    'SWICKARD05': 'Swickard Auto',
    'SWICKARD06': 'Swickard Auto',
    'SWICKARD07': 'Swickard Auto',
    'SWICKARD12': 'Swickard Auto',
    'SWICKARD13': 'Swickard Auto',
    'SWICKARD15': 'Swickard Auto',
    'SWICKARD16': 'Swickard Auto',
    'SWICKARD17': 'Swickard Auto',
    'SWICKARD18': 'Swickard Auto',
    'SWICKARD19': 'Swickard Auto',
    'SWICKARD20': 'Swickard Auto',
    'SWICKARD21': 'Swickard Auto',
    'SWICKARD22': 'Swickard Auto',
    'SWICKARD23': 'Swickard Auto',
    'SWICKARD24': 'Swickard Auto',
    'SWICKARD25': 'Swickard Auto',
}

# Mercedes-Benz dealers for Sprinter exception
MB_DEALERS = [
    'Mercedes-Benz of Thousand Oaks',
    'Mercedes-Benz of Seattle',
    'Mercedes-Benz of Wilsonville',
    'Mercedes-Benz of Maui'
]

# ===================================================================
# Update n8n workflow
# ===================================================================
print("="*60)
print("Updating n8n workflow with COMPLETE dealer mapping...")
print("="*60)

# Read workflow
with open(workflow_path, 'r', encoding='utf-8') as f:
    workflow = json.load(f)

# Update Generate URLs node
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
for code in sorted(COMPLETE_DEALER_MAP.keys()):
    dealer_name = COMPLETE_DEALER_MAP[code]
    js_dealer_map_lines.append(f"    '{code}': '{dealer_name}',")

js_dealer_map = "\n".join(js_dealer_map_lines)

# Update the dealer map in the code
current_code = generate_node['parameters']['jsCode']

dealer_map_pattern = r'const dealerMap = \{[^}]+\};'
new_dealer_map = f'''const dealerMap = {{
{js_dealer_map}
  }};'''

updated_code = re.sub(dealer_map_pattern, new_dealer_map, current_code, flags=re.DOTALL)
generate_node['parameters']['jsCode'] = updated_code

print(f"[OK] Added {len(COMPLETE_DEALER_MAP)} dealer code mappings")

# Update Sprinter exception list in Filter node
filter_node = None
for node in workflow['nodes']:
    if node.get('name') == 'Filter Pre-Owned Specials':
        filter_node = node
        break

if filter_node:
    current_code = filter_node['parameters']['jsCode']

    # Build Sprinter dealer list
    sprinter_list = ',\n  '.join([f'"{d}"' for d in MB_DEALERS])

    # Update Sprinter dealer list
    sprinter_pattern = r'const SPRINTER_SUPPLEMENT_DEALERS = \[[^\]]*\];'
    new_sprinter_list = f'''const SPRINTER_SUPPLEMENT_DEALERS = [
  {sprinter_list}
];'''

    updated_code = re.sub(sprinter_pattern, new_sprinter_list, current_code, flags=re.DOTALL)
    filter_node['parameters']['jsCode'] = updated_code

    print(f"[OK] Added {len(MB_DEALERS)} Mercedes-Benz dealers to Sprinter exception list")
else:
    print("[WARNING] Filter node not found - Sprinter list not updated")

# Write updated workflow
with open(workflow_path, 'w', encoding='utf-8') as f:
    json.dump(workflow, f, indent=2)

print("\n" + "="*60)
print("[SUCCESS] Complete dealer mapping applied!")
print("="*60)

print(f"\nSummary:")
print(f"  - Total dealer codes: {len(COMPLETE_DEALER_MAP)}")
print(f"  - Mercedes-Benz dealers: {len(MB_DEALERS)}")

print(f"\nMercedes-Benz Dealers (Sprinter Exception):")
for dealer in MB_DEALERS:
    print(f"  - {dealer}")

print(f"\nAll Dealer Mappings:")
brands = {}
for code, name in sorted(COMPLETE_DEALER_MAP.items()):
    brand = name.split()[0]
    if brand not in brands:
        brands[brand] = []
    brands[brand].append(f"{code:15} -> {name}")

for brand in sorted(brands.keys()):
    print(f"\n{brand}:")
    for mapping in brands[brand]:
        print(f"  {mapping}")

print("\nWorkflow ready to import into n8n!")
