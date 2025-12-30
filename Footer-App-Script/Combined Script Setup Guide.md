# Multi-Automation System Setup Guide

## 📋 Overview

This setup combines **Sales Specials**, **Service Specials**, and **Pre-Owned Specials** automation in one Google Sheet with three separate menu systems.

### Three Menu Systems:
1. **Sales Specials Tools** - Updates Customer.io snippets and collections for vehicle sales campaigns
2. **Service Specials** - Updates Customer.io snippets for service offer campaigns
3. **Pre-Owned Specials** - Pre-owned inventory management (Coming Soon - requires FTP workaround implementation)

---

## 🏗️ Google Sheet Structure

Your Google Sheet should have **THREE tabs**:

### Tab 1: Sales Specials Data
- Contains vehicle inventory data for sales campaigns
- Used by the Sales Specials Collection App Script
- Updates Sales Specials snippets and collections in Customer.io

### Tab 2: Service Specials Automation
- Contains service offer data for service campaigns
- Used by the Service Specials App Script
- Updates Service Specials Product Card snippets in Customer.io
- **IMPORTANT**: Sheet name must be exactly "Service Specials Automation"

### Tab 3: Pre-Owned Inventory (Optional - Coming Soon)
- Will contain pre-owned inventory stock numbers
- Currently not functional - awaiting FTP workaround implementation
- See Pre-Owned section below for details

---

## 📊 Service Specials Automation Tab Columns

The "Service Specials Automation" tab needs these columns:

### 🎯 How Data Flows:
This script generates a **compact HTML snippet** with Liquid template tags that dynamically populates from **Customer.io customer attributes** at email send time.

**You must populate these customer attributes in Customer.io:**
```javascript
customer.service_specials_count = 3  // Number of specials to show
customer.service_specials = [
  {
    image_url: "https://...",
    title: "Oil Change Special",
    price: "$29.99",
    cta_text: "Claim Offer",
    cta_url: "https://..."
  },
  // ... more specials
]
```

### Column Definitions:

| Column Name | Description | Example |
|------------|-------------|---------|
| Dealership | Exact dealership name (must match workspace config) | Swickard Honda Thousand Oaks |
| Special_Image_URL | URL to the service special image (260×173px) | https://example.com/oil-change.jpg |
| Special_Title | Title of the special | Oil Change Special |
| Special_Price | Price display (optional) | $29.99 |
| Special_CTA_Text | Button text (optional) | Claim Offer |
| Special_CTA_URL | Link for the special | https://www.dealership.com/specials |
| Hero_Image_URL | URL to hero banner (600×400px) - **only on first row** | https://example.com/hero.jpg |
| Schedule_Service_URL | Schedule service page link - **only on first row** | https://www.dealership.com/schedule |
| Service_Specials_URL | Service specials page - **only on first row** | https://www.dealership.com/specials |
| Service_Match_URL | Service match page - **only on first row** | https://www.dealership.com/match |
| Phone_Number | Display phone - **only on first row** | 805-371-5500 |
| Phone_Number_Tel | Tel link format - **only on first row** | +18053715800 |
| Brand_Color | Hex color code - **only on first row** | #00adef |
| Dealership_Display_Name | Full name for disclaimers - **only on first row** | Swickard Honda of Thousand Oaks |
| Offer_Expiration_Date | Expiration date - **only on first row** | 10/31/25 |
| Brand_Make | Vehicle brand - **only on first row** | Honda |
| Service_Special_Disclaimer | Full disclaimer text - **only on first row** | Plus tax and fees... |
| Service_Match_Disclaimer | Service match disclaimer - **only on first row** | Dealership must be within 25 miles... |

### 💡 Important: Multiple Rows Per Dealership

- **First Row**: Include ALL columns (shared dealership data + first special)
- **Additional Rows**: Only fill in: `Dealership`, `Special_Image_URL`, `Special_Title`, `Special_Price`, `Special_CTA_Text`, `Special_CTA_URL`

**Example:**
```
Row 1: Swickard Honda TO | [hero url] | [schedule url] | ... | [oil change image] | Oil Change Special | ...
Row 2: Swickard Honda TO | | | ... | [tire rotation image] | Tire Rotation | ...
Row 3: Swickard Honda TO | | | ... | [brake inspection image] | Brake Inspection | ...
```

---

## 🔧 Google Apps Script Setup

### Step 1: Open Script Editor
1. Open your Google Sheet
2. Go to **Extensions → Apps Script**

### Step 2: Add Sales Specials Script (Master)
1. In the Apps Script editor, click the **+ button** next to "Files"
2. Choose "Script"
3. Name it `SalesSpecials.gs`
4. Copy and paste the entire **store specials collection app script.js** content
5. **IMPORTANT**: This script contains the **MASTER onOpen()** function that creates ALL three menus
6. Click **Save** (💾 icon)

### Step 3: Add Service Specials Script
1. Click the **+ button** next to "Files" again
2. Choose "Script"
3. Name it `ServiceSpecials.gs`
4. Copy and paste the entire **Service Specials App Script.js** content
5. **Note**: This script does NOT have an onOpen() function - it uses the master one
6. Click **Save** (💾 icon)

### Step 4: Add Pre-Owned Inventory Script (Optional)
1. Click the **+ button** next to "Files" again
2. Choose "Script"
3. Name it `PreOwnedInventory.gs`
4. Copy and paste the entire **Pre_Owned_Inventory_Sync.js** content
5. **Note**: This script is currently non-functional (awaiting FTP workaround)
6. Click **Save** (💾 icon)

### Step 5: Refresh the Sheet
1. Close and reopen your Google Sheet
2. You should now see **THREE menu items** at the top:
   - **Sales Specials Tools**
   - **Service Specials**
   - **Pre-Owned Specials** (shows "Coming Soon" dialog)

### 🏗️ Architecture:
- **One master onOpen()** in Sales Specials script creates all menus
- No conflicting function names between scripts
- All scripts share the same Apps Script project

---

## 🚀 Usage

### To Update Sales Specials:

1. Fill in your "Sales Specials Data" tab with vehicle inventory
2. Click **Sales Specials Tools** menu
3. Choose:
   - **Update ALL Workspaces** - Updates all workspaces at once
   - **Update a Specific Workspace...** - Select one dealership from dropdown

### To Update Service Specials:

1. Fill in your "Service Specials Automation" tab with service offer data
2. **Populate Customer.io customer attributes** (see column definitions above)
3. Click **Service Specials** menu
4. Choose:
   - **Update ALL Workspaces** - Updates all 35 workspaces at once
   - **Update a Specific Workspace...** - Select one dealership from dropdown
5. The script generates a **compact snippet** (~3,500 characters) with Liquid tags

### To Use Pre-Owned Specials:

1. Click **Pre-Owned Specials** menu
2. Currently shows **"Coming Soon"** dialog
3. **Not yet functional** - requires FTP workaround implementation (see below)

---

## 🎯 How It Works

### Odd Number of Specials (Auto-Hero Insertion):

If you have **3 service specials** for a dealership:
```
Email Output:
┌─────────────────────────┐
│   600px Hero Image      │  ← Top banner
└─────────────────────────┘
┌───────────┬───────────┐
│ Special 1 │ Special 2 │  ← Row 1: Two specials
└───────────┴───────────┘
┌───────────┬───────────┐
│ Special 3 │ Hero Copy │  ← Row 2: Hero auto-inserted
└───────────┴───────────┘
[Rest of email continues...]
```

### Even Number of Specials:

If you have **2 service specials**:
```
Email Output:
┌─────────────────────────┐
│   600px Hero Image      │  ← Top banner
└─────────────────────────┘
┌───────────┬───────────┐
│ Special 1 │ Special 2 │  ← Row 1: Two specials
└───────────┴───────────┘
[Rest of email continues...]
```

---

## 📝 Example CSV Data

See **Service Specials Example Data - Updated.csv** for a complete example with:
- Swickard Honda Thousand Oaks (3 specials - will get hero auto-inserted)
- Acura Thousand Oaks (2 specials - even pair)
- Crown Toyota (1 special - will get hero paired with it)

---

## ✅ Verification

After running the script:

1. **Check Customer.io:**
   - Go to Content → Snippets
   - Search for "Service-Specials-Product-Card"
   - Preview the snippet to see dynamic service special cards

2. **Test in Campaign:**
   - Create a test campaign
   - Insert the `{% snippet "Service-Specials-Product-Card" %}` tag
   - Send test email to verify layout

---

## ⚡ Recent Improvements

### Service Specials Script Optimizations:
1. **Fixed 16k Character Limit Error**
   - Old version generated full HTML documents (>16,000 characters)
   - New version generates compact HTML fragments (~3,500 characters)
   - Customer.io API limit is 16,000 characters per snippet

2. **Added Service Special Card Details**
   - Now displays **title**, **price**, and **CTA button text**
   - Previously only showed images
   - Better user experience with clear pricing and calls-to-action

3. **Cleaned Up Codebase**
   - Removed 147 lines of unused bloated functions
   - Script reduced from 719 lines to 572 lines (20% smaller)
   - Improved maintainability and performance

4. **Uses Liquid Template Tags**
   - Dynamically populates from Customer.io customer attributes
   - Same approach as Sales Specials script
   - More flexible for personalization

### Architecture Improvements:
1. **Single Master onOpen() Function**
   - No more conflicting `onOpen()` functions between scripts
   - All three menus created from one central location
   - Eliminates execution failures

2. **Unique Function Names**
   - All Service Specials functions prefixed with `Service` or `service`
   - No naming conflicts between scripts
   - Clean separation of concerns

---

## 🚧 Pre-Owned Specials - FTP Limitation

### Current Status: **Not Functional**

**Problem**: Google Apps Script's `UrlFetchApp` does **NOT** support FTP protocol.
- Only supports HTTP and HTTPS protocols
- Cannot directly connect to FTP servers
- Pre-Owned Inventory Sync requires FTP access

### Workaround Options:

#### Option 1: HTTP-to-FTP Proxy Service (Recommended)
Set up a middleware service that:
1. Receives HTTP requests from Apps Script
2. Connects to FTP server on your behalf
3. Returns file contents via HTTP response

**Technologies**: Node.js, Google Cloud Functions, AWS Lambda

#### Option 2: Sync FTP to Google Drive
- Use third-party service or scheduled task
- Sync FTP files → Google Drive automatically
- Apps Script reads from Drive using `DriveApp`

#### Option 3: Google Cloud Functions
- Deploy Cloud Function with FTP library support
- Expose as HTTP endpoint
- Apps Script calls the endpoint

#### Option 4: Push-Based Webhook
- Configure FTP server to push updates
- Use Apps Script `doPost()` to receive data
- No pulling required

### When Will It Work?
Once you implement one of the workarounds above, the Pre-Owned Specials menu will be updated to show:
- **Sync All Dealerships**
- **Sync Selected Dealership...**
- **Configure Settings**

---

## 🆘 Troubleshooting

### "Sheet 'Service Specials Automation' not found"
- Make sure your tab is named exactly **"Service Specials Automation"** (case-sensitive)
- Old script referenced "Service Specials" - this has been updated

### "No data found for dealership"
- Check that the Dealership name in your sheet **exactly matches** the name in `WORKSPACES_CONFIG`
- Example: "Swickard Honda Thousand Oaks" (not "Honda Thousand Oaks")

### "API Error (422): value cannot exceed 16000 characters"
- ✅ **FIXED** in latest version
- Old version generated full HTML documents
- New version generates compact fragments (~3,500 characters)
- Make sure you're using the updated Service Specials script

### Cards not appearing in email
- Verify Special_Image_URL column has valid image URLs
- Check that **customer attributes are populated in Customer.io**:
  - `customer.service_specials_count`
  - `customer.service_specials` array
- Ensure first row has all shared dealership fields filled

### Menu not showing or execution failures
- **Check for multiple onOpen() functions** - should only be in Sales Specials script
- Refresh the Google Sheet (close and reopen)
- Check Apps Script console for errors (Extensions → Apps Script → Executions)
- Ensure all scripts are saved successfully
- Verify no naming conflicts between scripts

---

## 🎨 Customization

### Change Menu Names:
Edit the master `onOpen()` function in **Sales Specials script** (lines 64-84):
```javascript
ui.createMenu('Sales Specials Tools')  // Change this
ui.createMenu('Service Specials')      // Or this
ui.createMenu('Pre-Owned Specials')    // Or this
```

### Change Sheet Names:
**Service Specials**: Update lines 209 and 267 in Service Specials script:
```javascript
const sheet = ss.getSheetByName("Your Custom Name");
```

**Sales Specials**: Update your Sales Specials script's sheet references

### Change Snippet Names:
**Service Specials**: Update line 246 in Service Specials script:
```javascript
const result = updateServiceSnippetInCustomerIO(workspace.apiKey, 'Your-Custom-Snippet-Name', snippet);
```

### Add More Workspaces:
Add entries to the workspace config arrays:
- `WORKSPACES_CONFIG` in Sales Specials script
- `SERVICE_WORKSPACES_CONFIG` in Service Specials script

---

## 🔒 Security

- API keys are stored in the script (not visible in the sheet)
- Only authorized Google accounts with sheet access can run the script
- Customer.io API requires valid Bearer token authentication

---

## 📧 Support

For issues or questions:
1. Check the Apps Script **Execution log** (Extensions → Apps Script → Executions)
2. Review error messages in the dialog boxes
3. Verify your CSV data matches the expected format
