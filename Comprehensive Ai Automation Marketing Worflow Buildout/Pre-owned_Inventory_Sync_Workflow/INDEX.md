# Pre-owned Inventory Sync Workflow - Project Files

**Project Completion Date:** October 14, 2025

This directory contains all files related to the Pre-owned Inventory Sync workflow project, which automatically syncs vehicle inventory from Reynolds/MaxDigital FTP to Google Sheets every hour.

---

## 📁 File Organization

### Main Workflow Files

| File | Purpose |
|------|---------|
| `Pre-owned Inventory Sync` | **n8n workflow JSON** - Import this into n8n to deploy the workflow |
| `PRE_OWNED_INVENTORY_SYNC_README.md` | **Comprehensive documentation** - Setup, configuration, troubleshooting, monitoring |

---

### Development & Debug Files

| File | Purpose |
|------|---------|
| `parse_csv_fixed.js` | **Final working Parse CSV code** - Uses filesystem-v2 mode binary access |
| `parse_csv_code.js` | **Earlier iteration** - Base64 approach (doesn't work with large files) |
| `debug_binary.js` | **Debug script #1** - Helped discover filesystem-v2 storage mode |
| `debug_binary2.js` | **Debug script #2** - Additional binary data structure investigation |

---

### Reference Documentation

| File | Purpose |
|------|---------|
| `FTP_PROBE_RESULTS.md` | **FTP server structure** - Documents file layout, naming patterns, counts |
| `WORKFLOW_FIX_SUMMARY.md` | **Bug fixes & solutions** - Issues encountered and how they were resolved |

---

## 🚀 Quick Start

1. **Import the workflow:**
   - Open n8n → Import from File
   - Select `Pre-owned Inventory Sync`
   - Click Import

2. **Configure environment variables:**
   ```
   FTP_HOST=ftp.maxdigital.com
   FTP_USER=109424_Google
   FTP_PASS=nwdngmsS
   ```

3. **Set up Google Sheets authentication:**
   - Open Google Sheets node
   - Connect OAuth account with access to sheet ID: `1PkU3Sh9fgWWaz25OqymT2P_EWzB_UvWghgrizTWjHlA`

4. **Activate the workflow:**
   - Toggle "Active" in n8n
   - Workflow runs hourly automatically

5. **Read the documentation:**
   - See `PRE_OWNED_INVENTORY_SYNC_README.md` for complete setup guide

---

## 🔑 Key Technical Solutions

### Critical Fix: Binary Data Access in n8n

**Problem:** Standard `Buffer.from(data, 'base64')` doesn't work with n8n's filesystem-v2 storage mode.

**Solution:** Use `this.helpers.getBinaryDataBuffer(index, propertyName)` instead.

**File:** See `parse_csv_fixed.js` for the working implementation.

---

## 📊 Workflow Performance

- **Execution Time:** ~55 seconds
- **Files Processed:** 35 CSV files per run
- **Vehicle Records:** ~2,470 per execution
- **Schedule:** Every 1 hour (720 executions/month)
- **Monthly Volume:** ~1.78 million vehicle records

---

## 🔗 Related Documentation

- **Universal n8n MCP Guide:** See `N8N_WORKFLOW_DEVELOPMENT_GUIDE.md` in project root
  - How to use n8n MCP + Chrome DevTools MCP
  - Building and debugging workflows with AI assistance
  - Best practices for workflow development

---

## 🛠️ Built With

- **n8n Cloud** - Workflow automation platform
- **n8n MCP** - AI-powered node documentation and validation
- **Chrome DevTools MCP** - Real-time workflow debugging and monitoring
- **Claude Code** - AI pair programming assistant

---

## 📝 Version History

- **v1.0** (October 14, 2025)
  - Initial release
  - Fixed FTP path issues (root vs /inventory/)
  - Fixed filter pattern (U_INV.csv matching)
  - Fixed Parse CSV binary data access (filesystem-v2 mode)
  - Fixed Code node execution modes
  - Added comprehensive documentation

---

**Maintained by:** Swickard Marketing Team
**Last Updated:** October 14, 2025
