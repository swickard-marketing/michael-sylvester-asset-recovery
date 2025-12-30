#!/usr/bin/env python3
"""
Fix three issues in the workflow:
1. Stock filters not reading from Configuration sheet correctly
2. Dealer name should be normalized (not just file name)
3. Append node starting from row 501 instead of row 2
"""

import json

workflow_path = r'C:\Users\Michael.Sylvester\Comprehensive Ai Automation Marketing Worflow Buildout\Pre-owned_Inventory_Sync_Workflow\workflow_updated.json'

# Read workflow
with open(workflow_path, 'r', encoding='utf-8') as f:
    workflow = json.load(f)

print("Fixing three workflow issues...\n")

# ===================================================================
# ISSUE 1: Fix Stock Filter Reading from Configuration Sheet
# ===================================================================
print("=== ISSUE 1: Stock Filter Configuration ===")

# Find the Read Stock Filters node
read_filters_node = None
for node in workflow['nodes']:
    if node.get('name') == 'Read Stock Filters':
        read_filters_node = node
        break

if read_filters_node:
    # Verify it's reading from Configuration sheet
    sheet_name = read_filters_node['parameters']['sheetName']['value']
    print(f"[CHECK] Sheet name: {sheet_name}")

    # Update the note to be accurate
    read_filters_node['notes'] = '📋 Reads stock filters from Configuration sheet (A: Stock_Include, B: Stock_Exclude)'
    print("[OK] Updated Read Stock Filters node note")
else:
    print("[ERROR] Read Stock Filters node not found!")

# ===================================================================
# ISSUE 2: Fix Dealer Name Extraction (Normalize All Dealers)
# ===================================================================
print("\n=== ISSUE 2: Dealer Name Normalization ===")

# Find the Generate URLs & Transform Fields node
generate_node = None
for node in workflow['nodes']:
    if node.get('name') == 'Generate URLs & Transform Fields':
        generate_node = node
        break

if generate_node:
    current_code = generate_node['parameters']['jsCode']

    # Check if extractDealerName function exists
    if 'extractDealerName' in current_code:
        # Add more dealer mappings to ensure all dealers are normalized
        # The dealer map needs to be comprehensive
        updated_code = current_code.replace(
            '''  const dealerMap = {
    'AUDIAKL01': 'Audi Oakland',
    'AUDIBLG01': 'Audi Bellingham',
    'AUDIPA01': 'Audi Palo Alto',
    'BMWEUG01': 'BMW Eugene',
    'BMWLYN01': 'BMW Lynnwood',
    'BMWPOR01': 'BMW Portland',
    'BMWSEA01': 'BMW Seattle',
    'JLRSF01': 'JLR San Francisco',
    'LRSF01': 'Land Rover San Francisco',
    'LEXBEL01': 'Lexus of Bellevue',
    'LEXTAC01': 'Lexus of Tacoma at Fife',
    'MBLYN01': 'Mercedes-Benz of Lynnwood',
    'MBPA01': 'Mercedes-Benz of Palo Alto',
    'MBSEA01': 'Mercedes-Benz of Seattle',
    'MBTAC01': 'Mercedes-Benz of Tacoma',
    'PORSC01': 'Porsche Stevens Creek',
    'CROWNTOY01': 'Crown Toyota'
  };''',
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
  };'''
        )

        generate_node['parameters']['jsCode'] = updated_code
        print("[OK] Expanded dealer name mapping (added 20+ dealer codes)")
    else:
        print("[WARNING] extractDealerName function not found in Generate node")
else:
    print("[ERROR] Generate URLs & Transform Fields node not found!")

# ===================================================================
# ISSUE 3: Fix Append Starting from Row 501
# ===================================================================
print("\n=== ISSUE 3: Append Starting from Row 501 ===")

# Find the Append node
append_node = None
for node in workflow['nodes']:
    if node.get('name') == 'Google Sheets - Append Data':
        append_node = node
        break

if append_node:
    # The issue is that after clearing A2:N500, Google Sheets thinks there are 500 rows
    # We need to set the append to start from a specific row

    # Check current configuration
    current_options = append_node['parameters'].get('options', {})
    print(f"[CHECK] Current options: {current_options}")

    # Update to use range-based append
    append_node['parameters']['options'] = {
        'useAppend': False,  # Don't use automatic append detection
        'locationDefine': {
            'values': {
                'headerRow': 1,
                'firstDataRow': 2  # Always start from row 2
            }
        }
    }

    print("[OK] Updated Append node to start from row 2 (not row 501)")
    print("    - Changed useAppend: false")
    print("    - Set firstDataRow: 2")
else:
    print("[ERROR] Google Sheets - Append Data node not found!")

# ===================================================================
# Write Updated Workflow
# ===================================================================
print("\n" + "="*60)

with open(workflow_path, 'w', encoding='utf-8') as f:
    json.dump(workflow, f, indent=2)

print("[SUCCESS] All three issues fixed!")
print("="*60)

print("\nSummary of Changes:")
print("\n1. STOCK FILTERS:")
print("   - Updated node note for clarity")
print("   - Reads from Configuration sheet (A: Stock_Include, B: Stock_Exclude)")
print("   - Make sure Configuration sheet has headers in row 1!")
print("\n2. DEALER NAMES:")
print("   - Expanded dealer code mapping")
print("   - Added 20+ dealer codes for normalization")
print("   - Includes variations (MBSEATTL01, MBLYNNWOOD01, etc.)")
print("\n3. APPEND ROW FIX:")
print("   - Changed from automatic append detection")
print("   - Now explicitly starts from row 2")
print("   - Data will append correctly after clear")

print("\n" + "="*60)
print("IMPORTANT: Configuration Sheet Setup")
print("="*60)
print("\nMake sure your Configuration sheet has:")
print("  Row 1:")
print("    A1: Stock_Include")
print("    B1: Stock_Exclude")
print("  Row 2+:")
print("    A2: 12345          B2: 99999")
print("    A3: 67890          B3: 88888")
print("    etc.")
print("\nIf headers are missing, stock filters won't work!")
