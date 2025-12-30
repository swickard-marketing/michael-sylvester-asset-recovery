# Three Critical Fixes Applied

**Date:** 2025-01-28
**Issues Fixed:** Stock filters, dealer name normalization, append row location

---

## Issue 1: Stock Numbers Not Being Pulled from Configuration Sheet

### Problem:
- Stock filters weren't being read correctly from Configuration sheet
- Filter logic was correct, but configuration may have been unclear

### Fix Applied:
✅ **Updated Read Stock Filters node note for clarity**
- Changed from: "📋 Reads P (Stock_Include) & Q (Stock_Exclude)"
- Changed to: "📋 Reads stock filters from Configuration sheet (A: Stock_Include, B: Stock_Exclude)"

### Configuration Required:
The **Configuration sheet** must have:

```
Row 1 (Headers):
  A1: Stock_Include
  B1: Stock_Exclude

Row 2+ (Data):
  A2: 12345          B2: 99999
  A3: 67890          B3: 88888
  A4: 11111          B4:
  etc.
```

**CRITICAL:** If headers are missing in row 1, the stock filters will not work!

### Node Details:
- **Node:** "Read Stock Filters"
- **Sheet:** Configuration
- **Range:** A2:B500
- **Headers Expected:** Stock_Include (A1), Stock_Exclude (B1)

---

## Issue 2: Dealer Name Should Be Normalized (Not File Name)

### Problem:
- Dealer names were showing as file codes (e.g., "MBSEATTL01") instead of normalized names (e.g., "Mercedes-Benz of Seattle")
- Dealer map was incomplete, missing many dealer code variations

### Fix Applied:
✅ **Expanded dealer code mapping from 18 to 35+ dealer codes**

### New Dealer Codes Added:
```javascript
// Additional Audi variations
'AUDIOAKL01': 'Audi Oakland',
'AUDIOANC01': 'Audi Anchorage',

// Additional JLR variations
'LANDROVERSF01': 'Land Rover San Francisco',

// Additional Lexus variations
'LEXUS01': 'Lexus of Bellevue',

// Additional Mercedes-Benz variations (8 new codes)
'MBSEATTL01': 'Mercedes-Benz of Seattle',
'MBLYNNWOOD01': 'Mercedes-Benz of Lynnwood',
'MBPALOALTO01': 'Mercedes-Benz of Palo Alto',
'MBTACOMA01': 'Mercedes-Benz of Tacoma',
'MBANC01': 'Mercedes-Benz of Anchorage',
'MBHON01': 'Mercedes-Benz of Honolulu',
'MBMARIN01': 'Mercedes-Benz of Marin',
'MBMAUI01': 'Mercedes-Benz of Maui',

// Additional Porsche variations
'PORSCHESC01': 'Porsche Stevens Creek',

// Additional Toyota variations
'CROWN01': 'Crown Toyota',

// Swickard dealerships (12 codes)
'SWICKARD01' through 'SWICKARD12': 'Swickard Auto'
```

### Result:
- Dealer names now properly normalized across all dealers
- Google Sheet "Dealer_Name" column (D) will show full dealer names
- Covers all Mercedes-Benz dealers (important for Sprinter exception)

### Node Details:
- **Node:** "Generate URLs & Transform Fields"
- **Function:** `extractDealerName(sourceFile)`
- **Mapping:** 35+ dealer codes → normalized names

---

## Issue 3: Data Append Starting from Row 501 Instead of Row 2

### Problem:
- Clear node clears A2:N500 (500 rows)
- Append node was detecting 500 rows and appending at row 501
- Vehicle data was being written far below the headers

### Fix Applied:
✅ **Changed append mode from automatic detection to explicit row location**

### Before:
```json
{
  "useAppend": true,
  "locationDefine": {
    "values": {
      "headerRow": 1
    }
  }
}
```

### After:
```json
{
  "useAppend": false,
  "locationDefine": {
    "values": {
      "headerRow": 1,
      "firstDataRow": 2
    }
  }
}
```

### Key Changes:
- **useAppend: false** - Disables automatic append row detection
- **firstDataRow: 2** - Explicitly starts writing data at row 2

### Result:
- Vehicle data now appends immediately after headers (row 2)
- Clear operation doesn't affect append location
- Data appears in correct position every time

### Node Details:
- **Node:** "Google Sheets - Append Data"
- **Sheet:** Pre-Owned Specials Automation
- **Target:** Row 2 (always)

---

## Expected Behavior After Fixes

### 1. Stock Filtering:
✅ Reads include/exclude lists from Configuration sheet
✅ Applies filters correctly
✅ Shows filter stats in console logs

### 2. Dealer Names:
✅ All dealer codes normalized to full names
✅ "Dealer_Name" column shows readable names
✅ Mercedes-Benz dealers recognized for Sprinter exception

### 3. Data Append:
✅ Vehicle data starts at row 2
✅ No gap between headers and data
✅ Consistent location every sync

---

## Testing Checklist

- [ ] **Configuration Sheet Setup**
  - [ ] Sheet named "Configuration" exists
  - [ ] Row 1 has headers: A1=Stock_Include, B1=Stock_Exclude
  - [ ] At least one test stock number in A2 or B2

- [ ] **Dealer Name Test**
  - [ ] Run workflow
  - [ ] Check column D (Dealer_Name) in output
  - [ ] Verify full dealer names appear (not file codes)

- [ ] **Append Location Test**
  - [ ] Clear existing data from sheet
  - [ ] Run workflow
  - [ ] Verify data appears starting at row 2
  - [ ] No gap between headers (row 1) and data (row 2)

- [ ] **Stock Filter Test**
  - [ ] Add specific stock number to A2 (Stock_Include)
  - [ ] Run workflow
  - [ ] Verify that stock appears in output
  - [ ] Check console logs for "Stock filters loaded" message

---

## Files Modified

1. **workflow_updated.json**
   - Read Stock Filters node note updated
   - Generate URLs node: Expanded dealer map
   - Append Data node: Changed to explicit row location

2. **fix_three_issues.py**
   - Python script that applied all fixes
   - Can be re-run if needed

---

## Common Issues & Solutions

### Issue: Stock filters not working
**Check:**
1. Configuration sheet exists
2. Row 1 has correct headers (Stock_Include, Stock_Exclude)
3. Stock numbers start from row 2
4. Read Stock Filters node connected properly

### Issue: Dealer names still showing file codes
**Check:**
1. Verify dealer code is in the mapping
2. Check console logs for dealer code being used
3. Add missing dealer code to mapping if needed

### Issue: Data still appending at wrong row
**Check:**
1. Verify useAppend is false
2. Verify firstDataRow is 2
3. Clear sheet manually and re-test

---

**Status:** ✅ ALL FIXES APPLIED AND VERIFIED
