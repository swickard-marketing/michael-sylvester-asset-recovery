# Changelog - Multi-Automation System Updates

## Version 2.0.0 - 2025-10-13

### 🎉 Major Changes

#### Three-Menu Architecture
- **Unified Menu System**: All three automation systems now live in one Google Apps Script project
  - **Sales Specials Tools** - Vehicle inventory campaigns
  - **Service Specials** - Service offer campaigns
  - **Pre-Owned Specials** - Pre-owned inventory (Coming Soon)
- **Master onOpen() Function**: Single function in Sales Specials script creates all menus
- **No More Conflicts**: Eliminated execution failures from duplicate `onOpen()` functions

---

## Service Specials Script v2.0.0

### ✨ New Features

#### Service Special Card Details Display
- **Title Display**: Shows service special title (e.g., "Oil Change Special")
- **Price Display**: Shows pricing in brand color (e.g., "$29.99")
- **CTA Button**: Custom call-to-action text (e.g., "Claim Offer")
- **Visual Layout**:
  ```
  ┌─────────────────┐
  │  [Image]        │ 260×173px
  ├─────────────────┤
  │ Oil Change      │ Title (18px, bold)
  │   $29.99        │ Price (24px, brand color)
  │ [Claim Offer]   │ CTA button (brand color bg)
  └─────────────────┘
  ```

#### Liquid Template Integration
- **Dynamic Population**: Uses Customer.io customer attributes
- **Required Attributes**:
  ```javascript
  customer.service_specials_count = 3
  customer.service_specials = [
    {
      image_url: "...",
      title: "...",
      price: "$XX.XX",
      cta_text: "...",
      cta_url: "..."
    }
  ]
  ```

### 🐛 Bug Fixes

#### Fixed 16k Character Limit Error (Critical)
- **Issue**: Customer.io API rejected snippets exceeding 16,000 characters
- **Error**: `API Error (422): value cannot exceed 16000 characters`
- **Old Approach**: Generated full HTML documents with DOCTYPE, head, body tags (>16,000 chars)
- **New Approach**: Generates compact HTML fragments (~3,500 chars)
- **Result**: 78% size reduction, well under API limit

#### Fixed Menu Execution Failures
- **Issue**: Multiple `onOpen()` functions caused random execution failures
- **Old Behavior**: Only one `onOpen()` would execute, menus appeared inconsistently
- **New Behavior**: Single master `onOpen()` creates all menus reliably
- **Screenshot Evidence**: User reported failed executions in Apps Script console

### ⚡ Performance Improvements

#### Codebase Cleanup
- **Removed 147 lines** of unused bloated functions:
  - `generateServiceSpecialRows()` - No longer needed
  - `generateSingleDealershipHTML()` - Replaced with compact version
  - `generateMultiDealershipHTML()` - Replaced with compact version
  - `buildCaseStatement()` - No longer needed
- **Before**: 719 lines
- **After**: 572 lines
- **Reduction**: 20% smaller, improved maintainability

#### Unique Function Names
- **Old Names**: Generic names conflicted with other scripts
  ```javascript
  formatWorkspaceName()
  getRandomVehicleEmoji()
  updateSnippetInCustomerIO()
  ```
- **New Names**: Prefixed to avoid conflicts
  ```javascript
  formatServiceWorkspaceName()
  getRandomServiceEmoji()
  updateServiceSnippetInCustomerIO()
  ```

### 📝 Configuration Changes

#### Sheet Name Update
- **Old**: `"Service Specials"`
- **New**: `"Service Specials Automation"`
- **Reason**: More descriptive, matches actual sheet name
- **Line Numbers**: 209, 267

#### Workspace Config Renamed
- **Old**: `WORKSPACES_CONFIG`
- **New**: `SERVICE_WORKSPACES_CONFIG`
- **Reason**: Avoid conflict with Sales Specials config

---

## Sales Specials Script v1.1.0

### ✨ New Features

#### Master onOpen() Function
- **Responsibility**: Creates ALL three menus for the entire project
- **Location**: Lines 64-84
- **Menus Created**:
  1. Sales Specials Tools
  2. Service Specials
  3. Pre-Owned Specials

### 📝 Configuration Changes

#### Pre-Owned Coming Soon Dialog
- **Function**: `showPreOwnedComingSoonDialog()` (lines 1254-1295)
- **Purpose**: Placeholder for Pre-Owned Specials until FTP workaround implemented
- **UI**: Styled modal with "Coming Soon" message
- **Dismissible**: Auto-closes or manual close button

---

## Pre-Owned Inventory Script v1.0.0 (Not Functional)

### 📚 Documentation Added

#### FTP Limitation Warning
- **Issue**: Google Apps Script's `UrlFetchApp` does NOT support FTP protocol
- **Protocols Supported**: HTTP, HTTPS only
- **Impact**: Cannot download inventory files from FTP server

#### Workaround Options Documented
1. **HTTP-to-FTP Proxy Service** (Recommended)
   - Middleware converts FTP to HTTP
   - Technologies: Node.js, Cloud Functions, Lambda

2. **Google Drive Sync**
   - Third-party service syncs FTP → Drive
   - Apps Script reads from Drive

3. **Google Cloud Functions**
   - Deploy function with FTP library
   - Expose as HTTP endpoint

4. **Push-Based Webhook**
   - FTP server pushes updates
   - Apps Script receives via `doPost()`

### 🔧 Architecture Changes

#### Removed Conflicting onOpen()
- **Old**: Had its own `onOpen()` creating "Inventory Sync" menu
- **New**: Uses master `onOpen()` in Sales Specials script
- **Note**: Added documentation explaining the change

---

## Documentation Updates

### Combined Script Setup Guide
- **Renamed**: "Multi-Automation System Setup Guide"
- **Updated**: All references to three-menu system
- **Added**: Recent Improvements section
- **Added**: Pre-Owned FTP Limitation section
- **Added**: How Data Flows for Service Specials
- **Updated**: Troubleshooting with new errors and solutions

### New Files Created
- **CHANGELOG.md**: This file - comprehensive change documentation
- **README updates**: Coming soon

---

## Migration Guide

### For Existing Users

#### If You're Already Using Sales Specials:
1. ✅ Keep your existing Sales Specials script
2. ✅ Update it with the new master `onOpen()` function (lines 64-84)
3. ✅ Add the `showPreOwnedComingSoonDialog()` function (lines 1254-1295)

#### If You're Already Using Service Specials:
1. ⚠️ **IMPORTANT**: Replace your entire Service Specials script with the new version
2. ✅ The new version is 20% smaller and fixes the 16k error
3. ✅ Update your sheet name to "Service Specials Automation"
4. ✅ Populate Customer.io customer attributes (see setup guide)

#### If You Have Both Scripts:
1. ⚠️ **Remove all `onOpen()` functions** except the master one in Sales Specials
2. ✅ Replace Service Specials script completely
3. ✅ Test all three menus appear after reopening the sheet

---

## Breaking Changes

### ⚠️ Service Specials Sheet Name
- **Old**: `"Service Specials"`
- **New**: `"Service Specials Automation"`
- **Action Required**: Rename your sheet OR update lines 209, 267 in the script

### ⚠️ Customer.io Data Structure
- **New Requirement**: Must populate customer attributes in Customer.io
- **Attributes Needed**:
  - `customer.service_specials_count`
  - `customer.service_specials` (array of objects)
- **Why**: Snippet now uses Liquid tags for dynamic content

### ⚠️ Function Name Changes
If you're calling Service Specials functions from other code, update to new names:
- `formatWorkspaceName()` → `formatServiceWorkspaceName()`
- `getRandomVehicleEmoji()` → `getRandomServiceEmoji()`
- `updateSnippetInCustomerIO()` → `updateServiceSnippetInCustomerIO()`

---

## Known Issues

### Pre-Owned Specials Not Functional
- **Status**: Coming Soon
- **Blocker**: FTP protocol not supported by Google Apps Script
- **Workaround Needed**: See documentation for options
- **Menu Behavior**: Shows "Coming Soon" dialog

### Service Special Cards Require Customer.io Setup
- **Requirement**: Customer attributes must be populated manually
- **Impact**: Cards won't display without proper data structure
- **Workaround**: See setup guide for attribute definitions

---

## Testing Performed

### Service Specials Script
- ✅ Successfully generates snippets under 16k characters
- ✅ All 35 workspaces tested
- ✅ Card details (title, price, CTA) display correctly
- ✅ Liquid tags parse properly in Customer.io
- ✅ No API 422 errors

### Menu System
- ✅ All three menus appear reliably
- ✅ No execution failures
- ✅ Pre-Owned shows "Coming Soon" dialog
- ✅ Sales and Service menus fully functional

### Cross-Script Compatibility
- ✅ No function name conflicts
- ✅ No variable name conflicts
- ✅ Single master `onOpen()` works correctly

---

## File Size Changes

| File | Old Size | New Size | Change |
|------|----------|----------|--------|
| Service Specials App Script.js | 719 lines | 572 lines | -147 lines (-20%) |
| Combined Setup Guide.md | 225 lines | 389 lines | +164 lines (docs) |

---

## Contributors
- Claude (Anthropic) - Code optimization and documentation
- Michael Sylvester - Testing and requirements

---

## Next Steps

### Planned for v2.1.0:
1. **Implement FTP Workaround** for Pre-Owned Specials
2. **Auto-populate Customer.io Attributes** from sheet data
3. **Add Multi-brand Support** for Service Specials
4. **Bulk Edit UI** for faster data entry

### Future Enhancements:
- Scheduled automatic updates (time-based triggers)
- Email notifications on successful updates
- Error logging to Google Sheets
- Preview mode before publishing

---

## Support

### Getting Help:
1. Check **Multi-Automation System Setup Guide.md**
2. Review **Troubleshooting** section for common issues
3. Check Apps Script **Execution Log** (Extensions → Apps Script → Executions)
4. Review error messages in dialog boxes

### Reporting Issues:
- Include error messages
- Include execution log screenshots
- Specify which menu/script is affected
- Describe steps to reproduce

---

**Last Updated**: October 13, 2025
**Version**: 2.0.0
**Status**: Production Ready (except Pre-Owned Specials)
