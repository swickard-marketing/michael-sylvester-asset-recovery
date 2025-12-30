# Pre-Owned Inventory Sync Workflow

**Automated hourly sync of vehicle inventory from Reynolds/MaxDigital FTP to Google Sheets for Customer.io campaigns.**

---

## Overview

This n8n workflow automatically retrieves pre-owned vehicle inventory files from the MaxDigital FTP server, filters for used vehicle data, parses CSV files, and uploads the data to a designated Google Sheet. The workflow runs every hour to ensure inventory data stays current for marketing campaigns.

**Built with:** n8n Cloud + n8n MCP + Chrome DevTools MCP

---

## Workflow Architecture

```
⏰ Schedule Trigger (hourly)
    ↓
📁 FTP - List Files (68 files from root)
    ↓
🔍 Filter CSV Files (keep 35 U_INV.csv files)
    ↓
🔧 Construct FTP Path (normalize file paths)
    ↓
⬇️ FTP - Download File (download all 35 CSVs)
    ↓
🔄 Parse CSV to JSON (extract ~2,470 vehicles)
    ↓
📊 Google Sheets - Append (upload to sheet)
    ↓
📝 Log Success (track completion)
```

---

## Configuration Requirements

### Environment Variables

Set these in n8n → Settings → Variables:

| Variable | Value | Purpose |
|----------|-------|---------|
| `FTP_HOST` | `ftp.maxdigital.com` | MaxDigital FTP server |
| `FTP_USER` | `109424_Google` | FTP account username |
| `FTP_PASS` | `nwdngmsS` | FTP account password |

### Google Sheets Authentication

1. Open the "Google Sheets - Append" node
2. Click "Connect my account"
3. Sign in with Google account that has edit access to the target sheet
4. Grant spreadsheet permissions

### Target Sheet

- **Sheet ID:** `1PkU3Sh9fgWWaz25OqymT2P_EWzB_UvWghgrizTWjHlA`
- **Tab Name:** Pre-Owned Specials Automation
- **Access:** Must have Editor permissions

---

## Workflow Details

### Node 1: Schedule Trigger

**Type:** Schedule Trigger
**Interval:** Every 1 hour
**Executions:** ~720/month

**Configuration:**
```json
{
  "rule": {
    "interval": [{
      "field": "hours",
      "hoursInterval": 1
    }]
  }
}
```

**Adjustments:**
- Every 30 min: `hoursInterval: 0.5`
- Every 2 hours: `hoursInterval: 2`
- Daily at 2 AM: Use cron mode with `0 2 * * *`

---

### Node 2: FTP - List Files

**Type:** FTP
**Operation:** List
**Path:** `/` (root directory)
**Output:** ~68 files

**Key Discovery:** Files are in root directory, NOT `/inventory/`

**Verified via FTP probe on 2025-10-14:**
```
Total files: 68
Pattern: [DEALER][LOCATION][TYPE]_INV.csv
Examples:
  - SWICKARD12U_INV.csv (Used)
  - AUDIOAKL01U_INV.csv (Used)
  - SWICKARD12N_INV.csv (New - filtered out)
```

---

### Node 3: Filter CSV Files

**Type:** IF (Filter)
**Condition:** Filename ends with `U_INV.csv`
**Input:** 68 files
**Output:** 35 files (used vehicles only)

**File Types:**
- ✅ `*U_INV.csv` - Used vehicles (KEEP)
- ❌ `*N_INV.csv` - New vehicles (FILTER OUT)
- ❌ `*_INV.csv` - Mixed inventory (FILTER OUT)
- ❌ `*SPRINTER_INV.csv` - Sprinter vans only (FILTER OUT)

**Dealerships Included:**
- Audi Oakland, Audi Palo Alto
- BMW Eugene, BMW Lynnwood
- Crown Toyota
- JLR San Francisco
- Land Rover, Lexus
- Mercedes
- Porsche Stevens Creek
- Swickard locations
- ~25 more dealerships

---

### Node 4: Construct FTP Path

**Type:** Code (JavaScript)
**Mode:** Run Once for Each Item ⚠️ CRITICAL
**Purpose:** Normalize file paths for download

**Code:**
```javascript
const item = $input.item.json;
let downloadPath = item.path || item.name;

// Remove leading slash (files are in root)
if (downloadPath.startsWith('/')) {
  downloadPath = downloadPath.substring(1);
}

return {
  json: {
    ...item,
    downloadPath: downloadPath,
    originalName: item.name
  }
};
```

**Why Critical:**
- FTP servers return paths in different formats
- Some: `/filename.csv` (with leading slash)
- Some: `filename.csv` (without leading slash)
- MaxDigital expects: `filename.csv` (no leading slash)

**Common Bug:** If mode is NOT "Run Once for Each Item", only 1 file processes instead of 35!

---

### Node 5: FTP - Download File

**Type:** FTP
**Operation:** Download
**Path:** `={{$json.downloadPath}}`
**Binary Property:** `data`
**Output:** 35 CSV files (~50-500KB each)

**Performance:** ~33 seconds total for all 35 files (~1 second per file)

**Output Format:**
- Binary data stored in `data` property
- For large files: Uses filesystem-v2 mode (not base64)
- File metadata includes: name, size, mimeType

---

### Node 6: Parse CSV to JSON

**Type:** Code (JavaScript)
**Mode:** Run Once for All Items ⚠️ CRITICAL
**Purpose:** Parse all CSV files into vehicle records
**Input:** 35 CSV files
**Output:** ~2,470 vehicle records

**Critical Fix (2025-10-14):**

The standard binary data access doesn't work with n8n's filesystem storage mode:

```javascript
// ❌ WRONG (doesn't work with filesystem-v2):
const csvText = Buffer.from(binaryData.data, 'base64').toString('utf-8');

// ✅ CORRECT (works with filesystem-v2):
const binaryDataBuffer = await this.helpers.getBinaryDataBuffer(i, 'data');
const csvText = binaryDataBuffer.toString('utf-8');
```

**Why This Matters:**
n8n stores large binary files on disk (filesystem-v2 mode) instead of in memory as base64. The `data` field contains the string "filesystem-v2" as an identifier, NOT the actual file content.

**Solution:** Use `this.helpers.getBinaryDataBuffer(index, propertyName)` to retrieve the actual file buffer.

**Code Structure:**
```javascript
const allVehicles = [];

for (let i = 0; i < items.length; i++) {
  // Get binary buffer (handles filesystem mode)
  const binaryDataBuffer = await this.helpers.getBinaryDataBuffer(i, 'data');
  const csvText = binaryDataBuffer.toString('utf-8');

  // Parse CSV with quote handling
  const lines = csvText.split('\n').filter(line => line.trim());
  const headers = parseCSVLine(lines[0]);

  for (let j = 1; j < lines.length; j++) {
    const values = parseCSVLine(lines[j]);
    const vehicle = {};
    headers.forEach((header, index) => {
      vehicle[header] = values[index] || '';
    });
    vehicle['_source_file'] = item.json.originalName;
    allVehicles.push({ json: vehicle });
  }
}

return allVehicles;
```

**Performance:** ~4.4 seconds to parse all 35 files

**Added Field:** `_source_file` tracks which dealership each vehicle came from

---

### Node 7: Google Sheets - Append

**Type:** Google Sheets
**Operation:** Append Row
**Authentication:** OAuth2
**Data Mode:** Auto-map Input Data
**Input:** ~2,470 vehicle records

**Sheet Configuration:**
- Document ID: `1PkU3Sh9fgWWaz25OqymT2P_EWzB_UvWghgrizTWjHlA`
- Sheet Name: `Pre-Owned Specials Automation`

**Behavior:**
- Appends new rows to bottom of sheet
- Does NOT clear existing data
- All CSV columns automatically mapped to sheet columns
- Header row preserved

**Data Growth:**
- Per execution: ~2,470 rows
- Per day (24 runs): ~59,280 rows
- Per week: ~415,000 rows

**⚠️ Important:** This workflow APPENDS data without clearing old rows. Sheet will grow indefinitely unless you:

**Option 1: Add a Clear Node**
- Add "Google Sheets - Clear" node before Append
- Clear range: `A2:Z` (keeps headers, clears data)
- This replaces data each hour instead of accumulating

**Option 2: Manual Cleanup**
- Periodically delete old data
- Keep only latest run's data

**Performance:** ~13 seconds to upload 2,470 records

---

### Node 8: Log Success

**Type:** Code
**Purpose:** Log completion for monitoring

**Output:**
```
Synced SWICKARD12U_INV.csv to Google Sheets at 2025-10-14T15:30:00Z
```

**Use Cases:**
- Track which files synced successfully
- Monitor sync timing
- Debug missing files
- Audit workflow executions

**View Logs:**
- n8n Dashboard → Executions → Click workflow run → View output

---

## Performance Metrics

### Execution Time Breakdown

| Node | Time | Notes |
|------|------|-------|
| Schedule Trigger | 1ms | Instant |
| FTP - List Files | 1.4s | Network latency |
| Filter CSV Files | 17ms | Simple comparison |
| Construct FTP Path | 2.3s | Processing 35 items |
| FTP - Download File | 33s | ⚠️ Slowest node |
| Parse CSV to JSON | 4.4s | Processing 35 files |
| Google Sheets - Append | 13s | ⚠️ Large upload |
| Log Success | <1s | Simple output |

**Total:** ~55 seconds per execution

### Data Volume

- **FTP Files:** 68 total, 35 filtered
- **File Size:** ~50-500KB per CSV
- **Total Download:** ~5-15MB per run
- **Vehicle Records:** ~2,470 per execution
- **Monthly Data:** ~1.78 million vehicles processed

---

## Troubleshooting Guide

### Issue 1: FTP Connection Failed

**Error:** "Connection refused" or "Timeout"

**Causes:**
- FTP server down
- Incorrect credentials
- Network firewall blocking port 21

**Debug Steps:**
1. Verify environment variables: `FTP_HOST`, `FTP_USER`, `FTP_PASS`
2. Test FTP connection manually:
```python
import ftplib
ftp = ftplib.FTP("ftp.maxdigital.com")
ftp.login("109424_Google", "nwdngmsS")
ftp.retrlines('NLST')  # Should list files
```
3. Check n8n cloud IP isn't blocked by MaxDigital firewall

---

### Issue 2: No Files Downloaded / "Non-existing file"

**Error:** FTP download fails with "Non-existing file"

**Causes:**
- Incorrect file path
- Files moved to different directory
- Leading slash in path

**Debug Steps:**
1. Check FTP List output - verify files exist
2. Check Construct Path output - verify path format
3. Verify path doesn't have leading slash
4. Test download with different file

**Fix:**
```javascript
// Remove leading slash in Construct Path node:
if (downloadPath.startsWith('/')) {
  downloadPath = downloadPath.substring(1);
}
```

---

### Issue 3: Parse CSV Returns 0 Vehicles

**Error:** Parse CSV node completes but returns empty array

**Causes:**
- Binary data not accessible
- Using wrong data access method
- n8n filesystem-v2 storage mode

**Debug Steps:**
1. Check FTP Download output - verify binary data exists
2. Add debug logging to Parse CSV node:
```javascript
console.log('Binary structure:', Object.keys(item.binary));
console.log('Data type:', typeof item.binary.data);
console.log('Data.data value:', item.binary.data.data);
```
3. If `data.data` = "filesystem-v2", use `getBinaryDataBuffer()`

**Fix:**
```javascript
// Use helper method for filesystem mode:
const binaryDataBuffer = await this.helpers.getBinaryDataBuffer(i, 'data');
const csvText = binaryDataBuffer.toString('utf-8');
```

---

### Issue 4: Only 1 File Processes Instead of 35

**Error:** Filter shows 35 items, but next node shows 1 item

**Cause:** Code node mode set to "Run Once for All Items" when it should be "Run Once for Each Item"

**Debug Steps:**
1. Click the problematic node
2. Check "Mode" setting in parameters
3. Look at item counts in workflow execution

**Fix:**
```json
{
  "parameters": {
    "mode": "runOnceForEachItem",  // ADD THIS!
    "jsCode": "// your code"
  }
}
```

---

### Issue 5: Google Sheets 404 Error

**Error:** "The resource you are requesting could not be found"

**Causes:**
- Incorrect sheet ID
- Sheet doesn't exist
- Tab name doesn't match
- OAuth account doesn't have access

**Debug Steps:**
1. Verify sheet ID in URL:
```
https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
```
2. Check tab name (case-sensitive): "Pre-Owned Specials Automation"
3. Verify OAuth account has Editor access to sheet
4. Re-authenticate OAuth connection

**Fix:**
1. Click Google Sheets node
2. Click credential dropdown
3. Select "Create New" or edit existing
4. Click "Connect my account"
5. Sign in with account that owns the sheet

---

### Issue 6: Workflow Doesn't Run Automatically

**Error:** Workflow doesn't execute on schedule

**Causes:**
- Workflow not activated
- Schedule trigger not configured
- n8n cloud quota exceeded

**Fix:**
1. Check workflow status in top-right (should show "Active")
2. Toggle "Active" switch if needed
3. Check n8n Dashboard → Executions → Verify recent runs
4. Check n8n quota/usage limits

---

## Monitoring & Maintenance

### Check Execution History

**n8n Dashboard → Executions**

Look for:
- ✅ Success rate (should be >95%)
- ⏱️ Execution time (should be ~55 seconds)
- 📊 Data volume (should be ~2,470 vehicles)
- ❌ Failed executions (investigate errors)

### Monitor Sheet Size

**Check Google Sheet row count periodically:**

If using APPEND mode (no clear):
- Per hour: +2,470 rows
- Per day: +59,280 rows
- Per week: +415,000 rows
- Google Sheets limit: 10 million rows

**Action:** Add Clear node or archive old data when sheet grows large.

### Update Credentials

**If FTP credentials change:**
1. n8n → Settings → Variables
2. Edit `FTP_USER` and `FTP_PASS`
3. Save changes
4. Test workflow execution

**If Google access changes:**
1. Open Google Sheets node
2. Re-authenticate OAuth connection
3. Test workflow execution

---

## Optimization Opportunities

### 1. Parallel FTP Downloads

**Current:** Sequential downloads (~1 second each)
**Potential:** Parallel downloads (all at once)

**Benefit:** Could reduce 33s download time to ~5-10s

**Implementation:** Split into batches, use parallel execution

---

### 2. Batch Sheet Uploads

**Current:** Upload all 2,470 rows at once
**Potential:** Upload in chunks of 500 rows

**Benefit:** Faster execution, better error handling

**Implementation:** Loop through chunks, upload each separately

---

### 3. Delta Sync (Advanced)

**Current:** Process all 35 files every hour
**Potential:** Only process files modified since last run

**Benefit:** Reduced processing time and API calls

**Implementation:**
- Store last modified timestamps
- Check FTP file modification time
- Skip unchanged files

---

## Version History

### v1.0 (October 14, 2025)
- Initial workflow creation
- Fixed FTP path issue (root vs /inventory/)
- Fixed filter pattern (U_INV.csv vs U.csv)
- Fixed Parse CSV binary data access (filesystem-v2 mode)
- Fixed Code node execution mode (runOnceForEachItem)
- Added comprehensive documentation to all nodes
- Tested and validated: 2,470 vehicles synced successfully

---

## Support & References

**Workflow Files:**
- `Pre-owned Inventory Sync` - n8n workflow JSON
- `FTP_PROBE_RESULTS.md` - FTP server structure documentation
- `WORKFLOW_FIX_SUMMARY.md` - Bug fixes and solutions
- `N8N_WORKFLOW_DEVELOPMENT_GUIDE.md` - Complete MCP development guide

**External Resources:**
- [n8n Documentation](https://docs.n8n.io)
- [FTP Node Docs](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.ftp/)
- [Google Sheets Node Docs](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/)
- [Code Node Docs](https://docs.n8n.io/code/builtin/)

---

**Maintained by:** Swickard Marketing Team
**Built with:** Claude Code + n8n MCP + Chrome DevTools MCP
**Last Updated:** October 14, 2025
