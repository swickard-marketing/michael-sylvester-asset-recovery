/**
 * ===================================================================
 * Pre-Owned Specials Automation - Google Apps Script
 * ===================================================================
 *
 * This script provides automation for Pre-Owned vehicle inventory:
 * 1. Sync from FTP - Triggers n8n webhook to pull fresh inventory from Reynolds FTP
 * 2. Upload to Customer.io - Reads sheet data and uploads to Customer.io collections
 * 3. Workspace Management - Upload to single or all Customer.io workspaces
 *
 * Installation:
 * 1. Open your Google Sheet: "Pre-Owned Specials Automation"
 * 2. Extensions → Apps Script
 * 3. Paste this code
 * 4. Configure WORKSPACES_CONFIG array below
 * 5. Set Script Properties:
 *    - N8N_WEBHOOK_URL: Your n8n webhook URL
 *    - CUSTOMERIO_API_KEY: Your Customer.io App API key
 * 6. Save and authorize
 *
 * ===================================================================
 */

// ===================================================================
// WORKSPACES CONFIGURATION
// ===================================================================

/**
 * Configure your Customer.io workspaces (collections) here
 * Each workspace represents a different dealer group or campaign
 */
const WORKSPACES_CONFIG = [
  {
    name: 'swickard_luxury',
    displayName: 'Swickard Luxury Brands',
    collectionId: 'YOUR_COLLECTION_ID_1',
    description: 'Audi, BMW, Mercedes, Porsche, Land Rover',
    enabled: true
  },
  {
    name: 'swickard_volume',
    displayName: 'Swickard Volume Brands',
    collectionId: 'YOUR_COLLECTION_ID_2',
    description: 'Toyota, Lexus, Crown',
    enabled: true
  },
  {
    name: 'all_dealers',
    displayName: 'All Dealers Combined',
    collectionId: 'YOUR_COLLECTION_ID_3',
    description: 'Combined inventory for all dealers',
    enabled: true
  }
  // Add more workspaces as needed
];

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

    // Sheet configuration
    sheetName: 'Pre-Owned Specials Automation',

    // Data ranges
    vehicleDataRange: 'A2:AJ', // Vehicle data columns (A-AJ = 36 fields)
    stockIncludeColumn: 'AA', // Stock numbers to include
    stockExcludeColumn: 'AB' // Stock numbers to exclude
  };
}

/**
 * Formats workspace name for display
 */
function formatWorkspaceName(name) {
  return name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
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
    .addSeparator()
    .addSubMenu(ui.createMenu('☁️ Upload to Customer.io')
      .addItem('📤 Upload to Single Workspace', 'showWorkspaceSelectionDialog')
      .addItem('🔄 Upload to All Workspaces', 'updateAllWorkspaces'))
    .addSeparator()
    .addItem('⚙️ Configure Workspaces', 'showConfigDialog')
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
               'The workflow will:\\n' +
               '• Download 35 CSV files from Reynolds FTP\\n' +
               '• Filter ~2,470 vehicles to ~200-500 specials\\n' +
               '• Transform to Customer.io format\\n' +
               '• Update this sheet in 55-70 seconds\\n\\n' +
               'Refresh the sheet to see new data!',
               ui.ButtonSet.OK);

      logEvent('FTP_SYNC', 'FTP sync triggered successfully', { statusCode: statusCode });
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

    logEvent('FTP_SYNC_ERROR', 'FTP sync failed', { error: error.message });
  }
}

// ===================================================================
// FUNCTION 2: WORKSPACE SELECTION DIALOG
// ===================================================================

/**
 * Shows a dialog for the user to select a single workspace to update
 */
function showWorkspaceSelectionDialog() {
  const config = getConfig();

  // Validate API configuration
  if (!config.customerioApiKey || config.customerioApiKey === 'YOUR_API_KEY_HERE') {
    const ui = SpreadsheetApp.getUi();
    ui.alert('⚠️ Configuration Error',
             'Please configure Customer.io API settings in Script Properties first:\\n\\n' +
             '• CUSTOMERIO_API_KEY\\n\\n' +
             'Go to: Project Settings → Script Properties → Add Property',
             ui.ButtonSet.OK);
    return;
  }

  // Get enabled workspaces
  const enabledWorkspaces = WORKSPACES_CONFIG.filter(w => w.enabled);

  if (enabledWorkspaces.length === 0) {
    const ui = SpreadsheetApp.getUi();
    ui.alert('⚠️ No Workspaces',
             'No workspaces are configured or enabled.\\n\\n' +
             'Please edit WORKSPACES_CONFIG in the script.',
             ui.ButtonSet.OK);
    return;
  }

  // Get sheet data info
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(config.sheetName);
  const lastModified = new Date(sheet.getParent().getLastUpdated()).toLocaleString();

  // Count vehicles
  const dataRange = sheet.getRange(config.vehicleDataRange);
  const values = dataRange.getValues();
  const vehicleCount = values.filter(row => row[1] && row[1].toString().trim() !== '').length;

  // Build workspace options HTML
  const workspaceOptions = enabledWorkspaces.map(w =>
    `<option value="${w.name}">${w.displayName} - ${w.description}</option>`
  ).join('');

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 10px; }
      #status { margin-top: 10px; font-weight: bold; color: #4CAF50; }
      #error { margin-top: 10px; font-weight: bold; color: #F44336; }
      .loader {
        display: none;
        margin-top: 10px;
        border: 4px solid #f3f3f3;
        border-radius: 50%;
        border-top: 4px solid #3498db;
        width: 20px;
        height: 20px;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      select { width: 100%; padding: 8px; margin: 10px 0; font-size: 14px; }
      button {
        padding: 10px 20px;
        margin: 5px;
        font-size: 14px;
        cursor: pointer;
      }
      button:disabled { opacity: 0.5; cursor: not-allowed; }
      .info { background: #e3f2fd; padding: 10px; margin: 10px 0; border-radius: 4px; font-size: 12px; }
      .sync-info {
        background: #e8f5e9;
        padding: 12px;
        margin-bottom: 15px;
        border-radius: 4px;
        border-left: 4px solid #4CAF50;
      }
      .sync-info strong { color: #2e7d32; }
    </style>

    <h2>📤 Upload to Customer.io Workspace</h2>

    <div class="sync-info">
      <strong>📅 Last Synced:</strong> ${lastModified}<br>
      <strong>📊 Vehicles Available:</strong> ${vehicleCount} vehicles
    </div>

    <p>Select a workspace to upload vehicle inventory:</p>

    <div>
      <select id="workspace-select">
        ${workspaceOptions}
      </select>
    </div>

    <div class="info">
      <strong>ℹ️ What this does:</strong><br>
      • Reads vehicle data from this sheet (columns A-AJ)<br>
      • Uploads to the selected Customer.io collection<br>
      • Replaces existing data in that collection<br>
      • Takes 3-5 seconds for ~200-500 vehicles
    </div>

    <div>
      <button onclick="runUpdate()" id="update-btn">Upload to Selected Workspace</button>
      <button onclick="google.script.host.close()">Cancel</button>
    </div>

    <div class="loader" id="loader"></div>
    <div id="status"></div>
    <div id="error"></div>

    <script>
      function runUpdate() {
        var select = document.getElementById('workspace-select');
        var selectedWorkspace = select.options[select.selectedIndex].value;

        document.getElementById('update-btn').disabled = true;
        document.getElementById('loader').style.display = 'block';
        document.getElementById('status').innerText = '';
        document.getElementById('error').innerText = '';

        google.script.run
          .withSuccessHandler(function(result) {
            document.getElementById('loader').style.display = 'none';
            document.getElementById('status').innerText = result;
            setTimeout(function(){ google.script.host.close(); }, 3000);
          })
          .withFailureHandler(function(error) {
            document.getElementById('loader').style.display = 'none';
            document.getElementById('error').innerText = 'Error: ' + error.message;
            document.getElementById('update-btn').disabled = false;
          })
          .processSingleWorkspaceUpdate(selectedWorkspace);
      }
    </script>
  `).setWidth(500).setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(html, 'Upload to Workspace');
}

// ===================================================================
// FUNCTION 3: PROCESS SINGLE WORKSPACE UPDATE
// ===================================================================

/**
 * Uploads vehicle data to a single selected workspace
 *
 * @param {string} workspaceName - The name of the workspace to update
 * @returns {string} Success message
 */
function processSingleWorkspaceUpdate(workspaceName) {
  const config = getConfig();
  const workspace = WORKSPACES_CONFIG.find(w => w.name === workspaceName);

  if (!workspace) {
    throw new Error(`Workspace "${workspaceName}" not found in configuration`);
  }

  if (!workspace.enabled) {
    throw new Error(`Workspace "${workspaceName}" is disabled`);
  }

  // Read vehicle data from sheet
  const vehicles = readVehicleDataFromSheet(config);

  if (vehicles.length === 0) {
    throw new Error('No vehicles found in the sheet. Please run "Sync from FTP" first.');
  }

  // Upload to Customer.io
  const result = uploadVehiclesToCustomerIO(vehicles, workspace.collectionId, config);

  if (!result.success) {
    throw new Error(result.error);
  }

  const message = `✅ Successfully uploaded ${vehicles.length} vehicles to "${workspace.displayName}"!`;

  logEvent('WORKSPACE_UPDATE', `Updated workspace: ${workspaceName}`, {
    workspace: workspaceName,
    vehicleCount: vehicles.length,
    collectionId: workspace.collectionId
  });

  return message;
}

// ===================================================================
// FUNCTION 4: UPDATE ALL WORKSPACES
// ===================================================================

/**
 * Uploads vehicle data to all enabled workspaces
 */
function updateAllWorkspaces() {
  const config = getConfig();
  const ui = SpreadsheetApp.getUi();

  // Validate API configuration
  if (!config.customerioApiKey || config.customerioApiKey === 'YOUR_API_KEY_HERE') {
    ui.alert('⚠️ Configuration Error',
             'Please configure Customer.io API settings in Script Properties first:\\n\\n' +
             '• CUSTOMERIO_API_KEY\\n\\n' +
             'Go to: Project Settings → Script Properties → Add Property',
             ui.ButtonSet.OK);
    return;
  }

  const enabledWorkspaces = WORKSPACES_CONFIG.filter(w => w.enabled);

  if (enabledWorkspaces.length === 0) {
    ui.alert('⚠️ No Workspaces',
             'No workspaces are configured or enabled.\\n\\n' +
             'Please edit WORKSPACES_CONFIG in the script.',
             ui.ButtonSet.OK);
    return;
  }

  // Get last sync info
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(config.sheetName);
  const lastModified = new Date(sheet.getParent().getLastUpdated()).toLocaleString();

  // Confirm update
  const workspaceList = enabledWorkspaces.map(w => `• ${w.displayName}`).join('\\n');
  const result = ui.alert(
    '🔄 Upload to All Workspaces',
    `Last Synced: ${lastModified}\\n\\n` +
    `This will upload vehicle data to ${enabledWorkspaces.length} workspaces:\\n\\n` +
    workspaceList + '\\n\\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );

  if (result !== ui.Button.YES) {
    return;
  }

  try {
    // Read vehicle data once
    const vehicles = readVehicleDataFromSheet(config);

    if (vehicles.length === 0) {
      ui.alert('⚠️ No Data',
               'No vehicles found in the sheet.\\n\\n' +
               'Please run "Sync from FTP" first.',
               ui.ButtonSet.OK);
      return;
    }

    // Upload to each workspace
    const results = [];
    let successCount = 0;
    let failureCount = 0;

    for (const workspace of enabledWorkspaces) {
      try {
        const uploadResult = uploadVehiclesToCustomerIO(vehicles, workspace.collectionId, config);

        if (uploadResult.success) {
          results.push(`✅ ${workspace.displayName}: ${vehicles.length} vehicles`);
          successCount++;
        } else {
          results.push(`❌ ${workspace.displayName}: ${uploadResult.error}`);
          failureCount++;
        }
      } catch (error) {
        results.push(`❌ ${workspace.displayName}: ${error.message}`);
        failureCount++;
      }
    }

    // Show results
    const summary = `Uploaded to ${successCount}/${enabledWorkspaces.length} workspaces:\\n\\n` +
                    results.join('\\n');

    ui.alert('✅ Upload Complete', summary, ui.ButtonSet.OK);

    logEvent('ALL_WORKSPACES_UPDATE', 'Updated all workspaces', {
      total: enabledWorkspaces.length,
      success: successCount,
      failure: failureCount,
      vehicleCount: vehicles.length
    });

  } catch (error) {
    Logger.log(`Error updating all workspaces: ${error}`);
    ui.alert('❌ Upload Failed',
             'Could not upload to all workspaces.\\n\\n' +
             `Error: ${error.message}`,
             ui.ButtonSet.OK);

    logEvent('ALL_WORKSPACES_ERROR', 'Failed to update all workspaces', { error: error.message });
  }
}

// ===================================================================
// HELPER FUNCTIONS
// ===================================================================

/**
 * Reads vehicle data from the Google Sheet
 *
 * @param {Object} config - Configuration object
 * @returns {Array} Array of vehicle objects
 */
function readVehicleDataFromSheet(config) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(config.sheetName);

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

  return vehicles;
}

/**
 * Helper function to upload vehicles to Customer.io API
 *
 * @param {Array} vehicles - Array of vehicle objects
 * @param {string} collectionId - Customer.io collection ID
 * @param {Object} config - Configuration object
 * @returns {Object} Result object with success flag and error message
 */
function uploadVehiclesToCustomerIO(vehicles, collectionId, config) {
  try {
    // Prepare Customer.io API request
    const url = `https://api.customer.io/v1/api/collections/${collectionId}/data`;

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
 * Shows configuration dialog for setting up API keys and workspaces
 */
function showConfigDialog() {
  const config = getConfig();
  const ui = SpreadsheetApp.getUi();

  // Build workspace table
  const workspaceRows = WORKSPACES_CONFIG.map(w =>
    `<tr>
      <td>${w.displayName}</td>
      <td>${w.collectionId}</td>
      <td>${w.enabled ? '✅ Enabled' : '❌ Disabled'}</td>
    </tr>`
  ).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 10px;">
      <h3>⚙️ Configuration</h3>

      <h4>API Settings:</h4>
      <table border="1" cellpadding="5" cellspacing="0" style="width: 100%; border-collapse: collapse;">
        <tr>
          <th>Property</th>
          <th>Value</th>
        </tr>
        <tr>
          <td>N8N_WEBHOOK_URL</td>
          <td style="word-break: break-all; font-size: 11px;">${config.n8nWebhookUrl}</td>
        </tr>
        <tr>
          <td>CUSTOMERIO_API_KEY</td>
          <td>${config.customerioApiKey.substring(0, 20)}...</td>
        </tr>
        <tr>
          <td>CUSTOMERIO_SITE_ID</td>
          <td>${config.customerioSiteId}</td>
        </tr>
      </table>

      <h4>Configured Workspaces:</h4>
      <table border="1" cellpadding="5" cellspacing="0" style="width: 100%; border-collapse: collapse;">
        <tr>
          <th>Workspace</th>
          <th>Collection ID</th>
          <th>Status</th>
        </tr>
        ${workspaceRows}
      </table>

      <h4>To Update Settings:</h4>
      <ol style="font-size: 12px;">
        <li>Go to <strong>Extensions → Apps Script</strong></li>
        <li>For API settings: Click <strong>Project Settings</strong> (⚙️ icon) → <strong>Script Properties</strong></li>
        <li>For workspaces: Edit <code>WORKSPACES_CONFIG</code> array in the script</li>
        <li>Save changes</li>
      </ol>

      <h4>Required Script Properties:</h4>
      <ul style="font-size: 12px;">
        <li><code>N8N_WEBHOOK_URL</code> - Your n8n webhook URL</li>
        <li><code>CUSTOMERIO_API_KEY</code> - Customer.io App API Key</li>
        <li><code>CUSTOMERIO_SITE_ID</code> - Customer.io Site ID (optional)</li>
      </ul>
    </div>
  `;

  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(700)
    .setHeight(600);

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

  // Build workspace status
  const enabledWorkspaces = WORKSPACES_CONFIG.filter(w => w.enabled);
  const workspaceStatus = enabledWorkspaces.map(w => `<li>${w.displayName} (${w.collectionId})</li>`).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 10px;">
      <h3>📊 Sync Status</h3>

      <div style="background: #4CAF50; color: white; padding: 15px; margin-bottom: 20px; text-align: center; border-radius: 6px;">
        <h3 style="margin: 0 0 5px 0; color: white; font-size: 16px;">Last Updated</h3>
        <div style="font-size: 18px; font-weight: bold;">${lastModified}</div>
      </div>

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
          <td>Enabled Workspaces</td>
          <td>${enabledWorkspaces.length} of ${WORKSPACES_CONFIG.length}</td>
        </tr>
      </table>

      <h4>Enabled Workspaces:</h4>
      <ul>
        ${workspaceStatus}
      </ul>

      <h4>Expected Data:</h4>
      <ul style="font-size: 12px;">
        <li>After FTP Sync: ~200-500 vehicles</li>
        <li>Filtered from: ~2,470 raw vehicles</li>
        <li>Source: 35 dealer CSV files</li>
        <li>Fields: 36 Customer.io-ready fields</li>
      </ul>

      <h4>Stock Filtering:</h4>
      <ul style="font-size: 12px;">
        <li><strong>Include List (AA):</strong> If not empty, only these stocks are used</li>
        <li><strong>Exclude List (AB):</strong> Always removes these stocks (highest priority)</li>
        <li><strong>Minimum:</strong> 12 vehicles guaranteed (adds more if needed)</li>
      </ul>
    </div>
  `;

  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(600)
    .setHeight(550);

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
