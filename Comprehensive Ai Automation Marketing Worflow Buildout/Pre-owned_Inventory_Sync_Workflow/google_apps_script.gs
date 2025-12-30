/**
 * ===================================================================
 * Pre-Owned Specials Automation - Google Apps Script
 * ===================================================================
 *
 * This script provides two main functions:
 * 1. Sync from FTP - Triggers n8n webhook to pull fresh inventory from Reynolds FTP
 * 2. Upload to Customer.io - Reads sheet data and uploads to Customer.io collections
 *
 * Installation:
 * 1. Open your Google Sheet: "Pre-Owned Specials Automation"
 * 2. Extensions → Apps Script
 * 3. Paste this code
 * 4. Set Script Properties:
 *    - N8N_WEBHOOK_URL: Your n8n webhook URL
 *    - CUSTOMERIO_API_KEY: Your Customer.io App API key
 *    - CUSTOMERIO_COLLECTION_ID: Your collection ID
 * 5. Save and authorize
 * 6. Create custom menu or buttons
 *
 * ===================================================================
 */

// ===================================================================
// CONFIGURATION
// ===================================================================

/**
 * Gets configuration from Script Properties
 * Set these via: Project Settings → Script Properties
 */
function getConfig() {
  const props = PropertiesService.getScriptProperties();

  return {
    // n8n webhook URL for FTP sync trigger
    n8nWebhookUrl: props.getProperty('N8N_WEBHOOK_URL') || 'YOUR_WEBHOOK_URL_HERE',

    // Customer.io API configuration
    customerioApiKey: props.getProperty('CUSTOMERIO_API_KEY') || 'YOUR_API_KEY_HERE',
    customerioSiteId: props.getProperty('CUSTOMERIO_SITE_ID') || 'YOUR_SITE_ID_HERE',
    customerioCollectionId: props.getProperty('CUSTOMERIO_COLLECTION_ID') || 'YOUR_COLLECTION_ID_HERE',

    // Sheet configuration
    sheetName: 'Pre-Owned Specials Automation',

    // Data ranges
    vehicleDataRange: 'A2:AJ', // Vehicle data columns (A-AJ = 36 fields)
    stockIncludeColumn: 'AA', // Stock numbers to include
    stockExcludeColumn: 'AB' // Stock numbers to exclude
  };
}

// ===================================================================
// CUSTOM MENU
// ===================================================================

/**
 * Creates custom menu when spreadsheet opens
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();

  ui.createMenu('🚀 Inventory Sync')
    .addItem('📁 Sync from FTP', 'syncFromFTP')
    .addItem('☁️ Upload to Customer.io', 'uploadToCustomerIO')
    .addSeparator()
    .addItem('⚙️ Configure API Keys', 'showConfigDialog')
    .addItem('📊 View Sync Status', 'showSyncStatus')
    .addToUi();
}

// ===================================================================
// FUNCTION 1: SYNC FROM FTP (Trigger n8n Webhook)
// ===================================================================

/**
 * Triggers the n8n workflow to sync fresh data from Reynolds FTP
 *
 * This function:
 * 1. Calls the n8n webhook URL
 * 2. n8n downloads CSVs from FTP
 * 3. n8n filters and transforms data
 * 4. n8n uploads to this Google Sheet
 *
 * Expected time: 55-70 seconds
 */
function syncFromFTP() {
  const config = getConfig();
  const ui = SpreadsheetApp.getUi();

  // Validate webhook URL
  if (!config.n8nWebhookUrl || config.n8nWebhookUrl === 'YOUR_WEBHOOK_URL_HERE') {
    ui.alert('⚠️ Configuration Error',
             'Please configure N8N_WEBHOOK_URL in Script Properties first.\\n\\n' +
             'Go to: Project Settings → Script Properties → Add Property',
             ui.ButtonSet.OK);
    return;
  }

  // Show loading message
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(config.sheetName);
  sheet.getRange('A1').setValue('⏳ Syncing from FTP... (55-70 seconds)');
  SpreadsheetApp.flush();

  try {
    // Call n8n webhook
    const response = UrlFetchApp.fetch(config.n8nWebhookUrl, {
      method: 'POST',
      contentType: 'application/json',
      muteHttpExceptions: true,
      headers: {
        'User-Agent': 'Google-Apps-Script/PreOwned-Specials-Sync'
      }
    });

    const statusCode = response.getResponseCode();

    if (statusCode === 200 || statusCode === 201) {
      // Success!
      sheet.getRange('A1').setValue('Stock #');
      ui.alert('✅ Sync Started!',
               'FTP sync has been triggered successfully.\\n\\n' +
               'The workflow will:' +
               '\\n• Download 35 CSV files from Reynolds FTP' +
               '\\n• Filter ~2,470 vehicles to ~200-500 specials' +
               '\\n• Transform to Customer.io format' +
               '\\n• Update this sheet in 55-70 seconds' +
               '\\n\\nRefresh the sheet to see new data!',
               ui.ButtonSet.OK);
    } else {
      throw new Error(`Webhook returned status ${statusCode}: ${response.getContentText()}`);
    }

  } catch (error) {
    sheet.getRange('A1').setValue('Stock #');
    Logger.log(`Error triggering FTP sync: ${error}`);
    ui.alert('❌ Sync Failed',
             'Could not trigger FTP sync.\\n\\n' +
             `Error: ${error.message}\\n\\n` +
             'Check:\\n' +
             '• N8N_WEBHOOK_URL is correct\\n' +
             '• n8n workflow is activated\\n' +
             '• Webhook URL is accessible',
             ui.ButtonSet.OK);
  }
}

// ===================================================================
// FUNCTION 2: UPLOAD TO CUSTOMER.IO
// ===================================================================

/**
 * Uploads vehicle data from Google Sheet to Customer.io collection
 *
 * This function:
 * 1. Reads vehicle data from columns A-AJ
 * 2. Formats data for Customer.io API
 * 3. Uploads to specified collection
 * 4. Shows success/failure message
 *
 * Expected time: 3-5 seconds for ~200-500 vehicles
 */
function uploadToCustomerIO() {
  const config = getConfig();
  const ui = SpreadsheetApp.getUi();

  // Validate API configuration
  if (!config.customerioApiKey || config.customerioApiKey === 'YOUR_API_KEY_HERE') {
    ui.alert('⚠️ Configuration Error',
             'Please configure Customer.io API settings in Script Properties first:\\n\\n' +
             '• CUSTOMERIO_API_KEY\\n' +
             '• CUSTOMERIO_SITE_ID\\n' +
             '• CUSTOMERIO_COLLECTION_ID\\n\\n' +
             'Go to: Project Settings → Script Properties → Add Property',
             ui.ButtonSet.OK);
    return;
  }

  // Confirm upload
  const result = ui.alert(
    '☁️ Upload to Customer.io',
    'This will upload all vehicle data from this sheet to Customer.io.\\n\\n' +
    `Collection ID: ${config.customerioCollectionId}\\n\\n` +
    'Continue?',
    ui.ButtonSet.YES_NO
  );

  if (result !== ui.Button.YES) {
    return;
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(config.sheetName);

  try {
    // Read vehicle data
    const dataRange = sheet.getRange(config.vehicleDataRange);
    const values = dataRange.getValues();

    // Get headers from row 1
    const headers = sheet.getRange('A1:AJ1').getValues()[0];

    // Filter out empty rows and convert to objects
    const vehicles = [];
    for (let i = 0; i < values.length; i++) {
      const row = values[i];

      // Skip empty rows (check if Stock field is empty)
      if (!row[1] || row[1].toString().trim() === '') {
        continue;
      }

      // Create vehicle object
      const vehicle = {};
      for (let j = 0; j < headers.length; j++) {
        if (headers[j] && row[j] !== '') {
          vehicle[headers[j]] = row[j];
        }
      }

      vehicles.push(vehicle);
    }

    if (vehicles.length === 0) {
      ui.alert('⚠️ No Data',
               'No vehicles found in the sheet.\\n\\n' +
               'Please run "Sync from FTP" first.',
               ui.ButtonSet.OK);
      return;
    }

    // Upload to Customer.io
    const uploadResult = uploadVehiclesToCustomerIO(vehicles, config);

    if (uploadResult.success) {
      ui.alert('✅ Upload Successful!',
               `Successfully uploaded ${vehicles.length} vehicles to Customer.io!\\n\\n` +
               `Collection ID: ${config.customerioCollectionId}\\n` +
               `Timestamp: ${new Date().toLocaleString()}\\n\\n` +
               'Vehicles are now available in your Customer.io campaigns.',
               ui.ButtonSet.OK);
    } else {
      throw new Error(uploadResult.error);
    }

  } catch (error) {
    Logger.log(`Error uploading to Customer.io: ${error}`);
    ui.alert('❌ Upload Failed',
             'Could not upload to Customer.io.\\n\\n' +
             `Error: ${error.message}\\n\\n` +
             'Check:\\n' +
             '• API Key is correct\\n' +
             '• Collection ID exists\\n' +
             '• API permissions are set\\n' +
             '• Collection schema matches sheet fields',
             ui.ButtonSet.OK);
  }
}

/**
 * Helper function to upload vehicles to Customer.io API
 *
 * @param {Array} vehicles - Array of vehicle objects
 * @param {Object} config - Configuration object
 * @returns {Object} Result object with success flag and error message
 */
function uploadVehiclesToCustomerIO(vehicles, config) {
  try {
    // Prepare Customer.io API request
    const url = `https://api.customer.io/v1/api/collections/${config.customerioCollectionId}/data`;

    // Format payload according to Customer.io requirements
    const payload = {
      data: vehicles.map(vehicle => {
        // Ensure Stock is used as the unique identifier
        return {
          id: vehicle.Stock || vehicle.VIN, // Use Stock as primary ID, fallback to VIN
          ...vehicle
        };
      })
    };

    // Make API request
    const response = UrlFetchApp.fetch(url, {
      method: 'PUT', // Customer.io uses PUT to replace collection data
      contentType: 'application/json',
      headers: {
        'Authorization': `Bearer ${config.customerioApiKey}`,
        'User-Agent': 'Google-Apps-Script/PreOwned-Specials-Upload'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    const statusCode = response.getResponseCode();
    const responseText = response.getContentText();

    if (statusCode >= 200 && statusCode < 300) {
      return {
        success: true,
        vehicleCount: vehicles.length
      };
    } else {
      return {
        success: false,
        error: `API returned status ${statusCode}: ${responseText}`
      };
    }

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// ===================================================================
// CONFIGURATION DIALOG
// ===================================================================

/**
 * Shows configuration dialog for setting up API keys
 */
function showConfigDialog() {
  const config = getConfig();
  const ui = SpreadsheetApp.getUi();

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 10px;">
      <h3>⚙️ Configuration</h3>

      <p><strong>Current Settings:</strong></p>

      <table border="1" cellpadding="5" cellspacing="0" style="width: 100%; border-collapse: collapse;">
        <tr>
          <th>Property</th>
          <th>Value</th>
        </tr>
        <tr>
          <td>N8N_WEBHOOK_URL</td>
          <td style="word-break: break-all;">${config.n8nWebhookUrl}</td>
        </tr>
        <tr>
          <td>CUSTOMERIO_API_KEY</td>
          <td>${config.customerioApiKey.substring(0, 20)}...</td>
        </tr>
        <tr>
          <td>CUSTOMERIO_SITE_ID</td>
          <td>${config.customerioSiteId}</td>
        </tr>
        <tr>
          <td>CUSTOMERIO_COLLECTION_ID</td>
          <td>${config.customerioCollectionId}</td>
        </tr>
      </table>

      <p><strong>To Update Settings:</strong></p>
      <ol>
        <li>Go to <strong>Extensions → Apps Script</strong></li>
        <li>Click <strong>Project Settings</strong> (⚙️ icon)</li>
        <li>Scroll to <strong>Script Properties</strong></li>
        <li>Add or edit properties</li>
        <li>Save</li>
      </ol>

      <h4>Required Properties:</h4>
      <ul>
        <li><code>N8N_WEBHOOK_URL</code> - Your n8n webhook URL (get from n8n webhook node)</li>
        <li><code>CUSTOMERIO_API_KEY</code> - Customer.io App API Key</li>
        <li><code>CUSTOMERIO_SITE_ID</code> - Customer.io Site ID</li>
        <li><code>CUSTOMERIO_COLLECTION_ID</code> - Target collection ID</li>
      </ul>
    </div>
  `;

  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(600)
    .setHeight(500);

  ui.showModalDialog(htmlOutput, 'Configuration');
}

// ===================================================================
// SYNC STATUS DIALOG
// ===================================================================

/**
 * Shows sync status and statistics
 */
function showSyncStatus() {
  const config = getConfig();
  const ui = SpreadsheetApp.getUi();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(config.sheetName);

  // Count vehicles in sheet
  const dataRange = sheet.getRange(config.vehicleDataRange);
  const values = dataRange.getValues();
  const vehicleCount = values.filter(row => row[1] && row[1].toString().trim() !== '').length;

  // Count stock filters
  let includeCount = 0;
  let excludeCount = 0;

  try {
    const includeRange = sheet.getRange(`${config.stockIncludeColumn}2:${config.stockIncludeColumn}`);
    const includeValues = includeRange.getValues();
    includeCount = includeValues.filter(row => row[0] && row[0].toString().trim() !== '').length;

    const excludeRange = sheet.getRange(`${config.stockExcludeColumn}2:${config.stockExcludeColumn}`);
    const excludeValues = excludeRange.getValues();
    excludeCount = excludeValues.filter(row => row[0] && row[0].toString().trim() !== '').length;
  } catch (e) {
    // Ignore errors reading filter columns
  }

  // Get last modified time
  const lastModified = new Date(sheet.getParent().getLastUpdated()).toLocaleString();

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 10px;">
      <h3>📊 Sync Status</h3>

      <table border="1" cellpadding="5" cellspacing="0" style="width: 100%; border-collapse: collapse;">
        <tr>
          <th>Metric</th>
          <th>Value</th>
        </tr>
        <tr>
          <td>Vehicles in Sheet</td>
          <td><strong>${vehicleCount}</strong></td>
        </tr>
        <tr>
          <td>Stock Include List (AA)</td>
          <td>${includeCount} stock numbers</td>
        </tr>
        <tr>
          <td>Stock Exclude List (AB)</td>
          <td>${excludeCount} stock numbers</td>
        </tr>
        <tr>
          <td>Last Modified</td>
          <td>${lastModified}</td>
        </tr>
        <tr>
          <td>Sheet Name</td>
          <td>${config.sheetName}</td>
        </tr>
      </table>

      <h4>Expected Data:</h4>
      <ul>
        <li>After FTP Sync: ~200-500 vehicles</li>
        <li>Filtered from: ~2,470 raw vehicles</li>
        <li>Source: 35 dealer CSV files</li>
        <li>Fields: 36 Customer.io-ready fields</li>
      </ul>

      <h4>Stock Filtering:</h4>
      <ul>
        <li><strong>Include List (AA):</strong> If not empty, only these stocks are used</li>
        <li><strong>Exclude List (AB):</strong> Always removes these stocks (highest priority)</li>
        <li><strong>Minimum:</strong> 12 vehicles guaranteed (adds more if needed)</li>
      </ul>
    </div>
  `;

  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(600)
    .setHeight(500);

  ui.showModalDialog(htmlOutput, 'Sync Status');
}

// ===================================================================
// UTILITY FUNCTIONS
// ===================================================================

/**
 * Formats a date for logging
 */
function formatDateTime(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
}

/**
 * Logs an event to a separate log sheet (optional)
 */
function logEvent(eventType, message, data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let logSheet = ss.getSheetByName('Sync Log');

    // Create log sheet if it doesn't exist
    if (!logSheet) {
      logSheet = ss.insertSheet('Sync Log');
      logSheet.getRange('A1:D1').setValues([['Timestamp', 'Event Type', 'Message', 'Data']]);
      logSheet.getRange('A1:D1').setFontWeight('bold');
    }

    // Add log entry
    logSheet.appendRow([
      formatDateTime(new Date()),
      eventType,
      message,
      JSON.stringify(data || {})
    ]);

  } catch (error) {
    // Silently fail if logging fails
    Logger.log(`Could not write to log sheet: ${error.message}`);
  }
}
