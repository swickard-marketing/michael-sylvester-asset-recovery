/**
 * ===================================================================
 * Pre-Owned Specials Automation - Google Apps Script (Per-Dealer Upload)
 * ===================================================================
 *
 * This script replicates the Python script's per-dealer upload functionality:
 * 1. Sync from FTP - Triggers n8n webhook to pull fresh inventory
 * 2. Upload to Customer.io - Groups vehicles by Dealer_Name and uploads each dealer
 *    to their specific collection with their specific API key
 *
 * Installation:
 * 1. Open your Google Sheet: "Pre-Owned Specials Automation"
 * 2. Extensions → Apps Script
 * 3. Paste this code
 * 4. Set Script Properties:
 *    - N8N_WEBHOOK_URL: Your n8n webhook URL
 * 5. Save and authorize
 *
 * ===================================================================
 */

// ===================================================================
// DEALERS CONFIGURATION (from .env file)
// ===================================================================

/**
 * All dealers with their Customer.io API keys and collection IDs
 * This matches the Python script's environment variables exactly
 */
const DEALERS_CONFIG = [
  // Acura
  { name: "Acura Thousand Oaks", apiKey: "1fd2ddd8d2640a15a1aa8fcb62cc4433", collectionId: "9" },

  // Audi
  { name: "Audi Oakland", apiKey: "5e38a490a4cb75da215ff8e077916311", collectionId: "12" },
  { name: "Audi Palo Alto", apiKey: "e7295eb15fb899b12b8de4d29ce68dd1", collectionId: "2" },
  { name: "Audi Anchorage", apiKey: "2ae0afa8d034d1a81bfc4b93ab95dd0b", collectionId: "1" },
  { name: "Audi Bellingham", apiKey: "6c4af2e86daa1c8cf730489c4b41db2b", collectionId: "1" },

  // BMW
  { name: "BMW of Eugene", apiKey: "75c00432a4fb3c5f086ae2a1ef4c1872", collectionId: "2" },
  { name: "BMW of Lynnwood", apiKey: "629fb75ec206c73db80646ebf1e24a44", collectionId: "2" },
  { name: "BMW of Portland", apiKey: "d32ee445bda602b49ad1ed6dfd503f9f", collectionId: "1" },

  // Toyota / Lexus / Crown
  { name: "Crown Toyota", apiKey: "f32f834fd0b71b763ebcda51ae77d0ae", collectionId: "1" },
  { name: "Gresham Toyota", apiKey: "cf2e4819a8f20ddddc359b0463a51d3c", collectionId: "1" },
  { name: "Swickard Toyota", apiKey: "7e9e5cf9c12188925ddce4f921270f90", collectionId: "1" },
  { name: "Swickard Toyota 101", apiKey: "02ca351088bc8e9a8b664688dbf0cf6d", collectionId: "1" },
  { name: "Lexus of Fremont", apiKey: "7145206bdac834c98fe1ea754dc29d3c", collectionId: "1" },
  { name: "Lexus of Thousand Oaks", apiKey: "46806ce450ff12a10dd1987bb4ca7403", collectionId: "1" },

  // Land Rover / Jaguar
  { name: "Land Rover San Francisco", apiKey: "7508bfc5d5ac908875c802bb62435f7a", collectionId: "1" },
  { name: "Land Rover Redwood City", apiKey: "235a9de44560b1c718e34e3e37b98d61", collectionId: "1" },
  { name: "Land Rover Thousand Oaks", apiKey: "777b6593ef5dfbc3780c58f40de87d35", collectionId: "1" },

  // Mercedes-Benz
  { name: "Mercedes-Benz of Anchorage", apiKey: "2630e6ae3e1136a5d778ae9f275fb99a", collectionId: "1" },
  { name: "Mercedes-Benz of Honolulu", apiKey: "7641f8a8d9ec3bb2b2abea426d33e95e", collectionId: "1" },
  { name: "Mercedes-Benz of Marin", apiKey: "15c4428085013edcf1a0194c22eff6ca", collectionId: "1" },
  { name: "Mercedes-Benz of Maui", apiKey: "a87ead97a30341a3c31af756e67b1274", collectionId: "1" },
  { name: "Mercedes-Benz of Palo Alto", apiKey: "f6ab8bf9e704c04a96a6e48e0ed2fe87", collectionId: "4" },
  { name: "Mercedes-Benz of Seattle", apiKey: "dba69f95292704439e259c36df6c57cf", collectionId: "1" },
  { name: "Mercedes-Benz of South Austin", apiKey: "0defa439f1ec505bd77ba34b02bb31dc", collectionId: "1" },
  { name: "Mercedes-Benz of Thousand Oaks", apiKey: "20899542d1142b2e6a0006bdccd87816", collectionId: "1" },
  { name: "Mercedes-Benz of Wilsonville", apiKey: "b48998b68625a96754ea225332628fc1", collectionId: "1" },

  // Porsche
  { name: "Porsche Anchorage", apiKey: "2ae0afa8d034d1a81bfc4b93ab95dd0b", collectionId: "1" },
  { name: "Porsche Seattle North", apiKey: "2ab0003f77ed82f935cc6152e867712a", collectionId: "10" },

  // Sprinter (uses Mercedes credentials)
  { name: "Sprinter Seattle", apiKey: "dba69f95292704439e259c36df6c57cf", collectionId: "1" },
  { name: "Sprinter Wilsonville", apiKey: "b48998b68625a96754ea225332628fc1", collectionId: "1" },

  // Swickard GM Brands
  { name: "Swickard Buick GMC Anchorage", apiKey: "4107c3fc1225eaf3434c1d9fa2cb2ad2", collectionId: "9" },
  { name: "Swickard Buick GMC of Thousand Oaks", apiKey: "06e5197f9d9a7119d4dc6cecf1bf9c22", collectionId: "9" },
  { name: "Swickard Cadillac Anchorage", apiKey: "4107c3fc1225eaf3434c1d9fa2cb2ad2", collectionId: "9" },
  { name: "Swickard Cadillac of Thousand Oaks", apiKey: "06e5197f9d9a7119d4dc6cecf1bf9c22", collectionId: "9" },
  { name: "Swickard Chevrolet Anchorage", apiKey: "4107c3fc1225eaf3434c1d9fa2cb2ad2", collectionId: "9" },
  { name: "Swickard Chevrolet of Thousand Oaks", apiKey: "171cad5c1236a99a77a08ae34003672b", collectionId: "2" },
  { name: "Swickard GMC of Palmer", apiKey: "63aed0dbc828a5a08123b8c2577b42ed", collectionId: "9" },

  // Honda
  { name: "Swickard Honda", apiKey: "d63203c05ac12287407cb911307f31c5", collectionId: "10" },
  { name: "Swickard Honda of Thousand Oaks", apiKey: "d82652ce3729849182cb06042536119e", collectionId: "10" },

  // Volkswagen
  { name: "Swickard Volkswagen of Anchorage", apiKey: "2ae0afa8d034d1a81bfc4b93ab95dd0b", collectionId: "1" },
  { name: "Volkswagen of Bellingham", apiKey: "6c4af2e86daa1c8cf730489c4b41db2b", collectionId: "1" },

  // Volvo
  { name: "Volvo Cars Bellevue", apiKey: "c04c3f9fee56dbe240f17ea4316211ac", collectionId: "1" },
  { name: "Volvo Cars Seattle", apiKey: "eb9e61ed54eb1c2ecb580d13cc7878c3", collectionId: "1" },
  { name: "Volvo Cars Southwest Houston", apiKey: "cf3d981ec2b6f96273f16f50513db495", collectionId: "1" }
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

    // Sheet configuration
    sheetName: 'Pre-Owned Specials Automation',

    // Data ranges
    vehicleDataRange: 'A2:AS', // Vehicle data columns (A-AS: vehicle data + subject lines)
    stockIncludeColumn: 'P', // Stock numbers to include (column P)
    stockExcludeColumn: 'Q' // Stock numbers to exclude (column Q)
  };
}

/**
 * Formats dealer name for display
 */
function formatDealerName(name) {
  return name;
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
      .addItem('📤 Upload Single Dealer', 'showDealerSelectionDialog')
      .addItem('🔄 Upload All Dealers', 'updateAllDealers'))
    .addSeparator()
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
             'Please configure N8N_WEBHOOK_URL in Script Properties first.\n\n' +
             'Go to: Project Settings → Script Properties → Add Property',
             ui.ButtonSet.OK);
    return;
  }

  // Show loading toast message (don't overwrite headers!)
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  SpreadsheetApp.getActiveSpreadsheet().toast(
    'Syncing from FTP... This will take 55-70 seconds',
    '⏳ Inventory Sync',
    30 // Show for 30 seconds
  );

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
      SpreadsheetApp.getActiveSpreadsheet().toast(
        'FTP sync triggered! Sheet will update in 55-70 seconds. Refresh to see new data.',
        '✅ Sync Started',
        10
      );

      ui.alert('✅ Sync Started!',
               'FTP sync has been triggered successfully.\n\n' +
               'The workflow will:\n' +
               '• Download 35 CSV files from Reynolds FTP\n' +
               '• Filter ~2,470 vehicles to ~200-500 specials\n' +
               '• Transform to Customer.io format\n' +
               '• Update this sheet in 55-70 seconds\n\n' +
               'Refresh the sheet to see new data!',
               ui.ButtonSet.OK);

      logEvent('FTP_SYNC', 'FTP sync triggered successfully', { statusCode: statusCode });
    } else {
      throw new Error(`Webhook returned status ${statusCode}: ${response.getContentText()}`);
    }

  } catch (error) {
    Logger.log(`Error triggering FTP sync: ${error}`);
    SpreadsheetApp.getActiveSpreadsheet().toast(
      `Sync failed: ${error.message}`,
      '❌ Error',
      10
    );

    ui.alert('❌ Sync Failed',
             'Could not trigger FTP sync.\n\n' +
             `Error: ${error.message}\n\n` +
             'Check:\n' +
             '• N8N_WEBHOOK_URL is correct\n' +
             '• n8n workflow is activated\n' +
             '• Webhook URL is accessible',
             ui.ButtonSet.OK);

    logEvent('FTP_SYNC_ERROR', 'FTP sync failed', { error: error.message });
  }
}

// ===================================================================
// FUNCTION 2: DEALER SELECTION DIALOG (Single Dealer)
// ===================================================================

/**
 * Shows a dialog for the user to select a single dealer to update
 */
function showDealerSelectionDialog() {
  const config = getConfig();

  // Get sheet data info
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(config.sheetName);
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const lastModified = DriveApp.getFileById(spreadsheet.getId()).getLastUpdated().toLocaleString();

  // Count vehicles
  const dataRange = sheet.getRange(config.vehicleDataRange);
  const values = dataRange.getValues();
  const vehicleCount = values.filter(row => row[1] && row[1].toString().trim() !== '').length;

  // Build dealer options HTML
  const dealerOptions = DEALERS_CONFIG.map(d =>
    `<option value="${d.name}">${formatDealerName(d.name)}</option>`
  ).join('');

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; }
      #status { margin-top: 10px; font-weight: bold; color: #4CAF50;}
      #error { margin-top: 10px; font-weight: bold; color: #F44336;}
      .loader { display: none; margin-top: 10px; border: 4px solid #f3f3f3; border-radius: 50%; border-top: 4px solid #3498db; width: 20px; height: 20px; animation: spin 1s linear infinite; }
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      .sync-info {
        background: #e8f5e9;
        padding: 12px;
        margin-bottom: 15px;
        border-radius: 4px;
        border-left: 4px solid #4CAF50;
      }
      .sync-info strong { color: #2e7d32; }
    </style>
    <h2>Select Dealer</h2>

    <div class="sync-info">
      <strong>📅 Last Synced:</strong> ${lastModified}<br>
      <strong>📊 Vehicles Available:</strong> ${vehicleCount} vehicles
    </div>

    <p>Choose a dealer to upload to Customer.io:</p>
    <div><select id="dealer-select" style="width: 100%;">${dealerOptions}</select></div>
    <br>
    <div>
      <button onclick="this.disabled=true; runUpdate();">Update Selected</button>
      <button onclick="google.script.host.close()">Cancel</button>
    </div>
    <div class="loader" id="loader"></div>
    <div id="status"></div>
    <div id="error"></div>
    <script>
      function runUpdate() {
        var select = document.getElementById('dealer-select');
        var selectedDealer = select.options[select.selectedIndex].value;

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
            document.querySelector('button').disabled = false; // Re-enable button on failure
          })
          .processSingleDealerUpdate(selectedDealer);
      }
    </script>
  `).setWidth(500).setHeight(350);

  SpreadsheetApp.getUi().showModalDialog(html, 'Upload to Customer.io');
}

// ===================================================================
// FUNCTION 3: PROCESS SINGLE DEALER UPDATE
// ===================================================================

/**
 * Uploads vehicle data for a single selected dealer
 *
 * @param {string} dealerName - The name of the dealer to update
 * @returns {string} Success message
 */
function processSingleDealerUpdate(dealerName) {
  const config = getConfig();
  const dealerConfig = DEALERS_CONFIG.find(d => d.name === dealerName);

  if (!dealerConfig) {
    throw new Error(`Dealer "${dealerName}" not found in configuration`);
  }

  // Read all vehicles from sheet
  const vehicles = readVehicleDataFromSheet(config);

  if (vehicles.length === 0) {
    throw new Error('No vehicles found in the sheet. Please run "Sync from FTP" first.');
  }

  // Group vehicles by dealer
  const vehiclesByDealer = groupVehiclesByDealer(vehicles);

  // Get this dealer's vehicles
  const dealerVehicles = vehiclesByDealer[dealerName] || [];

  if (dealerVehicles.length === 0) {
    throw new Error(`No vehicles found for ${dealerName}. Check that Dealer_Name field matches exactly.`);
  }

  // Upload to Customer.io
  const result = uploadDealerToCustomerIO(
    dealerName,
    dealerVehicles,
    dealerConfig.apiKey,
    dealerConfig.collectionId
  );

  if (!result.success) {
    throw new Error(result.error);
  }

  const message = `✅ Successfully uploaded ${dealerVehicles.length} vehicles to "${dealerName}" (Collection ${dealerConfig.collectionId})!`;

  logEvent('SINGLE_DEALER_UPDATE', `Updated dealer: ${dealerName}`, {
    dealer: dealerName,
    vehicleCount: dealerVehicles.length,
    collectionId: dealerConfig.collectionId
  });

  return message;
}

// ===================================================================
// FUNCTION 4: UPDATE ALL DEALERS
// ===================================================================

/**
 * Uploads vehicle data to Customer.io collections
 * Matches Python script's per-dealer upload logic:
 * 1. Read all vehicles from sheet
 * 2. Group by Dealer_Name field
 * 3. Upload each dealer to their specific collection with their specific API key
 */
function updateAllDealers() {
  const config = getConfig();
  const ui = SpreadsheetApp.getUi();

  // Get last sync info
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(config.sheetName);
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const lastModified = DriveApp.getFileById(spreadsheet.getId()).getLastUpdated().toLocaleString();

  // Confirm upload
  const result = ui.alert(
    '🔄 Upload to All Dealers',
    `Last Synced: ${lastModified}\n\n` +
    `This will upload vehicle inventory to Customer.io collections.\n\n` +
    `Process:\n` +
    `• Read vehicles from this sheet\n` +
    `• Group by Dealer_Name field\n` +
    `• Upload each dealer to their specific collection\n\n` +
    `Continue?`,
    ui.ButtonSet.YES_NO
  );

  if (result !== ui.Button.YES) {
    return;
  }

  try {
    // Read vehicle data
    const vehicles = readVehicleDataFromSheet(config);

    if (vehicles.length === 0) {
      ui.alert('⚠️ No Data',
               'No vehicles found in the sheet.\n\n' +
               'Please run "Sync from FTP" first.',
               ui.ButtonSet.OK);
      return;
    }

    // Group vehicles by Dealer_Name
    const vehiclesByDealer = groupVehiclesByDealer(vehicles);

    // Upload each dealer
    const results = [];
    let totalUploaded = 0;
    let successCount = 0;
    let failureCount = 0;

    for (const dealerName in vehiclesByDealer) {
      const dealerVehicles = vehiclesByDealer[dealerName];

      // Find dealer configuration
      const dealerConfig = DEALERS_CONFIG.find(d => d.name === dealerName);

      if (!dealerConfig) {
        results.push(`⚠️ ${dealerName}: No configuration found (${dealerVehicles.length} vehicles skipped)`);
        failureCount++;
        continue;
      }

      // Upload to Customer.io
      const uploadResult = uploadDealerToCustomerIO(
        dealerName,
        dealerVehicles,
        dealerConfig.apiKey,
        dealerConfig.collectionId
      );

      if (uploadResult.success) {
        results.push(`✅ ${dealerName}: ${dealerVehicles.length} vehicles → Collection ${dealerConfig.collectionId}`);
        totalUploaded += dealerVehicles.length;
        successCount++;
      } else {
        results.push(`❌ ${dealerName}: ${uploadResult.error}`);
        failureCount++;
      }
    }

    // Show results
    const summary = `Upload Complete!\n\n` +
                    `✅ Success: ${successCount} dealers (${totalUploaded} vehicles)\n` +
                    `❌ Failed: ${failureCount} dealers\n\n` +
                    `Details:\n${results.join('\n')}`;

    ui.alert('📊 Upload Results', summary, ui.ButtonSet.OK);

    logEvent('CUSTOMERIO_UPLOAD', 'Upload to Customer.io completed', {
      totalVehicles: vehicles.length,
      totalUploaded: totalUploaded,
      dealersProcessed: Object.keys(vehiclesByDealer).length,
      successCount: successCount,
      failureCount: failureCount
    });

  } catch (error) {
    Logger.log(`Error uploading to Customer.io: ${error}`);
    ui.alert('❌ Upload Failed',
             'Could not upload to Customer.io.\n\n' +
             `Error: ${error.message}`,
             ui.ButtonSet.OK);

    logEvent('CUSTOMERIO_UPLOAD_ERROR', 'Upload failed', { error: error.message });
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
  const headers = sheet.getRange('A1:AS1').getValues()[0];

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
 * Groups vehicles by Dealer_Name field
 * Matches Python script's grouping logic
 *
 * @param {Array} vehicles - Array of vehicle objects
 * @returns {Object} Object with dealer names as keys and vehicle arrays as values
 */
function groupVehiclesByDealer(vehicles) {
  const grouped = {};

  for (const vehicle of vehicles) {
    const dealerName = vehicle.Dealer_Name || 'Unknown';

    if (!grouped[dealerName]) {
      grouped[dealerName] = [];
    }

    grouped[dealerName].push(vehicle);
  }

  return grouped;
}

/**
 * Uploads a single dealer's vehicles to their Customer.io collection
 * Matches Python script's update_customerio_collection() function
 *
 * @param {string} dealerName - Dealer name for logging
 * @param {Array} vehicles - Array of vehicle objects
 * @param {string} apiKey - Customer.io API key
 * @param {string} collectionId - Customer.io collection ID
 * @returns {Object} Result object with success flag and error message
 */
function uploadDealerToCustomerIO(dealerName, vehicles, apiKey, collectionId) {
  try {
    if (!collectionId) {
      return {
        success: false,
        error: 'Missing collection ID'
      };
    }

    if (!apiKey) {
      return {
        success: false,
        error: 'Missing API key'
      };
    }

    if (!vehicles || vehicles.length === 0) {
      return {
        success: false,
        error: 'No vehicles to upload'
      };
    }

    // Format Customer.io API endpoint URL
    // Matches Python: f"{CUSTOMERIO_API_URL}/{collection_id}"
    const url = `https://api.customer.io/v1/api/collections/${collectionId}`;

    // Prepare payload
    // Matches Python: payload = {"data": items}
    const currentTimestamp = new Date().toISOString();

    const payload = {
      data: vehicles.map(vehicle => {
        // Use Stock as the unique identifier (fallback to VIN)
        // Add last_updated timestamp (since workflow doesn't include it)
        return {
          id: vehicle.Stock || vehicle.VIN,
          ...vehicle,
          last_updated: currentTimestamp
        };
      })
    };

    // Make API request
    // Matches Python: requests.put(url, headers=headers, json=payload)
    const response = UrlFetchApp.fetch(url, {
      method: 'PUT',
      contentType: 'application/json',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': 'Google-Apps-Script/PreOwned-Specials-Upload'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    const statusCode = response.getResponseCode();
    const responseText = response.getContentText();

    // Matches Python: if response.status_code == 200:
    if (statusCode === 200) {
      Logger.log(`Successfully updated collection ${collectionId} for ${dealerName} with ${vehicles.length} items`);
      return {
        success: true,
        vehicleCount: vehicles.length
      };
    } else {
      Logger.log(`Failed to update collection ${collectionId} for ${dealerName}: ${statusCode} - ${responseText}`);
      return {
        success: false,
        error: `API returned status ${statusCode}: ${responseText}`
      };
    }

  } catch (error) {
    Logger.log(`Error updating Customer.io collection for ${dealerName}: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
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
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const lastModified = DriveApp.getFileById(spreadsheet.getId()).getLastUpdated().toLocaleString();

  // Group vehicles by dealer for status display
  const vehicles = readVehicleDataFromSheet(config);
  const vehiclesByDealer = groupVehiclesByDealer(vehicles);

  // Build dealer distribution table
  const dealerRows = Object.keys(vehiclesByDealer).sort().map(dealerName => {
    const count = vehiclesByDealer[dealerName].length;
    const config = DEALERS_CONFIG.find(d => d.name === dealerName);
    const collectionId = config ? config.collectionId : '?';
    return `<tr><td>${dealerName}</td><td>${count}</td><td>${collectionId}</td></tr>`;
  }).join('');

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
          <td>Total Vehicles in Sheet</td>
          <td><strong>${vehicleCount}</strong></td>
        </tr>
        <tr>
          <td>Unique Dealers</td>
          <td><strong>${Object.keys(vehiclesByDealer).length}</strong></td>
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
          <td>Configured Dealers</td>
          <td>${DEALERS_CONFIG.length} total</td>
        </tr>
      </table>

      <h4>Vehicle Distribution by Dealer:</h4>
      <div style="max-height: 300px; overflow-y: auto;">
        <table border="1" cellpadding="5" cellspacing="0" style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <tr>
            <th>Dealer</th>
            <th>Vehicles</th>
            <th>Collection ID</th>
          </tr>
          ${dealerRows}
        </table>
      </div>

      <h4>Expected Data:</h4>
      <ul style="font-size: 12px;">
        <li>After FTP Sync: ~200-500 vehicles total</li>
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
    .setWidth(700)
    .setHeight(600);

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
