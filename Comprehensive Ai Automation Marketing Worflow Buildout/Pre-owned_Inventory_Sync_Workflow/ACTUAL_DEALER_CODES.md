# Actual Dealer Codes in Workflow

**Updated:** 2025-01-28
**Status:** Only includes dealer codes that actually exist in FTP files

---

## Current Dealer Code Mapping

### Audi Stores (3 dealers)
| FTP File Code | Normalized Dealer Name |
|---------------|------------------------|
| AUDIAKL01     | Audi Oakland          |
| AUDIBLG01     | Audi Bellingham       |
| AUDIPA01      | Audi Palo Alto        |

### BMW Stores (4 dealers)
| FTP File Code | Normalized Dealer Name |
|---------------|------------------------|
| BMWEUG01      | BMW Eugene            |
| BMWLYN01      | BMW Lynnwood          |
| BMWPOR01      | BMW Portland          |
| BMWSEA01      | BMW Seattle           |

### Jaguar Land Rover (2 dealers)
| FTP File Code | Normalized Dealer Name      |
|---------------|-----------------------------|
| JLRSF01       | JLR San Francisco          |
| LRSF01        | Land Rover San Francisco   |

### Lexus Stores (2 dealers)
| FTP File Code | Normalized Dealer Name          |
|---------------|---------------------------------|
| LEXBEL01      | Lexus of Bellevue              |
| LEXTAC01      | Lexus of Tacoma at Fife        |

### Mercedes-Benz Stores (4 dealers)
| FTP File Code | Normalized Dealer Name         |
|---------------|--------------------------------|
| MBLYN01       | Mercedes-Benz of Lynnwood     |
| MBPA01        | Mercedes-Benz of Palo Alto    |
| MBSEA01       | Mercedes-Benz of Seattle      |
| MBTAC01       | Mercedes-Benz of Tacoma       |

### Porsche Stores (1 dealer)
| FTP File Code | Normalized Dealer Name    |
|---------------|---------------------------|
| PORSC01       | Porsche Stevens Creek    |

### Toyota / Scion (1 dealer)
| FTP File Code | Normalized Dealer Name |
|---------------|------------------------|
| CROWNTOY01    | Crown Toyota          |

### Swickard Dealerships (12 dealers)
| FTP File Code | Normalized Dealer Name |
|---------------|------------------------|
| SWICKARD01    | Swickard Auto         |
| SWICKARD02    | Swickard Auto         |
| SWICKARD03    | Swickard Auto         |
| SWICKARD04    | Swickard Auto         |
| SWICKARD05    | Swickard Auto         |
| SWICKARD06    | Swickard Auto         |
| SWICKARD07    | Swickard Auto         |
| SWICKARD08    | Swickard Auto         |
| SWICKARD09    | Swickard Auto         |
| SWICKARD10    | Swickard Auto         |
| SWICKARD11    | Swickard Auto         |
| SWICKARD12    | Swickard Auto         |

**Total:** 29 dealer codes mapped

---

## Sprinter Exception Dealers (Mercedes-Benz Only)

These dealers' Sprinter vehicles bypass the 100-mile minimum mileage filter:

1. Mercedes-Benz of Palo Alto (MBPA01)
2. Mercedes-Benz of Lynnwood (MBLYN01)
3. Mercedes-Benz of Seattle (MBSEA01)
4. Mercedes-Benz of Tacoma (MBTAC01)

---

## Codes Removed (Don't Exist in FTP)

These were in the original Python script but don't exist in your FTP files:

**Removed from dealer mapping:**
- AUDIOAKL01 (was duplicate)
- AUDIOANC01 (Audi Anchorage)
- LANDROVERSF01 (was duplicate)
- LEXUS01 (was duplicate)
- MBSEATTL01 (Seattle variation)
- MBLYNNWOOD01 (Lynnwood variation) **← User reported**
- MBPALOALTO01 (Palo Alto variation)
- MBTACOMA01 (Tacoma variation)
- MBANC01 (Anchorage)
- MBHON01 (Honolulu)
- MBMARIN01 (Marin)
- MBMAUI01 (Maui)
- PORSCHESC01 (was duplicate)
- CROWN01 (was duplicate)

**Removed from Sprinter exceptions:**
- Mercedes-Benz of Anchorage (MBANC01)
- Mercedes-Benz of Honolulu (MBHON01)
- Mercedes-Benz of Marin (MBMARIN01)
- Mercedes-Benz of Maui (MBMAUI01)

---

## How to Add Missing Dealer Codes

If you see a dealer code in your FTP files that's not in this list:

1. Check the FTP file name (e.g., `NEWDEALER01U_INV.csv`)
2. Extract the dealer code (e.g., `NEWDEALER01`)
3. Add to the `dealerMap` in the Generate URLs node:

```javascript
'NEWDEALER01': 'Full Dealer Name',
```

**Or let me know the dealer code and I'll add it for you!**

---

## Expected FTP File Names

Based on the mapping above, your FTP should have files like:

```
AUDIAKL01U_INV.csv
AUDIBLG01U_INV.csv
AUDIPA01U_INV.csv
BMWEUG01U_INV.csv
BMWLYN01U_INV.csv
BMWPOR01U_INV.csv
BMWSEA01U_INV.csv
JLRSF01U_INV.csv
LRSF01U_INV.csv
LEXBEL01U_INV.csv
LEXTAC01U_INV.csv
MBLYN01U_INV.csv
MBPA01U_INV.csv
MBSEA01U_INV.csv
MBTAC01U_INV.csv
PORSC01U_INV.csv
CROWNTOY01U_INV.csv
SWICKARD01U_INV.csv
SWICKARD02U_INV.csv
... (etc for SWICKARD03-12)
```

---

## Verification Checklist

After running the workflow:

- [ ] Check column D (Dealer_Name) in Google Sheet
- [ ] Verify all dealer names are normalized (not file codes)
- [ ] Look for any dealer codes that appear as-is (not normalized)
- [ ] If you find unmapped codes, add them to the mapping

**If dealer names still show as codes (e.g., "NEWDEALER01"), that code needs to be added to the mapping.**

---

**Status:** ✅ Cleaned up to only include existing dealer codes
