# Configuration Sheet Setup Guide

**Important:** The workflow now expects the Configuration sheet to have specific headers!

---

## Quick Setup Steps

### 1. Open Your Google Sheet
- URL: https://docs.google.com/spreadsheets/d/1PkU3Sh9fgWWaz25OqymT2P_EWzB_UvWghgrizTWjHlA

### 2. Create/Verify Configuration Sheet Tab
- Tab name must be exactly: **Configuration**
- If it doesn't exist, create it

### 3. Set Up Headers (Row 1)
```
A1: Stock_Include
B1: Stock_Exclude
```

**How to do it:**
1. Click cell A1
2. Type: `Stock_Include`
3. Press Tab
4. Type: `Stock_Exclude`
5. Press Enter

### 4. Add Stock Numbers (Starting Row 2)

**Include List (Column A):**
- Add stock numbers you WANT to include
- One stock number per row
- Leave empty to include all (after exclusions)

**Exclude List (Column B):**
- Add stock numbers you WANT to exclude
- One stock number per row
- These are removed FIRST (highest priority)

**Example:**
```
| A (Stock_Include) | B (Stock_Exclude) |
|-------------------|-------------------|
| Stock_Include     | Stock_Exclude     |  <- Row 1 (headers)
| 12345             | 99999             |  <- Row 2
| 67890             | 88888             |  <- Row 3
| 11111             |                   |  <- Row 4
```

### 5. Optional: Format Headers
- Select A1:B1
- Make bold
- Add background color (any color)
- Freeze row 1 (View → Freeze → 1 row)

---

## Using the Setup Script

You can also use the Google Apps Script to set up the Configuration sheet automatically:

### Option 1: Run from Apps Script Editor
1. Open Google Sheet
2. Extensions → Apps Script
3. Find function: `setupPreOwnedConfigSheet`
4. Click Run

### Option 2: Run from Custom Menu
1. Open Google Sheet
2. Menu: 🚗 Pre-Owned Setup
3. Click: "Set Up Configuration Sheet"

The script will:
- Create Configuration sheet if missing
- Add headers (Stock_Include, Stock_Exclude)
- Format headers (bold, blue background)
- Freeze row 1
- Set column widths

---

## How Stock Filtering Works

### Priority Order:
1. **Exclude List (Column B)** - Applied FIRST
   - These stocks are ALWAYS removed
   - Even if in include list!

2. **Include List (Column A)** - Applied SECOND
   - If empty: Returns all vehicles (after exclusions)
   - If populated: Returns ONLY these stocks

3. **Minimum Guarantee** - Applied LAST
   - If result has <12 vehicles, adds more
   - Fills from highest-priced vehicles

### Examples:

**Example 1: Blacklist Only**
```
A (Include): (empty)
B (Exclude): 99999, 88888

Result: All vehicles EXCEPT 99999 and 88888
```

**Example 2: Whitelist Only**
```
A (Include): 12345, 67890, 11111
B (Exclude): (empty)

Result: ONLY vehicles 12345, 67890, 11111
(Plus additional if <12 total)
```

**Example 3: Both Lists**
```
A (Include): 12345, 67890, 11111, 99999
B (Exclude): 99999

Result: ONLY vehicles 12345, 67890, 11111
(99999 excluded even though in include list)
```

---

## Troubleshooting

### Stock filters not working
**Symptoms:**
- Workflow shows "0 stocks" in filter logs
- All vehicles passing through regardless of filters

**Fix:**
1. Check Configuration sheet exists
2. Verify headers in row 1 are EXACTLY:
   - A1: `Stock_Include`
   - B1: `Stock_Exclude`
3. Check stock numbers start from row 2
4. Verify Read Stock Filters node is connected

### Filters applying incorrectly
**Check:**
1. Stock numbers are in correct columns
   - Include: Column A
   - Exclude: Column B
2. No extra spaces in stock numbers
3. Stock numbers match exactly (case-insensitive)

### Can't find stock numbers
**Remember:**
- Workflow matches stock numbers case-insensitively
- Stock field may be called: `Stock`, `id`, `stock`, `Stock_Number`, etc.
- Check console logs for "Stock filters loaded" message

---

## Current Configuration Sheet Structure

```
┌─────────────────┬─────────────────┐
│ Stock_Include   │ Stock_Exclude   │  ← Row 1 (Headers)
├─────────────────┼─────────────────┤
│ 12345           │ 99999           │  ← Row 2 (Data)
│ 67890           │ 88888           │
│ 11111           │                 │
│                 │                 │
│ (continue...)   │ (continue...)   │
└─────────────────┴─────────────────┘
     Column A          Column B
```

**Range Read by Workflow:** A2:B500

---

**Next Step:** Import the updated workflow into n8n and test!
