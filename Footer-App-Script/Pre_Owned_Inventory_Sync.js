/**
 * Pre-Owned Inventory Sync for Google Apps Script
 * Syncs vehicle inventory from FTP to Customer.io collections
 * Uses stock numbers from Google Sheets instead of JSON file
 *
 * ⚠️ IMPORTANT FTP LIMITATION:
 * Google Apps Script's UrlFetchApp does NOT support FTP protocol.
 * UrlFetchApp only supports HTTP and HTTPS protocols.
 *
 * WORKAROUNDS:
 * 1. Use an HTTP-to-FTP proxy service (recommended)
 *    - Set up a middleware service (Node.js, Cloud Functions, etc.) that:
 *      a) Receives HTTP requests from this script
 *      b) Connects to FTP server on your behalf
 *      c) Returns file contents via HTTP response
 *
 * 2. Sync FTP files to Google Drive
 *    - Use a third-party service or scheduled task to sync FTP → Google Drive
 *    - Read files from Drive using DriveApp instead of UrlFetchApp
 *
 * 3. Use Google Cloud Functions
 *    - Deploy a Cloud Function with FTP support (Node.js has FTP libraries)
 *    - Expose as HTTP endpoint that this script can call
 *
 * 4. Push-based webhook
 *    - Configure FTP server to push updates to a webhook/Apps Script endpoint
 *    - Use doPost() to receive data instead of pulling from FTP
 *
 * See downloadInventoryFile() function below for implementation details.
 */

// Configuration
const CONFIG = {
  // Google Drive Folder ID - Store in Script Properties
  // This is where n8n syncs FTP files to
  DRIVE_FOLDER_ID: PropertiesService.getScriptProperties().getProperty('DRIVE_FOLDER_ID') || '',

  // Customer.io API
  CUSTOMERIO_API_URL: "https://api.customer.io/v1/collections",

  // Filtering Configuration
  MIN_VEHICLES_COUNT: 12,
  MAX_PRICE: 99999,
  MIN_PRICE: 2000,
  MIN_MILEAGE: 100,
  USE_PRODUCTION_FILTERS: true,
  STRICT_PRODUCTION_MODE: false,
  USE_EV_PRIORITY_FILTER: true,
  EV_PRIORITY_MODE: "scoring"
};

// Dealer configurations
const DEALERS = [
  { name: "Acura Thousand Oaks", inventoryFilePrefix: "SWICKARD12", sheetColumn: "B" },
  { name: "Audi Oakland", inventoryFilePrefix: "AUDIOAKL01", sheetColumn: "C" },
  { name: "Audi Palo Alto", inventoryFilePrefix: "AUDIPALO01", sheetColumn: "D" },
  { name: "Audi Anchorage", inventoryFilePrefix: "SWICKARD11", sheetColumn: "E" },
  { name: "Audi Bellingham", inventoryFilePrefix: "SWICKARD20", sheetColumn: "F" },
  { name: "BMW of Eugene", inventoryFilePrefix: "BMWOFEUG02", sheetColumn: "G" },
  { name: "BMW of Lynnwood", inventoryFilePrefix: "BMWOFLYN01", sheetColumn: "H" },
  { name: "Crown Toyota", inventoryFilePrefix: "CROWNTOY01", sheetColumn: "I" },
  { name: "Gresham Toyota", inventoryFilePrefix: "GRESHAMT02", sheetColumn: "J" },
  { name: "Land Rover San Francisco", inventoryFilePrefix: "JLRSANFR01", sheetColumn: "K" },
  { name: "Land Rover Redwood City", inventoryFilePrefix: "LANDROVE13", sheetColumn: "L" },
  { name: "Land Rover Thousand Oaks", inventoryFilePrefix: "SWICKARD14", sheetColumn: "M" },
  { name: "Lexus of Fremont", inventoryFilePrefix: "LEXUSOFF01", sheetColumn: "N" },
  { name: "Lexus of Thousand Oaks", inventoryFilePrefix: "SWICKARD15", sheetColumn: "O" },
  { name: "Mercedes-Benz of Anchorage", inventoryFilePrefix: "MERCEDES32", sheetColumn: "P" },
  { name: "Mercedes-Benz of Honolulu", inventoryFilePrefix: "MERCEDES36", sheetColumn: "Q" },
  { name: "Mercedes-Benz of Marin", inventoryFilePrefix: "MERCEDES31", sheetColumn: "R" },
  { name: "Mercedes-Benz of Maui", inventoryFilePrefix: "MERCEDES35", sheetColumn: "S" },
  { name: "Mercedes-Benz of Seattle", inventoryFilePrefix: "SWICKARD02", sheetColumn: "T" },
  { name: "Mercedes-Benz of Thousand Oaks", inventoryFilePrefix: "MERCEDES34", sheetColumn: "U" },
  { name: "Mercedes-Benz of Wilsonville", inventoryFilePrefix: "SWICKARD03", sheetColumn: "V" },
  { name: "Porsche Anchorage", inventoryFilePrefix: "SWICKARD11", sheetColumn: "W" },
  { name: "Porsche Seattle North", inventoryFilePrefix: "PORSCHES02", sheetColumn: "X" },
  { name: "Swickard Buick GMC Anchorage", inventoryFilePrefix: "SWICKARD05", sheetColumn: "Y" },
  { name: "Swickard Chevrolet of Thousand Oaks", inventoryFilePrefix: "SWICKARD17", sheetColumn: "Z" },
  { name: "Swickard Honda", inventoryFilePrefix: "SWICKARD06", sheetColumn: "AA" },
  { name: "Swickard Toyota", inventoryFilePrefix: "SWICKARD07", sheetColumn: "AB" },
  { name: "Volvo Cars Bellevue", inventoryFilePrefix: "SWICKARD08", sheetColumn: "AC" },
  { name: "Volvo Cars Seattle", inventoryFilePrefix: "SWICKARD09", sheetColumn: "AD" },
  { name: "Volvo Cars Southwest Houston", inventoryFilePrefix: "SWICKARD10", sheetColumn: "AE" }
];

// Search URL templates
const DEALER_SEARCH_URLS = {
  "Porsche Anchorage": "https://www.porscheanchorage.com/searchused.aspx?q=",
  "Audi Anchorage": "https://www.audiofanchorage.com/en/inventory/vehicle/?isdealer&market=usuc&vehicleId=",
  "Audi Bellingham": "https://www.audibellingham.com/en/inventory/vehicle/?isdealer&market=usuc&vehicleId=",
  "Audi Oakland": "https://www.audioakland.com/en/inventory/vehicle/?isdealer&market=usuc&vehicleId=",
  "Audi Palo Alto": "https://www.audipaloalto.com/en/inventory/vehicle/?isdealer&market=usuc&vehicleId=",
  "Land Rover San Francisco": "https://www.landroversanfrancisco.com/used-inventory/index.htm?search=",
  "Land Rover Redwood City": "https://www.landroverrc.com/used-inventory/index.htm?search=",
  "Land Rover Thousand Oaks": "https://www.landroverthousandoaks.com/used-inventory/index.htm?accountId=landroverthousandoakslr&search=",
  "Mercedes-Benz of Thousand Oaks": "https://www.mbzthousandoaks.com/searchused.aspx?q="
};

const VIN_BASED_DEALERS = ["Audi Anchorage", "Audi Bellingham", "Audi Oakland", "Audi Palo Alto"];

/**
 * NOTE: The onOpen() function is defined in the Store Specials script.
 * That master onOpen() creates ALL menus including the Inventory Sync menu.
 * Do NOT add another onOpen() function here - it will conflict.
 *
 * The master onOpen() creates the "Inventory Sync" menu with these items:
 * - Sync All Dealerships (calls syncAllDealerships)
 * - Sync Selected Dealership... (calls showDealershipDialog)
 * - Configure Settings (calls showSettingsDialog)
 */

/**
 * Get stock numbers from sheet for a specific dealer
 * @param {string} dealerName - Name of the dealership
 * @returns {Array} Array of stock numbers
 */
function getStockNumbersFromSheet(dealerName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Stock Numbers");
  if (!sheet) {
    throw new Error("Stock Numbers sheet not found");
  }

  const dealer = DEALERS.find(d => d.name === dealerName);
  if (!dealer) {
    throw new Error(`Dealer ${dealerName} not found in configuration`);
  }

  // Get all data from the dealer's column
  const columnRange = sheet.getRange(dealer.sheetColumn + "2:" + dealer.sheetColumn);
  const values = columnRange.getValues();

  // Filter out empty cells and convert to array of strings
  const stockNumbers = values
    .filter(row => row[0] && String(row[0]).trim())
    .map(row => String(row[0]).trim());

  Logger.log(`Found ${stockNumbers.length} stock numbers for ${dealerName}`);
  return stockNumbers;
}

/**
 * Get dealer API key from Script Properties
 */
function getDealerApiKey(dealerName) {
  const normalizedName = dealerName.replace(/[\s-\.]/g, '_').toUpperCase();
  const propKey = `DEALER_${normalizedName}_API_KEY`;
  return PropertiesService.getScriptProperties().getProperty(propKey);
}

/**
 * Get dealer collection ID from Script Properties
 */
function getDealerCollectionId(dealerName) {
  const normalizedName = dealerName.replace(/[\s-\.]/g, '_').toUpperCase();
  const propKey = `DEALER_${normalizedName}_COLLECTION_ID`;
  const value = PropertiesService.getScriptProperties().getProperty(propKey);
  return value ? parseInt(value) : null;
}

/**
 * Download inventory file from Google Drive
 * Files are synced from FTP to Drive via n8n workflow
 *
 * @param {string} filename - Name of the CSV file (e.g., "SWICKARD12U.csv")
 * @returns {string|null} - File content as string, or null if not found
 */
function downloadInventoryFile(filename) {
  try {
    // Get the Drive folder where n8n syncs FTP files
    const folderId = CONFIG.DRIVE_FOLDER_ID;

    if (!folderId) {
      Logger.log('ERROR: DRIVE_FOLDER_ID not configured in Script Properties');
      return null;
    }

    const folder = DriveApp.getFolderById(folderId);
    const files = folder.getFilesByName(filename);

    if (files.hasNext()) {
      const file = files.next();
      const content = file.getBlob().getDataAsString();

      Logger.log(`Successfully read ${filename} from Google Drive`);
      Logger.log(`File size: ${content.length} characters`);
      Logger.log(`Last modified: ${file.getLastUpdated()}`);

      return content;
    } else {
      Logger.log(`ERROR: File ${filename} not found in Google Drive folder`);
      Logger.log(`Folder ID: ${folderId}`);
      Logger.log(`Make sure n8n workflow is running and has synced this file`);
      return null;
    }
  } catch (e) {
    Logger.log(`Error reading ${filename} from Google Drive: ${e.message}`);
    Logger.log(`Check that DRIVE_FOLDER_ID is correct and you have permission to access it`);
    return null;
  }
}

/**
 * Parse CSV content
 */
function parseCSV(csvContent) {
  const rows = csvContent.split('\n');
  const headers = rows[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const items = [];

  for (let i = 1; i < rows.length; i++) {
    if (rows[i].trim()) {
      const values = rows[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const item = {};
      headers.forEach((header, index) => {
        item[header] = values[index] || '';
      });
      items.push(item);
    }
  }

  return items;
}

/**
 * Parse price from various formats
 */
function parsePrice(priceStr) {
  if (!priceStr) return null;

  const priceClean = String(priceStr).trim();
  const nonPriceIndicators = ['call', 'contact', 'inquire', 'n/a', 'na', 'null', 'none', 'tbd'];

  if (nonPriceIndicators.some(indicator => priceClean.toLowerCase().includes(indicator))) {
    return null;
  }

  const numericOnly = priceClean.replace(/[^0-9.]/g, '');
  return numericOnly ? parseFloat(numericOnly) : null;
}

/**
 * Filter inventory by stock numbers
 */
function filterByStockNumbers(inventoryItems, stockNumbers, minCount, maxPrice, minPrice) {
  if (!stockNumbers || stockNumbers.length === 0) {
    return inventoryItems.slice(0, minCount);
  }

  const stockSet = new Set(stockNumbers.map(s => String(s).toUpperCase()));
  const filtered = [];

  for (const item of inventoryItems) {
    const stock = String(item.Stock || item.stock || item.STOCK || '').toUpperCase();
    if (stockSet.has(stock)) {
      const price = parsePrice(item.Price_Is || item.price || item.PRICE);
      if (price && price >= minPrice && price <= maxPrice) {
        filtered.push(item);
      }
    }
  }

  // If we don't have enough, add more vehicles
  if (filtered.length < minCount) {
    const additional = inventoryItems
      .filter(item => {
        const stock = String(item.Stock || item.stock || item.STOCK || '').toUpperCase();
        return !stockSet.has(stock);
      })
      .slice(0, minCount - filtered.length);

    filtered.push(...additional);
  }

  return filtered;
}

/**
 * Filter by production criteria (exclude coming soon, in-transit, etc.)
 */
function filterByProductionCriteria(inventoryItems, strictMode) {
  return inventoryItems.filter(item => {
    const mileage = parseInt(item.Mileage || item.mileage || item.MILEAGE || 0);
    const status = String(item.Status || item.status || item.STATUS || '').toLowerCase();
    const location = String(item.Location || item.location || item.LOCATION || '').toLowerCase();

    const hasMinMileage = mileage >= CONFIG.MIN_MILEAGE;
    const notInTransit = !status.includes('transit') && !location.includes('transit');
    const notComingSoon = !status.includes('coming') && !status.includes('soon');

    if (strictMode) {
      return hasMinMileage && notInTransit && notComingSoon;
    } else {
      return hasMinMileage || (notInTransit && notComingSoon);
    }
  });
}

/**
 * Generate search URL for a vehicle
 */
function generateSearchUrl(dealerName, item) {
  const baseUrl = DEALER_SEARCH_URLS[dealerName];
  if (!baseUrl) return '';

  const useVin = VIN_BASED_DEALERS.includes(dealerName);
  const identifier = useVin ?
    (item.VIN || item.vin || item.Vin || '') :
    (item.Stock || item.stock || item.STOCK || '');

  return baseUrl + identifier;
}

/**
 * Format number with commas
 */
function formatNumberWithCommas(num) {
  return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Process inventory for a specific dealer
 */
function processInventoryForDealer(dealerName) {
  const dealer = DEALERS.find(d => d.name === dealerName);
  if (!dealer) {
    throw new Error(`Dealer configuration not found for ${dealerName}`);
  }

  const apiKey = getDealerApiKey(dealerName);
  const collectionId = getDealerCollectionId(dealerName);

  if (!apiKey || !collectionId) {
    Logger.log(`Missing API key or collection ID for ${dealerName}`);
    return { success: false, message: "Missing configuration" };
  }

  try {
    // Get stock numbers from sheet
    const stockNumbers = getStockNumbersFromSheet(dealerName);

    // Download inventory file
    const filename = `${dealer.inventoryFilePrefix}U.csv`;
    const csvContent = downloadInventoryFile(filename);

    if (!csvContent) {
      return { success: false, message: "Failed to download inventory file" };
    }

    // Parse CSV
    let inventoryItems = parseCSV(csvContent);
    Logger.log(`Parsed ${inventoryItems.length} items from ${filename}`);

    // Apply filters
    inventoryItems = filterByStockNumbers(
      inventoryItems,
      stockNumbers,
      CONFIG.MIN_VEHICLES_COUNT,
      CONFIG.MAX_PRICE,
      CONFIG.MIN_PRICE
    );

    if (CONFIG.USE_PRODUCTION_FILTERS) {
      inventoryItems = filterByProductionCriteria(inventoryItems, CONFIG.STRICT_PRODUCTION_MODE);
    }

    // Format items for Customer.io
    const formattedItems = inventoryItems.slice(0, 20).map(item => {
      const price = parsePrice(item.Price_Is || item.price || item.PRICE);

      return {
        name: `${item.Year || ''} ${item.Make || ''} ${item.Model || ''}`.trim(),
        stock_number: item.Stock || item.stock || item.STOCK || '',
        vin: item.VIN || item.vin || item.Vin || '',
        price: price ? formatNumberWithCommas(Math.round(price)) : 'Call for Price',
        mileage: formatNumberWithCommas(item.Mileage || item.mileage || '0'),
        year: item.Year || item.year || '',
        make: item.Make || item.make || '',
        model: item.Model || item.model || '',
        url: generateSearchUrl(dealerName, item),
        image_url: item.Image_URL || item.image_url || item.Photo || ''
      };
    });

    // Update Customer.io collection
    const updateResult = updateCustomerIoCollection(collectionId, apiKey, formattedItems);

    return {
      success: updateResult,
      message: updateResult ?
        `Updated ${formattedItems.length} vehicles` :
        "Failed to update Customer.io",
      vehicleCount: formattedItems.length
    };

  } catch (error) {
    Logger.log(`Error processing ${dealerName}: ${error.message}`);
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Update Customer.io collection
 */
function updateCustomerIoCollection(collectionId, apiKey, items) {
  const url = `${CONFIG.CUSTOMERIO_API_URL}/${collectionId}`;

  const payload = {
    data: items.map((item, index) => ({
      ...item,
      position: index + 1
    }))
  };

  try {
    const response = UrlFetchApp.fetch(url, {
      method: 'put',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    const responseCode = response.getResponseCode();
    if (responseCode >= 200 && responseCode < 300) {
      Logger.log(`Successfully updated collection ${collectionId}`);
      return true;
    } else {
      Logger.log(`Failed to update collection: ${response.getContentText()}`);
      return false;
    }
  } catch (error) {
    Logger.log(`Error updating Customer.io: ${error.message}`);
    return false;
  }
}

/**
 * Sync all dealerships
 */
function syncAllDealerships() {
  const ui = SpreadsheetApp.getUi();
  const results = [];
  let successCount = 0;
  let failureCount = 0;

  for (const dealer of DEALERS) {
    const result = processInventoryForDealer(dealer.name);
    results.push({
      dealer: dealer.name,
      ...result
    });

    if (result.success) {
      successCount++;
    } else {
      failureCount++;
    }

    // Add delay to avoid rate limiting
    Utilities.sleep(1000);
  }

  // Show summary
  const message = `Sync Complete!\n\nSuccess: ${successCount}\nFailed: ${failureCount}\n\n` +
    results.map(r => `${r.dealer}: ${r.success ? '✅' : '❌'} ${r.message}`).join('\n');

  ui.alert('Inventory Sync Results', message, ui.ButtonSet.OK);
}

/**
 * Show dialog to select a specific dealership
 */
function showDealershipDialog() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      select { width: 100%; padding: 8px; margin: 10px 0; }
      button { padding: 10px 20px; margin: 5px; }
      #status { margin-top: 15px; padding: 10px; }
      .success { color: green; }
      .error { color: red; }
    </style>
    <h3>Select Dealership to Sync</h3>
    <select id="dealerSelect">
      ${DEALERS.map(d => `<option value="${d.name}">${d.name}</option>`).join('')}
    </select>
    <br><br>
    <button onclick="syncSelected()">Sync Selected</button>
    <button onclick="google.script.host.close()">Cancel</button>
    <div id="status"></div>

    <script>
      function syncSelected() {
        const dealer = document.getElementById('dealerSelect').value;
        document.getElementById('status').innerHTML = 'Syncing ' + dealer + '...';

        google.script.run
          .withSuccessHandler(function(result) {
            const statusDiv = document.getElementById('status');
            if (result.success) {
              statusDiv.className = 'success';
              statusDiv.innerHTML = '✅ Success! ' + result.message;
            } else {
              statusDiv.className = 'error';
              statusDiv.innerHTML = '❌ Failed: ' + result.message;
            }
          })
          .withFailureHandler(function(error) {
            document.getElementById('status').className = 'error';
            document.getElementById('status').innerHTML = '❌ Error: ' + error.message;
          })
          .processInventoryForDealer(dealer);
      }
    </script>
  `)
  .setWidth(400)
  .setHeight(300);

  SpreadsheetApp.getUi().showModalDialog(html, 'Sync Dealership Inventory');
}

/**
 * Show settings configuration dialog
 */
function showSettingsDialog() {
  const currentFolderId = CONFIG.DRIVE_FOLDER_ID || '';

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      .setting { margin: 15px 0; }
      label { display: inline-block; width: 180px; font-weight: bold; }
      input { padding: 8px; width: 300px; }
      button { padding: 10px 20px; margin: 5px; background: #4285f4; color: white; border: none; border-radius: 4px; cursor: pointer; }
      button:hover { background: #3367d6; }
      .cancel { background: #999; }
      .cancel:hover { background: #777; }
      .info { background: #e3f2fd; padding: 15px; border-radius: 4px; color: #1565c0; font-size: 13px; margin-top: 15px; line-height: 1.6; }
      .info strong { display: block; margin-bottom: 8px; }
      .code { font-family: monospace; background: #f5f5f5; padding: 2px 6px; border-radius: 3px; }
      h3 { color: #333; margin-top: 0; }
    </style>
    <h3>📁 Inventory Sync Settings</h3>
    <div class="setting">
      <label>Google Drive Folder ID:</label><br>
      <input type="text" id="driveFolderId" value="${currentFolderId}" placeholder="1ABC123XYZ789">
    </div>

    <div class="info">
      <strong>ℹ️ How to get your Folder ID:</strong>
      1. Open Google Drive<br>
      2. Navigate to your <span class="code">Reynolds Inventory Files</span> folder<br>
      3. Copy the ID from the URL:<br>
      <span class="code">drive.google.com/drive/folders/<strong>1ABC123XYZ789</strong></span><br>
      <br>
      <strong>Note:</strong> Make sure n8n has write access to this folder!
    </div>

    <div style="margin-top: 20px;">
      <button onclick="saveSettings()">💾 Save Settings</button>
      <button class="cancel" onclick="google.script.host.close()">Cancel</button>
    </div>

    <script>
      function saveSettings() {
        const folderId = document.getElementById('driveFolderId').value.trim();

        if (!folderId) {
          alert('Please enter a Google Drive Folder ID');
          return;
        }

        google.script.run
          .withSuccessHandler(() => {
            alert('✅ Settings saved successfully!\\n\\nThe script will now read inventory files from Google Drive.');
            google.script.host.close();
          })
          .withFailureHandler((error) => {
            alert('❌ Error saving settings: ' + error.message);
          })
          .saveScriptProperties({ driveFolderId: folderId });
      }
    </script>
  `)
  .setWidth(550)
  .setHeight(420);

  SpreadsheetApp.getUi().showModalDialog(html, 'Configure Inventory Sync');
}

/**
 * Save settings to Script Properties
 */
function saveScriptProperties(settings) {
  const scriptProps = PropertiesService.getScriptProperties();

  if (settings.driveFolderId) {
    scriptProps.setProperty('DRIVE_FOLDER_ID', settings.driveFolderId);
    Logger.log(`Saved DRIVE_FOLDER_ID: ${settings.driveFolderId}`);
  }

  return true;
}