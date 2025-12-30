# FTP Server Probe Results

## Summary

Successfully probed the MaxDigital FTP server and identified the correct configuration for the n8n workflow.

---

## FTP Server Details

**Host:** `ftp.maxdigital.com`
**User:** `109424_Google`
**Port:** `21` (standard FTP)

---

## Key Findings

### 1. File Location
- **Path:** `/` (root directory)
- **Total Files:** 68 files found
- **Structure:** No subdirectories, all files in root

### 2. File Naming Pattern
- **Used Vehicles:** `[DEALER][LOC]U_INV.csv`
- **New Vehicles:** `[DEALER][LOC]_INV.csv` or `[DEALER][LOC]N_INV.csv`
- **Important:** Files have `_INV.csv` suffix, NOT just `.csv`!

### 3. Example Files Found
```
SWICKARD12U_INV.csv  ← Used inventory (Swickard location 12)
AUDIOAKL01U_INV.csv  ← Used inventory (Audi Oakland)
AUDIPALO01U_INV.csv  ← Used inventory (Audi Palo Alto)
BMWOFEUG02U_INV.csv  ← Used inventory (BMW of Eugene)
JLRSANFR01U_INV.csv  ← Used inventory (JLR San Francisco)
PORSCHES02U_INV.csv  ← Used inventory (Porsche Stevens Creek)
... and many more
```

---

## n8n Workflow Configuration

### Corrected Settings:

#### FTP List Files Node
- **Path:** `/`
- **Operation:** `list`
- **Recursive:** `false`

#### Filter CSV Files Node
- **Condition:** Filename ends with `U_INV.csv`
- **Previously (wrong):** `U.csv`
- **Now (correct):** `U_INV.csv`

#### FTP Download File Node
- **Path:** Just the filename (e.g., `SWICKARD12U_INV.csv`)
- **No directory prefix needed** (files are in root)

---

## Dealerships Found (Partial List)

- **Swickard Locations:** 02-25 (multiple locations)
- **Audi:** Oakland, Palo Alto
- **BMW:** Eugene, Lynnwood
- **Mercedes:** Multiple locations (31-36)
- **Porsche:** Stevens Creek
- **Jaguar Land Rover:** San Francisco
- **Lexus:** One location
- **Toyota:** Crown
- **And more...**

---

## What Was Fixed in the Workflow

1. ✅ **Path changed:** From `inventory` to `/` (root)
2. ✅ **Filter updated:** From `U.csv` to `U_INV.csv`
3. ✅ **Notes updated:** Added FTP probe results for reference
4. ✅ **Documentation updated:** Reflects actual file structure

---

## Next Steps

1. **Import the updated workflow** from `Pre-owned Inventory Sync` file
2. **Set environment variables** in n8n:
   - `FTP_HOST` = `ftp.maxdigital.com`
   - `FTP_USER` = `109424_Google`
   - `FTP_PASS` = `nwdngmsS`
3. **Configure Google Sheets OAuth** (click the Sheets node and connect)
4. **Test the workflow** - should now find all `*U_INV.csv` files
5. **Activate** when ready

---

## FTP Probe Script

The probe script is saved at:
`C:\Users\Michael.Sylvester\Comprehensive Ai Automation Marketing Worflow Buildout\ftp_probe.py`

Run anytime to re-check the FTP structure:
```bash
python ftp_probe.py
```

---

## Verification

Run the FTP List node in n8n and you should see approximately:
- **~30-35 used vehicle files** (ending with `U_INV.csv`)
- Each representing a different dealership location
- All from the root `/` directory

---

**Date:** 2025-10-14
**Status:** ✅ Configuration Verified and Corrected
