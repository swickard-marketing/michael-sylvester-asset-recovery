 /**
 * Sales Specials Automation System for Google Apps Script
 * Updates Customer.io snippets for Sales Specials Content and Product Cards from Google Sheets data.
 * This script provides a UI menu in Google Sheets to update all workspaces at once
 * or select a specific workspace to update.
 * 
 * FIXED_FALLBACKS VERSION - Fixed multi-brand fallback logic to use primary brand data consistently
 */

/**
 * @typedef {Object} Workspace
 */

/** 
 * Global configuration for all workspaces.
 * This list is used to populate the UI and drive the update process.
 * @type {Workspace[]} 
 */
const WORKSPACES_CONFIG = [
  { name: 'ACURA_THOUSAND_OAKS', apiKey: '1fd2ddd8d2640a15a1aa8fcb62cc4433', type: 'single', dealership: 'Acura Thousand Oaks', collectionId: 12 },
  { name: 'AUDI_OAKLAND', apiKey: '5e38a490a4cb75da215ff8e077916311', type: 'single', dealership: 'Audi Oakland', collectionId: 36 },
  { name: 'AUDI_PALO_ALTO', apiKey: 'e7295eb15fb899b12b8de4d29ce68dd1', type: 'single', dealership: 'Audi Palo Alto', collectionId: 3 },
  { name: 'BMW_OF_EUGENE', apiKey: '75c00432a4fb3c5f086ae2a1ef4c1872', type: 'single', dealership: 'BMW of Eugene', collectionId: 10 },
  { name: 'BMW_OF_LYNNWOOD', apiKey: '629fb75ec206c73db80646ebf1e24a44', type: 'single', dealership: 'BMW of Lynnwood', collectionId: 10 },
  { name: 'BMW_OF_PORTLAND', apiKey: 'd32ee445bda602b49ad1ed6dfd503f9f', type: 'single', dealership: 'BMW of Portland', collectionId: 10 },
  { name: 'CHEVROLET_THOUSAND_OAKS', apiKey: '171cad5c1236a99a77a08ae34003672b', type: 'single', dealership: 'Chevrolet Thousand Oaks', collectionId: 10 },
  { name: 'CROWN_TOYOTA', apiKey: 'f32f834fd0b71b763ebcda51ae77d0ae', type: 'single', dealership: 'Crown Toyota', collectionId: 12 },
  { name: 'GRESHAM_TOYOTA', apiKey: 'cf2e4819a8f20ddddc359b0463a51d3c', type: 'single', dealership: 'Gresham Toyota', collectionId: 12 },
  { name: 'LAND_ROVER_REDWOOD_CITY', apiKey: '235a9de44560b1c718e34e3e37b98d61', type: 'single', dealership: 'Land Rover Redwood City', collectionId: 12 },
  { name: 'LAND_ROVER_SF', apiKey: '7508bfc5d5ac908875c802bb62435f7a', type: 'single', dealership: 'Land Rover San Francisco', collectionId: 12 },
  { name: 'LAND_ROVER_THOUSAND_OAKS', apiKey: '777b6593ef5dfbc3780c58f40de87d35', type: 'single', dealership: 'Land Rover Thousand Oaks', collectionId: 12 },
  { name: 'LEXUS_OF_FREMONT', apiKey: '7145206bdac834c98fe1ea754dc29d3c', type: 'single', dealership: 'Lexus of Fremont', collectionId: 12 },
  { name: 'LEXUS_OF_THOUSAND_OAKS', apiKey: '46806ce450ff12a10dd1987bb4ca7403', type: 'single', dealership: 'Lexus of Thousand Oaks', collectionId: 12 },
  { name: 'MB_HONOLULU', apiKey: '7641f8a8d9ec3bb2b2abea426d33e95e', type: 'single', dealership: 'Mercedes-Benz of Honolulu', collectionId: 11 },
  { name: 'MB_MAUI', apiKey: 'a87ead97a30341a3c31af756e67b1274', type: 'single', dealership: 'Mercedes-Benz of Maui', collectionId: 12 },
  { name: 'MERCEDES_BENZ_OF_ANCHORAGE', apiKey: '2630e6ae3e1136a5d778ae9f275fb99a', type: 'single', dealership: 'Mercedes-Benz of Anchorage', collectionId: 11 },
  { name: 'MERCEDES_BENZ_OF_MARIN', apiKey: '15c4428085013edcf1a0194c22eff6ca', type: 'single', dealership: 'Mercedes-Benz of Marin', collectionId: 11 },
  { name: 'MERCEDES_BENZ_OF_PALO_ALTO', apiKey: 'f6ab8bf9e704c04a96a6e48e0ed2fe87', type: 'single', dealership: 'Mercedes-Benz of Palo Alto', collectionId: 1 },
  { name: 'MERCEDES_BENZ_OF_SEATTLE', apiKey: 'dba69f95292704439e259c36df6c57cf', type: 'single', dealership: 'Mercedes-Benz of Seattle', collectionId: 2 },
  { name: 'MERCEDES_BENZ_OF_THOUSAND_OAKS', apiKey: '20899542d1142b2e6a0006bdccd87816', type: 'single', dealership: 'Mercedes-Benz of Thousand Oaks', collectionId: 11 },
  { name: 'MERCEDES_BENZ_OF_WILSONVILLE', apiKey: 'b48998b68625a96754ea225332628fc1', type: 'single', dealership: 'Mercedes-Benz of Wilsonville', collectionId: 11 },
  { name: 'PORSCHE_SEATTLE_NORTH', apiKey: '2ab0003f77ed82f935cc6152e867712a', type: 'single', dealership: 'Porsche Seattle North', collectionId: 11 },
  { name: 'SWICKARD_GMC_PALMER', apiKey: '63aed0dbc828a5a08123b8c2577b42ed', type: 'single', dealership: 'Swickard GMC Palmer', collectionId: 10 },
  { name: 'SWICKARD_HONDA_GLADSTONE', apiKey: 'd63203c05ac12287407cb911307f31c5', type: 'single', dealership: 'Swickard Honda Gladstone', collectionId: 11 },
  { name: 'SWICKARD_HONDA_THOUSAND_OAKS', apiKey: 'd82652ce3729849182cb06042536119e', type: 'single', dealership: 'Swickard Honda Thousand Oaks', collectionId: 11 },
  { name: 'SWICKARD_TOYOTA', apiKey: '7e9e5cf9c12188925ddce4f921270f90', type: 'single', dealership: 'Swickard Toyota', collectionId: 12 },
  { name: 'TOYOTA_101', apiKey: '02ca351088bc8e9a8b664688dbf0cf6d', type: 'single', dealership: 'Toyota 101', collectionId: 11 },
  { name: 'VOLVO_CARS_BELLEVUE', apiKey: 'c04c3f9fee56dbe240f17ea4316211ac', type: 'single', dealership: 'Volvo Cars Bellevue', collectionId: 12 },
  { name: 'VOLVO_CARS_SEATTLE', apiKey: 'eb9e61ed54eb1c2ecb580d13cc7878c3', type: 'single', dealership: 'Volvo Cars Seattle', collectionId: 12 },
  { name: 'VOLVO_CARS_SOUTHWEST_HOUSTON', apiKey: 'cf3d981ec2b6f96273f16f50513db495', type: 'single', dealership: 'Volvo Cars Southwest Houston', collectionId: 12 },
  
  // Multi-Dealership Groups
  { name: 'AUDI_VOLKSWAGEN_BELLINGHAM', apiKey: '6c4af2e86daa1c8cf730489c4b41db2b', type: 'multi', dealerships: { 'Audi': 'Audi Bellingham', 'Volkswagen': 'Volkswagen Bellingham' }, collectionId: 13 },
  { name: 'THOUSAND_OAKS_GM_CADILLAC', apiKey: '06e5197f9d9a7119d4dc6cecf1bf9c22', type: 'multi', dealerships: { 'Buick': 'Buick, GMC Thousand Oaks', 'GMC': 'Buick, GMC Thousand Oaks', 'Cadillac': 'Cadillac Thousand Oaks' }, collectionId: 10 },
  { name: 'PORSCHE_AUDI_VOLKSWAGEN_ANCHORAGE', apiKey: '2ae0afa8d034d1a81bfc4b93ab95dd0b', type: 'multi', dealerships: { 'Porsche': 'Porsche Anchorage', 'Audi': 'Audi Anchorage', 'Volkswagen': 'Volkswagen Anchorage' }, collectionId: 11 },
  { name: 'ANCHORAGE_GM_CADILLAC', apiKey: '4107c3fc1225eaf3434c1d9fa2cb2ad2', type: 'multi', dealerships: { 'Cadillac': 'Cadillac Anchorage', 'Chevrolet': 'Swickard Anchorage', 'Buick': 'Swickard Anchorage', 'GMC': 'Swickard Anchorage' }, collectionId: 10 }
];

/**
* MASTER onOpen() function - Creates ALL custom menus for the spreadsheet.
* This is the ONLY onOpen() function in the project.
* All three menus (Sales Specials, Service Specials, Pre-Owned Specials) are created here.
*/
function onOpen() {
  const ui = SpreadsheetApp.getUi();

  // Create Sales Specials menu
  ui.createMenu('Sales Specials Tools')
    .addItem('Update ALL Snippets', 'showAllSnippetsDialog')
    .addItem('Update Specific Snippet...', 'showSpecificSnippetDialog')
    .addSeparator()
    .addItem('Update ALL Collections', 'showAllCollectionsDialog')
    .addItem('Update Specific Collection...', 'showSalesSpecialsCollectionDialog')
    .addToUi();

  // Create Service Specials menu
  ui.createMenu('Service Specials')
    .addItem('Update ALL Snippets', 'showAllServiceSpecialsDialog')
    .addItem('Update Specific Snippet...', 'showServiceSpecialsWorkspaceDialog')
    .addSeparator()
    .addItem('Update ALL Collections', 'showAllServiceCollectionsDialog')
    .addItem('Update Specific Collection...', 'showServiceSpecialsCollectionDialog')
    .addToUi();

  // Create Pre-Owned Specials menu (shows "Coming Soon" until FTP workaround is implemented)
  ui.createMenu('Pre-Owned Specials')
    .addItem('Update ALL Workspaces', 'showPreOwnedComingSoonDialog')
    .addItem('Update a Specific Workspace...', 'showPreOwnedComingSoonDialog')
    .addToUi();
}

/**
* Formats the raw workspace name for display in the UI.
* @param {string} name The raw workspace name.
* @returns {string} The formatted name.
*/
function formatWorkspaceName(name) {
const specialReplacements = {
  'SF': 'San Francisco',
  'MB': 'Mercedes-Benz'
};

return name
  .split('_')
  .map(word => {
    // Check for special replacements first
    if (specialReplacements[word]) {
      return specialReplacements[word];
    }
    // Keep other short acronyms like 'GM' in uppercase
    if (word.length <= 3) { 
      return word;
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  })
  .join(' ');
}

/**
* Returns a random vehicle emoji for some fun.
* @returns {string} An emoji.
*/
function getRandomVehicleEmoji() {
const vehicles = ['🚗', '🚙', '🏎️', '🚕', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🚘', '🚔', '🚖', '🚍', '🚌', '🏍️', '🛵', '🛺', '🚲', '🛴'];
return vehicles[Math.floor(Math.random() * vehicles.length)];
}

/**
* Shows a dialog for the user to select a single workspace to update.
*/
function showWorkspaceSelectionDialog() {
const html = HtmlService.createHtmlOutput(`
  <style>
    body { font-family: Arial, sans-serif; }
    #status { margin-top: 10px; font-weight: bold; color: #4CAF50;} 
    #error { margin-top: 10px; font-weight: bold; color: #F44336;} 
    .loader { display: none; margin-top: 10px; border: 4px solid #f3f3f3; border-radius: 50%; border-top: 4px solid #3498db; width: 20px; height: 20px; animation: spin 1s linear infinite; } 
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .checkbox-group { margin: 15px 0; }
    .checkbox-group label { display: block; margin-bottom: 5px; }
  </style>
  <h2>Select Workspace</h2>
  <p>Choose a workspace and what to update.</p>
  <div><select id="workspace-select" style="width: 100%;">${WORKSPACES_CONFIG.map(w => `<option value="${w.name}">${formatWorkspaceName(w.name)}</option>`).join('')}</select></div>
  <div class="checkbox-group">
    <strong style="display:block;margin:10px 0 5px 0;">Snippets:</strong>
    <label><input type="checkbox" id="update-product-card" checked> Product Card Snippet</label>
    <label><input type="checkbox" id="update-content" checked> Content Snippet</label>
  </div>
  <div class="checkbox-group" style="margin-top:15px;padding-top:15px;border-top:1px solid #ddd;">
    <strong style="display:block;margin:0 0 5px 0;">Collection:</strong>
    <label><input type="checkbox" id="update-collection" checked> Sales-Specs-Recs Collection</label>
  </div>
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
      var select = document.getElementById('workspace-select');
      var selectedWorkspace = select.options[select.selectedIndex].value;
      var updateProductCard = document.getElementById('update-product-card').checked;
      var updateContent = document.getElementById('update-content').checked;
      var updateCollection = document.getElementById('update-collection').checked;
      
      if (!updateProductCard && !updateContent && !updateCollection) {
        document.getElementById('error').innerText = 'Please select at least one item to update.';
        document.querySelector('button').disabled = false;
        return;
      }
      
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
        .processSingleWorkspaceUpdate(selectedWorkspace, updateProductCard, updateContent, updateCollection);
    }
  </script>
`).setWidth(400).setHeight(300);

SpreadsheetApp.getUi().showModalDialog(html, 'Update Specific Workspace');
}

/**
* Maps field names from the spreadsheet to standardized names used in the script.
* This helps handle variations in column headers.
* CORRECTED: Simplified to match actual CSV field names
* @param {Object} vehicle The vehicle data object from the spreadsheet.
* @returns {Object} The vehicle data with standardized field names.
*/
function standardizeFieldNames(vehicle) {
const standardized = {...vehicle};

// Check for column names with extra spaces or other issues
Object.keys(vehicle).forEach(key => {
  const trimmedKey = key.trim();
  if (key !== trimmedKey) {
    Logger.log(`WARNING: Found column with extra spaces: "${key}"`);
    standardized[trimmedKey] = vehicle[key];
    delete standardized[key]; // Remove the key with spaces
  }
});

// Only handle variations that might exist with spaces instead of underscores
// These mappings are for backward compatibility with older CSV formats
const spaceToUnderscoreMappings = {
  "Hero Image": "Hero_Image",
  "New Specials url": "New_Specials_url",
  "Lifestyle Body Title": "Lifestyle_Body_Title",
  "Lifestyle Body": "Lifestyle_Body",
  "Vehicle Image": "Vehicle_Image"
};

Object.keys(spaceToUnderscoreMappings).forEach(spaceKey => {
  if (vehicle[spaceKey] && !vehicle[spaceToUnderscoreMappings[spaceKey]]) {
    standardized[spaceToUnderscoreMappings[spaceKey]] = vehicle[spaceKey];
  }
});

return standardized;
}

/**
* Logs detailed information about the data structure for debugging.
* @param {Object|Object[]} vehicleData The vehicle data to debug.
* @param {string} context A descriptive context for the log.
*/
function debugLogData(vehicleData, context) {
Logger.log(`DEBUG [${context}] - Data structure:`);

if (Array.isArray(vehicleData)) {
  Logger.log(`  Array with ${vehicleData.length} items`);
  if (vehicleData.length > 0) {
    const firstItem = vehicleData[0];
    Logger.log(`  First item fields: ${Object.keys(firstItem).join(', ')}`);
    Logger.log(`  First item values:`);
    Object.keys(firstItem).forEach(key => {
      Logger.log(`    ${key}: ${firstItem[key]}`);
    });
  }
} else if (typeof vehicleData === 'object' && vehicleData !== null) {
  Logger.log(`  Object with ${Object.keys(vehicleData).length} keys`);
  Logger.log(`  Keys: ${Object.keys(vehicleData).join(', ')}`);
} else {
  Logger.log(`  Unexpected data type: ${typeof vehicleData}`);
}
}

/**
* Processes the update for a single workspace, called from the selection dialog.
* @param {string} workspaceName The name of the workspace to update.
* @param {boolean} updateProductCard Whether to update the Product Card snippet.
* @param {boolean} updateContent Whether to update the Content snippet.
* @param {boolean} updateCollection Whether to update the Sales-Specs-Recs collection.
* @returns {string} A success or failure message.
*/
function processSingleWorkspaceUpdate(workspaceName, updateProductCard = true, updateContent = true, updateCollection = true) {
const workspace = WORKSPACES_CONFIG.find(w => w.name === workspaceName);
if (!workspace) {
  throw new Error(`Workspace '${workspaceName}' not found.`);
}

const ss = SpreadsheetApp.getActiveSpreadsheet();
const sheet = ss.getSheetByName("Email Specials Automation"); // Updated to correct sheet name

if (!sheet) {
  throw new Error("Sheet 'Email Specials Automation' not found. Please check the sheet name.");
}

try {
  Logger.log(`Processing single workspace: ${workspace.name}...`);
  
  // Get vehicle data for the dealership
  let vehicleData;
  if (workspace.type === 'single') {
    const dealershipName = workspace.dealership;
    vehicleData = getVehicleDataForDealership(sheet, dealershipName);
    
    if (!vehicleData || vehicleData.length === 0) {
      throw new Error(`No vehicle data found for '${dealershipName}' in the sheet.`);
    }
    
    // Debug the raw data structure
    debugLogData(vehicleData, "Raw vehicle data");
    
    // Standardize field names for each vehicle
    vehicleData = vehicleData.map(standardizeFieldNames);
    
    // Debug the standardized data structure
    debugLogData(vehicleData, "Standardized vehicle data");
    
    // Log the first vehicle's fields for debugging
    if (vehicleData.length > 0) {
      Logger.log(`First vehicle fields available: ${Object.keys(vehicleData[0]).join(', ')}`);
      Logger.log(`Hero_Image field value: ${vehicleData[0].Hero_Image || 'NOT FOUND'}`);
      Logger.log(`Vehicle_Image field value: ${vehicleData[0].Vehicle_Image || 'NOT FOUND'}`);
      Logger.log(`New_Specials_url field value: ${vehicleData[0].New_Specials_url || 'NOT FOUND'}`);
      Logger.log(`Lifestyle_Body_Title field value: ${vehicleData[0].Lifestyle_Body_Title || 'NOT FOUND'}`);
      Logger.log(`Lifestyle_Body field value: ${vehicleData[0].Lifestyle_Body || 'NOT FOUND'}`);
    }
  } else if (workspace.type === 'multi') {
    vehicleData = {};
    for (const brand in workspace.dealerships) {
      const dealershipName = workspace.dealerships[brand];
      const brandVehicles = getVehicleDataForDealership(sheet, dealershipName);
      if (brandVehicles && brandVehicles.length > 0) {
        // Standardize field names for each vehicle
        const standardizedVehicles = brandVehicles.map(standardizeFieldNames);
        vehicleData[brand] = standardizedVehicles;
        
        // Log the first vehicle's fields for debugging
        Logger.log(`First ${brand} vehicle fields available: ${Object.keys(standardizedVehicles[0]).join(', ')}`);
        Logger.log(`${brand} Hero_Image field value: ${standardizedVehicles[0].Hero_Image || 'NOT FOUND'}`);
        Logger.log(`${brand} Vehicle_Image field value: ${standardizedVehicles[0].Vehicle_Image || 'NOT FOUND'}`);
        Logger.log(`${brand} New_Specials_url field value: ${standardizedVehicles[0].New_Specials_url || 'NOT FOUND'}`);
        Logger.log(`${brand} Lifestyle_Body_Title field value: ${standardizedVehicles[0].Lifestyle_Body_Title || 'NOT FOUND'}`);
        Logger.log(`${brand} Lifestyle_Body field value: ${standardizedVehicles[0].Lifestyle_Body || 'NOT FOUND'}`);
      }
    }
    
    if (Object.keys(vehicleData).length === 0) {
      throw new Error(`No vehicle data found for any dealerships in workspace '${workspace.name}'.`);
    }
  } else {
    throw new Error(`Invalid workspace type for '${workspace.name}'.`);
  }
  
  // Validate data before generating snippets
  validateVehicleData(vehicleData, workspace);
  
  // Track results for each update type
  const results = {
    productCard: { updated: false, error: null },
    content: { updated: false, error: null },
    collection: { updated: false, error: null }
  };
  
  // Update Collection first (the data that feeds the snippets)
  if (updateCollection) {
    let collectionData;
    if (workspace.type === 'single') {
      collectionData = vehicleData;
    } else {
      // For multi-brand workspaces, flatten all vehicle data
      collectionData = [];
      for (const brand in vehicleData) {
        if (vehicleData[brand] && vehicleData[brand].length > 0) {
          collectionData = collectionData.concat(vehicleData[brand]);
        }
      }
    }
    
    const collectionResult = updateCollectionInCustomerIO(workspace.apiKey, workspace.collectionId, collectionData);
    results.collection = collectionResult;
  }
  
  // Update Content snippet (it comes before Product Card in the email)
  if (updateContent) {
    const contentSnippet = generateSalesSpecsContent(vehicleData, workspace);
    const contentResult = updateSnippetInCustomerIO(workspace.apiKey, 'Sales-Specs-Content', contentSnippet);
    results.content = contentResult;
  }
  
  // Update Product Card snippet if selected
  if (updateProductCard) {
    const productCardSnippet = generateSalesSpecsProductCard(vehicleData, workspace);
    const productCardResult = updateSnippetInCustomerIO(workspace.apiKey, 'Sales-Specs-Product-Card', productCardSnippet);
    results.productCard = productCardResult;
  }
  
  // Generate success or error message
  if ((!updateProductCard || results.productCard.success) && 
      (!updateContent || results.content.success) &&
      (!updateCollection || results.collection.success)) {
    // All selected items updated successfully
    const updatedItems = [];
    if (updateProductCard) updatedItems.push('Product Card');
    if (updateContent) updatedItems.push('Content');
    if (updateCollection) updatedItems.push('Collection');
    
    const message = `${getRandomVehicleEmoji()} Successfully updated ${updatedItems.join(', ')} for ${formatWorkspaceName(workspace.name)}.`;
    Logger.log(`✅ ${message}`);
    return message;
  } else {
    // Some items failed to update
    let errorMessage = "";
    if (updateProductCard && !results.productCard.success) errorMessage += `Product Card: ${results.productCard.error}. `;
    if (updateContent && !results.content.success) errorMessage += `Content: ${results.content.error}. `;
    if (updateCollection && !results.collection.success) errorMessage += `Collection: ${results.collection.error}`;
    throw new Error(errorMessage);
  }
} catch (error) {
  Logger.log(`❌ Error for ${workspace.name}: ${error.message}`);
  throw error; // Re-throw the error so the UI failure handler catches it
}
}

/**
* Shows a dialog for updating all workspaces with options to choose snippets.
*/
function showAllWorkspacesDialog() {
const html = HtmlService.createHtmlOutput(`
  <style>
    body { font-family: Arial, sans-serif; }
    #status { margin-top: 10px; font-weight: bold; color: #4CAF50;} 
    #error { margin-top: 10px; font-weight: bold; color: #F44336;} 
    .loader { display: none; margin-top: 10px; border: 4px solid #f3f3f3; border-radius: 50%; border-top: 4px solid #3498db; width: 20px; height: 20px; animation: spin 1s linear infinite; } 
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .checkbox-group { margin: 15px 0; }
    .checkbox-group label { display: block; margin-bottom: 5px; }
  </style>
  <h2>Update All Workspaces</h2>
  <p>Select what to update for all workspaces.</p>
  <div class="checkbox-group">
    <strong style="display:block;margin:10px 0 5px 0;">Snippets:</strong>
    <label><input type="checkbox" id="update-product-card" checked> Product Card Snippet</label>
    <label><input type="checkbox" id="update-content" checked> Content Snippet</label>
  </div>
  <div class="checkbox-group" style="margin-top:15px;padding-top:15px;border-top:1px solid #ddd;">
    <strong style="display:block;margin:0 0 5px 0;">Collection:</strong>
    <label><input type="checkbox" id="update-collection" checked> Sales-Specs-Recs Collection</label>
  </div>
  <br>
  <div>
    <button onclick="this.disabled=true; runUpdate();">Update All</button> 
    <button onclick="google.script.host.close()">Cancel</button>
  </div>
  <div class="loader" id="loader"></div>
  <div id="status"></div>
  <div id="error"></div>
  <script>
    function runUpdate() {
      var updateProductCard = document.getElementById('update-product-card').checked;
      var updateContent = document.getElementById('update-content').checked;
      var updateCollection = document.getElementById('update-collection').checked;

      if (!updateProductCard && !updateContent && !updateCollection) {
        document.getElementById('error').innerText = 'Please select at least one item to update.';
        document.querySelector('button').disabled = false;
        return;
      }

      // Show confirmation dialog before proceeding
      var updatingItems = [];
      if (updateProductCard) updatingItems.push('Product Card');
      if (updateContent) updatingItems.push('Content');
      if (updateCollection) updatingItems.push('Collection');

      var confirmMessage = 'You are about to update ' + updatingItems.join(', ') + ' for ALL ${WORKSPACES_CONFIG.length} workspaces.\\n\\nThis will make API calls to Customer.io for every workspace and cannot be undone.\\n\\nAre you sure you want to continue?';

      if (!confirm(confirmMessage)) {
        document.querySelector('button').disabled = false;
        return;
      }

      document.getElementById('loader').style.display = 'block';
      document.getElementById('status').innerText = '';
      document.getElementById('error').innerText = '';

      google.script.run
        .withSuccessHandler(function(result) {
          document.getElementById('loader').style.display = 'none';
          document.getElementById('status').innerText = 'Processing complete! Check the logs for details.';
          setTimeout(function(){ google.script.host.close(); }, 3000);
        })
        .withFailureHandler(function(error) {
          document.getElementById('loader').style.display = 'none';
          document.getElementById('error').innerText = 'Error: ' + error.message;
          document.querySelector('button').disabled = false; // Re-enable button on failure
        })
        .updateAllSalesSpecialsSnippets(updateProductCard, updateContent, updateCollection);
    }
  </script>
`).setWidth(400).setHeight(300);

SpreadsheetApp.getUi().showModalDialog(html, 'Update All Workspaces');
}

/**
* Updates sales specials snippets and collections for ALL configured workspaces.
* @param {boolean} updateProductCard Whether to update the Product Card snippet.
* @param {boolean} updateContent Whether to update the Content snippet.
* @param {boolean} updateCollection Whether to update the Sales-Specs-Recs collection.
*/
function updateAllSalesSpecialsSnippets(updateProductCard = true, updateContent = true, updateCollection = true) {
const ss = SpreadsheetApp.getActiveSpreadsheet();
const sheet = ss.getSheetByName("Email Specials Automation");

if (!sheet) {
  SpreadsheetApp.getUi().alert("Error: Sheet 'Email Specials Automation' not found. Please check the sheet name.");
  return;
}

/** @type {{success: number, failure: number, alerts: string[]}} */
const results = { success: 0, failure: 0, alerts: [] };

// Process each workspace from the global config
WORKSPACES_CONFIG.forEach(workspace => {
  try {
    Logger.log(`Processing ${workspace.name}...`);
    
    // Get vehicle data for the dealership
    let vehicleData;
    if (workspace.type === 'single') {
      const dealershipName = workspace.dealership;
      vehicleData = getVehicleDataForDealership(sheet, dealershipName);
      
      if (!vehicleData || vehicleData.length === 0) {
        throw new Error(`No vehicle data found for '${dealershipName}' in the sheet.`);
      }
      
      // Standardize field names for each vehicle
      vehicleData = vehicleData.map(standardizeFieldNames);
    } else if (workspace.type === 'multi') {
      vehicleData = {};
      for (const brand in workspace.dealerships) {
        const dealershipName = workspace.dealerships[brand];
        const brandVehicles = getVehicleDataForDealership(sheet, dealershipName);
        if (brandVehicles && brandVehicles.length > 0) {
          // Standardize field names for each vehicle
          vehicleData[brand] = brandVehicles.map(standardizeFieldNames);
        }
      }
      
      if (Object.keys(vehicleData).length === 0) {
        throw new Error(`No vehicle data found for any dealerships in workspace '${workspace.name}'.`);
      }
    } else {
      throw new Error(`Invalid workspace type for '${workspace.name}'.`);
    }
    
    // Validate data before generating snippets
    validateVehicleData(vehicleData, workspace);
    
    // Track results for each update type
    const snippetResults = {
      productCard: { updated: false, error: null },
      content: { updated: false, error: null },
      collection: { updated: false, error: null }
    };
    
    // Update Collection first (the data that feeds the snippets)
    if (updateCollection) {
      let collectionData;
      if (workspace.type === 'single') {
        collectionData = vehicleData;
      } else {
        // For multi-brand workspaces, flatten all vehicle data
        collectionData = [];
        for (const brand in vehicleData) {
          if (vehicleData[brand] && vehicleData[brand].length > 0) {
            collectionData = collectionData.concat(vehicleData[brand]);
          }
        }
      }
      
      const collectionResult = updateCollectionInCustomerIO(workspace.apiKey, workspace.collectionId, collectionData);
      snippetResults.collection = collectionResult;
    }
    
    // Update Content snippet (it comes before Product Card in the email)
    if (updateContent) {
      const contentSnippet = generateSalesSpecsContent(vehicleData, workspace);
      const contentResult = updateSnippetInCustomerIO(workspace.apiKey, 'Sales-Specs-Content', contentSnippet);
      snippetResults.content = contentResult;
    }
    
    // Update Product Card snippet if selected
    if (updateProductCard) {
      const productCardSnippet = generateSalesSpecsProductCard(vehicleData, workspace);
      const productCardResult = updateSnippetInCustomerIO(workspace.apiKey, 'Sales-Specs-Product-Card', productCardSnippet);
      snippetResults.productCard = productCardResult;
    }
    
    // Check if all selected items were updated successfully
    if ((!updateProductCard || snippetResults.productCard.success) && 
        (!updateContent || snippetResults.content.success) &&
        (!updateCollection || snippetResults.collection.success)) {
      results.success++;
      const updatedItems = [];
      if (updateProductCard) updatedItems.push('Product Card');
      if (updateContent) updatedItems.push('Content');
      if (updateCollection) updatedItems.push('Collection');
      Logger.log(`✅ ${updatedItems.join(', ')} updated for ${workspace.name}`);
    } else {
      let errorMessage = "";
      if (updateProductCard && !snippetResults.productCard.success) errorMessage += `Product Card: ${snippetResults.productCard.error}. `;
      if (updateContent && !snippetResults.content.success) errorMessage += `Content: ${snippetResults.content.error}. `;
      if (updateCollection && !snippetResults.collection.success) errorMessage += `Collection: ${snippetResults.collection.error}`;
      throw new Error(errorMessage);
    }
  } catch (error) {
    results.alerts.push(`Error for ${workspace.name}: ${error.message}`);
    results.failure++;
    Logger.log(`❌ Error for ${workspace.name}: ${error.message}`);
  }
});

Logger.log(`Completed: ${results.success} successful, ${results.failure} failed`);

let completionMessage = `Bulk Update Complete\n\n${results.success} successful\n${results.failure} failed`;
if (results.alerts.length > 0) {
  completionMessage += `\n\nAlerts:\n- ${results.alerts.join('\n- ')}`;
}

try {
  SpreadsheetApp.getUi().alert(completionMessage);
} catch (e) {
  Logger.log("Could not display UI alert. Script was likely run from the editor or a trigger.");
  Logger.log(completionMessage);
}

return results;
}

/**
* Gets all vehicle data for a specific dealership from the target spreadsheet.
* @param {GoogleAppsScript.Spreadsheet.Sheet} sheet The sheet to get data from.
* @param {string} dealershipName The name of the dealership to filter by.
* @returns {Object[]} An array of vehicle objects.
*/
function getVehicleDataForDealership(sheet, dealershipName) {
const data = sheet.getDataRange().getValues();
const headers = data[0];
const vehicleData = [];

// Log all headers to debug column reading issues
Logger.log(`DEBUG: Found ${headers.length} columns in sheet:`);
Logger.log(`Headers: ${headers.join(', ')}`);

const dealershipIndex = headers.indexOf("Dealership");
if (dealershipIndex === -1) {
  throw new Error("Required column 'Dealership' not found in spreadsheet");
}

for (let i = 1; i < data.length; i++) {
  const row = data[i];
  const rowDealership = row[dealershipIndex];
  
  if (rowDealership && rowDealership.trim() === dealershipName) {
    const vehicle = {};
    
    // Map each column to a property in the vehicle object
    // Make sure we read ALL columns, not just the ones with headers
    for (let colIndex = 0; colIndex < Math.max(headers.length, row.length); colIndex++) {
      const header = headers[colIndex];
      const value = row[colIndex];
      
      if (header && header.trim()) {
        vehicle[header.trim()] = value;
      } else if (colIndex < row.length && value) {
        // Handle columns that might have values but no header
        Logger.log(`WARNING: Found data in column ${colIndex} with no header: ${value}`);
      }
    }
    
    vehicleData.push(vehicle);
  }
}

return vehicleData;
}

/**
* Validates vehicle data before generating snippets.
* CORRECTED: Added better error handling and logging
* @param {Object|Object[]} vehicleData The vehicle data to validate.
* @param {Object} workspace The workspace configuration.
* @throws {Error} If validation fails.
*/
function validateVehicleData(vehicleData, workspace) {
const requiredFields = ['VDP_URL_1', 'Year_Model_Trim', 'LeasePrice'];

if (workspace.type === 'single') {
  // Single dealership validation
  if (!Array.isArray(vehicleData) || vehicleData.length === 0) {
    throw new Error(`No vehicles found for ${workspace.dealership}`);
  }
  
  // Check each vehicle for required fields
  vehicleData.forEach((vehicle, index) => {
    requiredFields.forEach(field => {
      if (!vehicle[field] || vehicle[field] === '') {
        Logger.log(`WARNING: Missing required field '${field}' for vehicle #${index + 1} in ${workspace.dealership}`);
        Logger.log(`Vehicle data: ${JSON.stringify(vehicle)}`);
      }
    });
  });
} else if (workspace.type === 'multi') {
  // Multi-dealership validation
  for (const brand in vehicleData) {
    const brandVehicles = vehicleData[brand];
    if (!Array.isArray(brandVehicles) || brandVehicles.length === 0) {
      throw new Error(`No vehicles found for ${workspace.dealerships[brand]}`);
    }
    
    // Check each vehicle for required fields
    brandVehicles.forEach((vehicle, index) => {
      requiredFields.forEach(field => {
        if (!vehicle[field] || vehicle[field] === '') {
          Logger.log(`WARNING: Missing required field '${field}' for vehicle #${index + 1} in ${workspace.dealerships[brand]}`);
          Logger.log(`Vehicle data: ${JSON.stringify(vehicle)}`);
        }
      });
    });
  }
}
}

/**
* Updates a Customer.io collection with vehicle data.
* @param {string} apiKey The API key for the workspace.
* @param {number} collectionId The ID of the collection to update.
* @param {Object[]} vehicleData Array of vehicle objects to upload.
* @returns {{success: boolean, error: string|null}} Result object.
*/
function updateCollectionInCustomerIO(apiKey, collectionId, vehicleData) {
const result = { success: false, error: null };

try {
  const url = `https://api.customer.io/v1/collections/${collectionId}`;
  const payload = { 
    data: vehicleData 
  };
  const options = {
    method: 'put',
    contentType: 'application/json',
    headers: { "Authorization": "Bearer " + apiKey },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(url, options);
  const responseCode = response.getResponseCode();
  
  if (responseCode >= 200 && responseCode < 300) {
    result.success = true;
  } else {
    result.error = `API Error (${responseCode}): ${response.getContentText()}`;
  }
} catch (error) {
  result.error = error.message;
}

return result;
}

/**
* Updates a single snippet in Customer.io.
* @param {string} apiKey The API key for the workspace.
* @param {string} snippetName The name of the snippet to update.
* @param {string} snippetContent The HTML content for the snippet.
* @returns {{success: boolean, error: string|null}} Result object.
*/
function updateSnippetInCustomerIO(apiKey, snippetName, snippetContent) {
const result = { success: false, error: null };

try {
  const url = "https://api.customer.io/v1/snippets";
  const payload = { name: snippetName, value: snippetContent };
  const options = {
    method: 'put',
    contentType: 'application/json',
    headers: { "Authorization": "Bearer " + apiKey },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(url, options);
  const responseCode = response.getResponseCode();
  
  if (responseCode >= 200 && responseCode < 300) {
    result.success = true;
  } else {
    result.error = `API Error (${responseCode}): ${response.getContentText()}`;
  }
} catch (error) {
  result.error = error.message;
}

return result;
}

/**
* Generates the Sales Specs Product Card snippet HTML.
* CORRECTED: Fixed to generate static HTML with actual vehicle data
* @param {Object|Object[]} vehicleData The vehicle data to use.
* @param {Object} workspace The workspace configuration.
* @returns {string} The full HTML string for the product card snippet.
*/
function generateSalesSpecsProductCard(vehicleData, workspace) {
// Return the original template content with Liquid code for collections
// Using string concatenation to avoid template literal conflicts
var template = '<!-- Sales-Specs-Product-Card -->\n';
template += '<style>\n';
template += '.customer-io-amount-large,.c-l{font-size:24px!important}\n';
template += '.customer-io-amount-small,.c-s{font-size:32px!important}\n';
template += '[data-amount-size="24px"] span{font-size:24px!important}\n';
template += '[data-amount-size="32px"] span{font-size:32px!important}\n';
template += '@media only screen and (max-width:600px){\n';
template += '.es-m-p20b{padding-bottom:20px!important}\n';
template += '.es-m-p0r{padding-right:0!important}\n';
template += '.es-m-p0l{padding-left:0!important}\n';
template += '.es-m-p0t{padding-top:0!important}\n';
template += '.es-m-p0b{padding-bottom:0!important}\n';
template += '.es-m-txt-c,.es-m-txt-c h1,.es-m-txt-c h2,.es-m-txt-c h3,.es-m-txt-c p{text-align:center!important}\n';
template += '.es-m-txt-r{text-align:right!important}\n';
template += '.es-m-txt-l{text-align:left!important}\n';
template += '.es-m-txt-c img{display:inline!important}\n';
template += '.es-left,.es-right{width:100%!important}\n';
template += '.es-button-border{display:block!important}\n';
template += '.es-button{font-size:16px!important;display:block!important;border-left-width:0!important;border-right-width:0!important}\n';
template += '.es-adaptive table,.es-left,.es-right{width:100%!important}\n';
template += '.es-content table,.es-header table,.es-footer table,.es-content,.es-footer,.es-header{width:100%!important;max-width:600px!important}\n';
template += '.adapt-img{width:100%!important;height:auto!important}\n';
template += '.vehicle-tag{width:100%!important;text-align:center!important;padding-bottom:10px!important}\n';
template += '.vehicle-tag div{display:inline-block!important;margin:0 auto!important}\n';
template += '}\n';
template += '</style>\n\n';

// Simple vehicle loop for all workspace types
template += '{% for vehicle in customer["Sales-Specs-Recs"] %}\n';
template += '<table cellpadding="0" cellspacing="0" class="es-content" align="center" role="none" style="mso-table-lspace:0;mso-table-rspace:0;border-collapse:collapse;border-spacing:0;table-layout:fixed!important;width:100%">\n';
template += '<tr><td align="center" style="padding:0">\n';
template += '<table bgcolor="#fff" class="es-content-body" align="center" cellpadding="0" cellspacing="0" role="none" style="mso-table-lspace:0;mso-table-rspace:0;border-collapse:collapse;border-spacing:0;background-color:#FFF;width:600px">\n';
template += '<tr><td align="left" bgcolor="#efefef" style="Margin:0;padding:20px;background-color:#efefef">\n';
template += '<!--[if mso]><table style="width:560px" cellpadding="0" cellspacing="0"><tr><td style="width:270px" valign="top"><![endif]-->\n';
template += '<table cellpadding="0" cellspacing="0" class="es-left" align="left" role="none" style="mso-table-lspace:0;mso-table-rspace:0;border-collapse:collapse;border-spacing:0;float:left">\n';
template += '<tr><td class="es-m-p20b" align="left" style="padding:0;width:270px">\n';
template += '<table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;border-collapse:collapse;border-spacing:0">\n';
template += '<tr><td align="left" style="padding:0;padding-bottom:10px">\n';
template += '{% if vehicle.PurchaseType == "Pre-Owned" %}\n';
template += '<div class="vehicle-tag" style="Margin:0;padding:0 0 10px 0;width:auto"><div class="es-m-txt-c" style="Margin:0;line-height:20px;font-family:arial,\'helvetica neue\',helvetica,sans-serif;font-size:12px;font-weight:bold;color:#fff;display:inline-block;background-color:#6c757d;padding:5px 10px;border-radius:3px;text-transform:uppercase">PRE-OWNED</div></div>\n';
template += '{% else %}\n';
template += '<div class="vehicle-tag" style="Margin:0;padding:0 0 10px 0;width:auto"><div class="es-m-txt-c" style="Margin:0;line-height:20px;font-family:arial,\'helvetica neue\',helvetica,sans-serif;font-size:12px;font-weight:bold;color:#fff;display:inline-block;background-color:#343a40;padding:5px 10px;border-radius:3px;text-transform:uppercase">NEW</div></div>\n';
template += '{% endif %}\n';
template += '<h2 class="es-m-txt-c" style="Margin:0;line-height:38px;font-family:arial,\'helvetica neue\',helvetica,sans-serif;font-size:32px;font-weight:bold;color:#010000">{{ vehicle.Year_Model_Trim | default: "2025 New Vehicle" }}</h2>\n';
template += '</td></tr>\n';
template += '<tr><td align="center" style="padding:0;font-size:0">\n';
template += '<a target="_blank" href="{{ vehicle.VDP_URL_1 }}" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;text-decoration:underline;color:#2CB543;font-size:14px"><img class="adapt-img" src="{{ vehicle.Vehicle_Image | default: \'https://placeholder.com/272x204\' }}" alt="{{ vehicle.Year_Model_Trim | default: \'2025 New Vehicle\' }}" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;width:100%;height:auto" width="270"></a>\n';
template += '</td></tr></table></td></tr></table>\n';
template += '<!--[if mso]></td><td style="width:20px"></td><td style="width:270px" valign="top"><![endif]-->\n';
template += '<table cellpadding="0" cellspacing="0" class="es-right" align="right" role="none" style="mso-table-lspace:0;mso-table-rspace:0;border-collapse:collapse;border-spacing:0;float:right">\n';
template += '<tr><td align="left" style="padding:0;width:270px">\n';
template += '<table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;border-collapse:collapse;border-spacing:0;background-color:#fff;border-radius:5px">\n';
template += '<tr><td align="left" class="vehicle-details" style="padding:20px 20px 10px 20px;Margin:0">\n';
template += '<p class="es-m-txt-c" style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;font-family:\'source sans pro\',\'helvetica neue\',helvetica,arial,sans-serif;line-height:47px;color:#000;font-size:18px"><strong>{% if vehicle.LeasePrice contains "OFF MSRP" %}Save{% elsif vehicle.PurchaseType == "Pre-Owned" %}Lease for{% else %}{{ vehicle.PurchaseType | default: "Lease" }} for{% endif %}</strong></p>\n';
template += '<p class="lease-price es-m-txt-c" style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;font-family:\'source sans pro\',\'helvetica neue\',helvetica,arial,sans-serif;line-height:60px;color:#000;font-size:40px"><strong>{% if vehicle.LeasePrice contains "%" %}<span style="font-size:40px;line-height:60px">{{ vehicle.LeasePrice }}</span><span style="font-size:24px"> APR*</span>{% elsif vehicle.LeasePrice contains "OFF MSRP" %}<span style="font-size:40px;line-height:60px">${{ vehicle.LeasePrice | split: " OFF MSRP" | first }}</span><span style="font-size:24px"> OFF MSRP*</span>{% else %}<span style="font-size:40px;line-height:60px">${{ vehicle.LeasePrice }}</span><span style="font-size:24px">/MO*</span>{% endif %}</strong></p>\n';
template += '{% if vehicle.LeaseTerm != blank %}<p class="es-m-txt-c" style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;font-family:\'source sans pro\',\'helvetica neue\',helvetica,arial,sans-serif;line-height:41px;color:#000;font-size:14px">For {{ vehicle.LeaseTerm }} MOS</p>{% endif %}\n';
template += '{% if vehicle.DueAtSigning != blank %}<p class="es-m-txt-c" style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;font-family:\'source sans pro\',\'helvetica neue\',helvetica,arial,sans-serif;line-height:21px;color:#000;font-size:14px">{% assign due_raw = vehicle.DueAtSigning | replace: "$", "" | replace: ",", "" | strip %}<span style="{% if due_raw.size >= 4 %}font-size:24px;line-height:28px;{% else %}font-size:32px;line-height:36px;{% endif %}font-weight:bold;display:block;color:#000;">${{ due_raw | format_number }}</span><span style="font-size:14px;line-height:18px;color:#000;">Due from customer at lease signing</span></p>{% endif %}\n';
template += '{% if vehicle.Description != blank %}<p class="es-m-txt-c" style="Margin:10px 0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;font-family:\'source sans pro\',\'helvetica neue\',helvetica,arial,sans-serif;line-height:21px;color:#000;font-size:12px">{{ vehicle.Description }}</p>{% endif %}\n';
template += '<p class="es-m-txt-c" style="Margin:10px 0 0 0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;font-family:\'source sans pro\',\'helvetica neue\',helvetica,arial,sans-serif;line-height:21px;color:#000;font-size:14px">{{ vehicle.Stock }}</p>\n';
template += '</td></tr>\n';
template += '<tr><td align="left" style="padding:10px 20px 10px 20px;Margin:0">\n';
template += '<!--[if mso]><a href="{{ vehicle.VDP_URL_1 }}" target="_blank" hidden><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" esdevVmlButton href="{{ vehicle.VDP_URL_1 }}" style="height:41px;v-text-anchor:middle;width:100%" arcsize="5%" stroke="f" fillcolor="#000000"><w:anchorlock></w:anchorlock><center style=\'color:#fff;font-family:helvetica,"helvetica neue",arial,verdana,sans-serif;font-size:15px;font-weight:400;line-height:15px;mso-text-raise:1px\'>Claim Offer</center></v:roundrect></a><![endif]-->\n';
template += '<!--[if !mso]><!-- --><span class="msohide es-button-border" style="border-style:solid;border-color:#2CB543;background:#000;border-width:0;display:block;border-radius:5px;width:100%;mso-hide:all"><a href="{{ vehicle.VDP_URL_1 }}" class="es-button" target="_blank" style="mso-style-priority:100!important;text-decoration:none;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;color:#FFF;font-size:18px;padding:10px 0;display:block;background:#000;border-radius:5px;font-family:helvetica,\'helvetica neue\',arial,verdana,sans-serif;line-height:22px;width:100%;text-align:center;mso-padding-alt:0;mso-border-alt:10px solid #000">Claim Offer</a></span><!--<![endif]-->\n';
template += '</td></tr>\n';
template += '<tr><td align="left" style="padding:0 20px 20px 20px;Margin:0">\n';
template += '<!--[if mso]><a href="tel:{{ vehicle.dealership_phone }}" target="_blank" hidden><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" esdevVmlButton href="tel:{{ vehicle.dealership_phone }}" style="height:41px;v-text-anchor:middle;width:100%" arcsize="5%" stroke="f" fillcolor="#000000"><w:anchorlock></w:anchorlock><center style=\'color:#fff;font-family:helvetica,"helvetica neue",arial,verdana,sans-serif;font-size:15px;font-weight:400;line-height:15px;mso-text-raise:1px\'>Call Now</center></v:roundrect></a><![endif]-->\n';
template += '<!--[if !mso]><!-- --><span class="msohide es-button-border" style="border-style:solid;border-color:#2CB543;background:#000;border-width:0;display:block;border-radius:5px;width:100%;mso-hide:all"><a href="tel:{{ vehicle.dealership_phone }}" class="es-button" target="_blank" style="mso-style-priority:100!important;text-decoration:none;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;color:#FFF;font-size:18px;padding:10px 0;display:block;background:#000;border-radius:5px;font-family:helvetica,\'helvetica neue\',arial,verdana,sans-serif;line-height:22px;width:100%;text-align:center;mso-padding-alt:0;mso-border-alt:10px solid #000">Call Now</a></span><!--<![endif]-->\n';
template += '</td></tr></table></td></tr></table>\n';
template += '<!--[if mso]></td></tr></table><![endif]-->\n';
template += '</td></tr></table></td></tr></table>\n';

// Add footer banner if footer_banner field exists
template += '{% if vehicle.footer_banner != blank %}\n';
template += '<table cellpadding="0" cellspacing="0" class="es-content" align="center" role="none" style="mso-table-lspace:0;mso-table-rspace:0;border-collapse:collapse;border-spacing:0;table-layout:fixed!important;width:100%">\n';
template += '<tr><td align="center" class="esd-stripe" style="padding:0">\n';
template += '<table cellpadding="0" bgcolor="transparent" align="center" width="600" cellspacing="0" class="es-header-body" style="background-color:transparent">\n';
template += '<tbody><tr><td align="left" bgcolor="#ffffff" class="esd-structure" style="background-color:#ffffff">\n';
template += '<table width="100%" cellpadding="0" cellspacing="0"><tbody>\n';
template += '<tr><td width="600" align="left" class="esd-container-frame">\n';
template += '<table cellpadding="0" cellspacing="0" width="100%" role="presentation"><tbody>\n';
template += '<tr><td align="center" class="esd-block-image" style="font-size:0">\n';
template += '<a target="_blank" href="{{ vehicle.New_Specials_url | default: \'#\' }}">\n';
template += '<img src="{{ vehicle.footer_banner }}" alt="" width="600" class="adapt-img">\n';
template += '</a></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></table>\n';
template += '{% endif %}\n';

// Close the vehicle loop
template += '{% endfor %}';

return template;
}


/**
* Generates the Sales Specs Content snippet HTML.
* FIXED_FALLBACKS: Fixed to use primary brand data for all fallback cases
* @param {Object|Object[]} vehicleData The vehicle data to use.
* @param {Object} workspace The workspace configuration.
* @returns {string} The full HTML string for the content snippet.
*/
function generateSalesSpecsContent(vehicleData, workspace) {
// Handle multi-dealership vs single dealership data formats
let processedData = [];
let dealershipName = '';

if (workspace.type === 'single') {
  processedData = vehicleData;
  dealershipName = workspace.dealership;
} else if (workspace.type === 'multi') {
  // For multi-dealerships, determine brand based on customer's desired make
  // This will be resolved at email send time using Customer.io conditional logic
  const brandKeys = Object.keys(workspace.dealerships);
  
  // Create brand-specific content sections that will be conditionally shown
  // The Content snippet will use Liquid conditionals to show the right brand's content
  let primaryBrand = null;
  
  // For generation purposes, we'll prioritize brands but the actual filtering
  // happens in the HTML using Customer.io conditional logic
  // Priority order: first brand in configuration, then others
  primaryBrand = brandKeys[0];
  dealershipName = workspace.dealerships[primaryBrand];
  
  // Combine all brands' data but maintain brand separation for conditional logic
  processedData = [];
  
  // Add vehicles from all brands, prioritizing the first brand
  for (const brand of brandKeys) {
    if (vehicleData[brand] && vehicleData[brand].length > 0) {
      const brandVehicles = vehicleData[brand].slice();
      brandVehicles.forEach(vehicle => {
        if (!vehicle.Make) vehicle.Make = brand;
        // Add brand priority for conditional display
        vehicle._brandPriority = brand === primaryBrand ? 1 : 2;
      });
      
      if (brand === primaryBrand) {
        // Primary brand vehicles go first
        processedData = brandVehicles.concat(processedData);
      } else {
        // Other brands go after
        processedData = processedData.concat(brandVehicles);
      }
    }
  }
  
  // Store brand information for conditional content generation
  processedData._brands = brandKeys;
  processedData._dealerships = workspace.dealerships;
} else {
  throw new Error('Invalid workspace type');
}

// Check if we have any vehicles
if (!processedData || processedData.length === 0) {
  Logger.log("WARNING: No vehicle data available for content generation");
  processedData = [{}]; // Create empty vehicle to prevent errors
}

// Get the first vehicle for hero and general information
const firstVehicle = processedData[0];

// Log the available fields for debugging
Logger.log("DEBUG [generateSalesSpecsContent] - First vehicle data:");
Logger.log(JSON.stringify(firstVehicle));
Logger.log(`Hero_Image value: ${firstVehicle.Hero_Image || 'NOT FOUND'}`);
Logger.log(`New_Specials_url value: ${firstVehicle.New_Specials_url || 'NOT FOUND'}`);
Logger.log(`Lifestyle_Body_Title value: ${firstVehicle.Lifestyle_Body_Title || 'NOT FOUND'}`);
Logger.log(`Lifestyle_Body value: ${firstVehicle.Lifestyle_Body || 'NOT FOUND'}`);

// Get the hero image URL from the vehicle data - check multiple possible field names
const heroImageUrl = firstVehicle.Hero_Image || 
  firstVehicle['Hero_Image'] ||
  firstVehicle.Main_Photo ||
  '#';

// Get the specials URL for buttons - check multiple possible field names
const specialsUrl = firstVehicle.New_Specials_url || 
  firstVehicle['New_Specials_url'] ||
  firstVehicle.Specials_URL ||
  `https://www.swickardacuraofthousandoaks.com/newspecials.html`;
  
// Get the lifestyle content from CSV data - check multiple possible field names
const lifestyleTitle = firstVehicle.Lifestyle_Body_Title || 
  firstVehicle['Lifestyle_Body_Title'] ||
  firstVehicle.Hero_Text ||
  "Our 4th of July Sale-A-Bration is almost over, but there's still time to lock in a great rate on your next vehicle.";
  
// Process the lifestyle body to handle any HTML tags - check multiple possible field names
let lifestyleBody = firstVehicle.Lifestyle_Body || 
  firstVehicle['Lifestyle_Body'] ||
  firstVehicle.Secondary_Text ||
  "Take advantage of this limited-time opportunity and reserve your ride today.";

// Split at <br><br> and wrap the second part in <strong> tags
const lifestyleBodyParts = lifestyleBody.split('<br><br>');
const lifestyleBodyFirst = lifestyleBodyParts[0] || lifestyleBody;
const lifestyleBodySecond = lifestyleBodyParts[1] || "Take advantage of this limited-time opportunity and reserve your ride today.";

// Create the HTML template with conditional logic for multi-brand workspaces
let html = '';

if (workspace.type === 'multi') {
  // Generate conditional content for each brand in multi-brand workspaces
  html = generateMultiBrandContentWithConditionals(processedData, workspace);
} else {
  // Generate standard single-brand content
  html = generateSingleBrandContent(processedData, workspace, heroImageUrl, specialsUrl, lifestyleBodyFirst, lifestyleBodySecond);
}

return html;
}

/**
* Generates conditional content for multi-brand workspaces using Customer.io merge tags
* FIXED_FALLBACKS: Uses primary brand data for all fallback cases
*/
function generateMultiBrandContentWithConditionals(processedData, workspace) {
const brands = processedData._brands;
const dealerships = processedData._dealerships;

let html = '<!-- Sales-Specs-Content - Multi-Brand with Conditionals -->\n';

// Add minimal CSS
html += '<style>@media(max-width:600px){.mobile-padding{padding:20px 10px!important}.mobile-text{padding:10px!important}.adapt-img{width:100%!important}}</style>\n';

// FIXED: Use primary brand (first brand) for all fallback content
const primaryBrand = brands[0];
const primaryBrandVehicles = processedData.filter(v => v.Make === primaryBrand);
let primaryVehicle = null;

if (primaryBrandVehicles.length > 0) {
  primaryVehicle = primaryBrandVehicles[0];
} else {
  // If no primary brand vehicles, use the first available vehicle
  for (const brand of brands) {
    const brandVehicles = processedData.filter(v => v.Make === brand);
    if (brandVehicles.length > 0) {
      primaryVehicle = brandVehicles[0];
      break;
    }
  }
  // Ultimate fallback
  if (!primaryVehicle) {
    primaryVehicle = processedData[0] || {};
  }
}

// Extract primary brand data for consistent fallbacks
const primaryHeroImageUrl = primaryVehicle.Hero_Image || primaryVehicle.Main_Photo || '#';
const primarySpecialsUrl = primaryVehicle.New_Specials_url || primaryVehicle.Specials_URL || '#';
const primaryLifestyleBodyFirst = primaryVehicle.Lifestyle_Body_Title || "Our 4th of July Sale-A-Bration is almost over, but there's still time to lock in a great rate on your next vehicle.";
const primaryLifestyleBodySecond = primaryVehicle.Lifestyle_Body || "Take advantage of this limited-time opportunity and reserve your ride today.";

Logger.log(`FIXED_FALLBACKS: Using primary brand ${primaryBrand} for fallbacks`);
Logger.log(`Primary brand fallback data: hero=${primaryHeroImageUrl}, specials=${primarySpecialsUrl}`);

// Generate a single snippet with case logic for each field
// Build case logic for hero image
let heroImageCase = '{% case customer.Desired-Make %}';
let specialsUrlCase = '{% case customer.Desired-Make %}';
let lifestyleBodyFirstCase = '{% case customer.Desired-Make %}';
let lifestyleBodySecondCase = '{% case customer.Desired-Make %}';

for (let i = 0; i < brands.length; i++) {
  const brand = brands[i];
  const brandVehicles = processedData.filter(v => v.Make === brand);
  if (brandVehicles.length === 0) continue;
  
  const firstVehicle = brandVehicles[0];
  // FIXED: Use primary brand data as fallback for missing brand-specific data
  const heroImageUrl = firstVehicle.Hero_Image || firstVehicle.Main_Photo || primaryHeroImageUrl;
  const specialsUrl = firstVehicle.New_Specials_url || firstVehicle.Specials_URL || primarySpecialsUrl;
  const lifestyleBodyFirst = firstVehicle.Lifestyle_Body_Title || primaryLifestyleBodyFirst;
  const lifestyleBodySecond = firstVehicle.Lifestyle_Body || primaryLifestyleBodySecond;
  
  heroImageCase += `{% when "${brand}" %}${heroImageUrl}`;
  specialsUrlCase += `{% when "${brand}" %}${specialsUrl}`;
  lifestyleBodyFirstCase += `{% when "${brand}" %}${lifestyleBodyFirst}`;
  lifestyleBodySecondCase += `{% when "${brand}" %}${lifestyleBodySecond}`;
}

// FIXED: Add fallback using primary brand data for consistency
heroImageCase += `{% else %}${primaryHeroImageUrl}`;
specialsUrlCase += `{% else %}${primarySpecialsUrl}`;
lifestyleBodyFirstCase += `{% else %}${primaryLifestyleBodyFirst}`;
lifestyleBodySecondCase += `{% else %}${primaryLifestyleBodySecond}`;

heroImageCase += '{% endcase %}';
specialsUrlCase += '{% endcase %}';
lifestyleBodyFirstCase += '{% endcase %}';
lifestyleBodySecondCase += '{% endcase %}';

// Generate single content section using case logic directly for all fields
html += generateBrandContentSection(heroImageCase, specialsUrlCase, lifestyleBodyFirstCase, lifestyleBodySecondCase);

return html;
}

/**
* Generates a single brand content section
*/
function generateBrandContentSection(heroImageUrl, specialsUrl, lifestyleBodyFirst, lifestyleBodySecond) {
const s="mso-table-lspace:0;mso-table-rspace:0;border-collapse:collapse;border-spacing:0";const f="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
return `<table cellpadding="0" width="100%" cellspacing="0" style="${s};padding:0;width:100%;height:100%;background:#F6F6F6">\n` +
  `  <tr><td valign="top" style="padding:0">\n` +
  `    <table align="center" cellspacing="0" cellpadding="0" style="${s};width:100%;table-layout:fixed!important;background:transparent">\n` +
  `      <tr><td align="center" bgcolor="#fff" style="padding:0;background:#fff">\n` +
  `        <table cellpadding="0" bgcolor="#000" align="center" cellspacing="0" style="${s};background:#000;width:600px">\n` +
  `          <tr><td align="left" style="padding:0">\n` +
  `            <table width="100%" cellpadding="0" cellspacing="0" style="${s}">\n` +
  `              <tr><td align="left" style="padding:0;width:600px">\n` +
  `                <table cellspacing="0" width="100%" role="presentation" cellpadding="0" style="${s}">\n` +
  `                  <tr><td align="center" style="padding:0;font-size:0">\n` +
  `                    <a target="_blank" href="${specialsUrl}" style="text-decoration:underline;color:#2CB543;font-size:14px">\n` +
  `                      <img src="${heroImageUrl}" alt="Sales Specials" width="600" title="Sales Specials" class="adapt-img" style="display:block;font-size:14px;border:0;outline:none;text-decoration:none;width:100%;max-width:600px;height:auto">\n` +
  `                    </a></td></tr>\n` +
  `                  <tr><td align="center" bgcolor="#ffffff" style="Margin:0;padding-top:25px;padding-right:50px;padding-bottom:20px;padding-left:50px">\n` +
  `                    <span style="border-style:solid;border-color:#2CB543;background:#000000;border-width:0px;display:block;border-radius:5px;width:auto">\n` +
  `                      <a href="${specialsUrl}" target="_blank" style="mso-style-priority:100 !important;text-decoration:none !important;color:#fff;font-size:18px;padding:13px 20px 13px 20px;display:block;background:#000000;border-radius:5px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21.6px;text-align:center;letter-spacing:0">Claim Offer</a>\n` +
  `                    </span></td></tr>\n` +
  `                </table></td></tr>\n` +
  `            </table></td></tr>\n` +
  `          <tr><td align="left" style="padding:0">\n` +
  `            <table cellspacing="0" width="100%" cellpadding="0" style="${s}">\n` +
  `              <tr><td align="left" class="mobile-padding" style="Margin:0;padding-top:25px;padding-bottom:20px;padding-right:25px;padding-left:25px;width:550px">\n` +
  `                <table cellpadding="0" cellspacing="0" width="100%" role="presentation" bgcolor="#000000" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background:#000">\n` +
 +
  `                  <tr><td align="left" style="Margin:0;padding-top:25px;padding-left:25px;padding-right:150px;padding-bottom:25px;font-size:0">\n` +
  `                    <table height="100%" cellpadding="0" cellspacing="0" border="0" width="100%" style="${s}">\n` +
  `                      <tr><td style="padding:0;border-bottom:1px solid #ccc;background:none;height:0px;width:100%;margin:0px"></td></tr>\n` +
  `                    </table></td></tr>\n` +
  `                  <tr><td align="left" class="mobile-text" style="Margin:0;padding-left:25px;padding-top:10px;padding-right:25px;padding-bottom:10px">\n` +
  `                    <p style="Margin:0;font-family:${f};line-height:24px;color:#fff;font-size:16px">${lifestyleBodyFirst}</p>\n` +
  `                    <p style="Margin:0;font-family:${f};line-height:21px;color:#fff;font-size:14px"><br></p>\n` +
  `                    <p style="Margin:0;font-family:${f};line-height:24px;color:#fff;font-size:16px"><strong>${lifestyleBodySecond}</strong></p>\n` +
  `                  </td></tr>\n` +
  `                  <tr><td align="left" style="Margin:0;padding-top:25px;padding-left:25px;padding-right:150px;padding-bottom:25px;font-size:0">\n` +
  `                    <table cellpadding="0" cellspacing="0" border="0" width="100%" height="100%" style="${s}">\n` +
  `                      <tr><td style="padding:0;border-bottom:1px solid #ccc;background:none;height:0px;width:100%;margin:0px"></td></tr>\n` +
  `                    </table></td></tr>\n` +
  `                  <tr><td align="center" style="padding:0;padding-right:25px;padding-left:25px;padding-bottom:35px">\n` +
  `                    <span style="border-style:solid;border-color:#000000;background:#ffffff;border-width:0;display:block;border-radius:5px;width:auto">\n` +
  `                      <a target="_blank" href="${specialsUrl}" style="mso-style-priority:100 !important;text-decoration:none !important;color:#000000;font-size:20px;padding:13px 20px 13px 20px;display:block;background:#ffffff;border-radius:5px;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;line-height:24px;text-align:center;letter-spacing:0">View All Specials</a>\n` +
  `                    </span></td></tr>\n` +
  `                </table></td></tr>\n` +
  `            </table></td></tr>\n` +
  `        </table></td></tr>\n` +
  `    </table></td></tr>\n` +
  `</table>\n`;
}

/**
* Generates standard single-brand content
*/
function generateSingleBrandContent(processedData, workspace, heroImageUrl, specialsUrl, lifestyleBodyFirst, lifestyleBodySecond) {
const s="mso-table-lspace:0;mso-table-rspace:0;border-collapse:collapse;border-spacing:0";const f="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const html = `<!-- Sales-Specs-Content -->
<style>
@media only screen and (max-width:600px) {
.mobile-padding { padding:20px 10px!important }
.mobile-text { padding-left:10px!important;padding-right:10px!important }
.mobile-button { width:90%!important;margin:0 auto!important }
.adapt-img { width:100%!important;height:auto!important }
}
</style>
<table cellpadding="0" width="100%" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;width:100%;height:100%;background-color:#F6F6F6">
<tr>
  <td valign="top" style="padding:0">
    <table align="center" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important;background-color:transparent">
      <tr>
        <td align="center" bgcolor="#ffffff" style="padding:0;background:#fff">
          <table cellpadding="0" bgcolor="#000000" align="center" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background:#000;width:600px">
            <tr>
              <td align="left" style="padding:0">
                <table width="100%" cellpadding="0" cellspacing="0" style="${s}">
                  <tr>
                    <td align="left" style="padding:0;width:600px">
                      <table cellspacing="0" width="100%" role="presentation" cellpadding="0" style="${s}">
                        <tr>
                          <td align="center" style="padding:0;font-size:0">
                            <a target="_blank" href="${specialsUrl}" style="text-decoration:underline;color:#2CB543;font-size:14px">
                              <img src="${heroImageUrl}" alt="Sales Specials" width="600" title="Sales Specials" class="adapt-img" style="display:block;font-size:14px;border:0;outline:none;text-decoration:none;width:100%;max-width:600px;height:auto">
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" bgcolor="#ffffff" style="Margin:0;padding-top:25px;padding-right:50px;padding-bottom:20px;padding-left:50px">
                            <span style="border-style:solid;border-color:#2CB543;background:#000000;border-width:0px;display:block;border-radius:5px;width:auto">
                              <a href="${specialsUrl}" target="_blank" style="mso-style-priority:100 !important;text-decoration:none !important;color:#fff;font-size:18px;padding:13px 20px 13px 20px;display:block;background:#000000;border-radius:5px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21.6px;text-align:center;letter-spacing:0">Claim Offer</a>
                            </span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td align="left" style="padding:0">
                <table cellspacing="0" width="100%" cellpadding="0" style="${s}">
                  <tr>
                    <td align="left" class="mobile-padding" style="Margin:0;padding-top:25px;padding-bottom:20px;padding-right:25px;padding-left:25px;width:550px">
                      <table cellpadding="0" cellspacing="0" width="100%" role="presentation" bgcolor="#000000" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background:#000">
                        <tr>
                          <td align="left" style="padding:0;padding-top:25px;padding-right:30px;padding-left:30px">
                            <p style="Margin:0;font-family:${f};line-height:30px;color:#fff;font-size:20px">
                              <strong>{{customer["Client-First-Name/Business-Name"] | default: "Hello" | downcase | capitalize}},</strong>
                            </p>
                          </td>
                        </tr>
                        <tr>
                          <td align="left" style="Margin:0;padding-top:25px;padding-left:25px;padding-right:150px;padding-bottom:25px;font-size:0">
                            <table height="100%" cellpadding="0" cellspacing="0" border="0" width="100%" style="${s}">
                              <tr>
                                <td style="padding:0;border-bottom:1px solid #ccc;background:none;height:0px;width:100%;margin:0px"></td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td align="left" class="mobile-text" style="Margin:0;padding-left:25px;padding-top:10px;padding-right:25px;padding-bottom:10px">
                            <p style="Margin:0;font-family:${f};line-height:24px;color:#fff;font-size:16px">
                              ${lifestyleBodyFirst}
                            </p>
                            <p style="Margin:0;font-family:${f};line-height:21px;color:#fff;font-size:14px">
                              <br>
                            </p>
                            <p style="Margin:0;font-family:${f};line-height:24px;color:#fff;font-size:16px">
                              <strong>${lifestyleBodySecond}</strong>
                            </p>
                          </td>
                        </tr>
                        <tr>
                          <td align="left" style="Margin:0;padding-top:25px;padding-left:25px;padding-right:150px;padding-bottom:25px;font-size:0">
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" height="100%" style="${s}">
                              <tr>
                                <td style="padding:0;border-bottom:1px solid #ccc;background:none;height:0px;width:100%;margin:0px"></td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="padding:0;padding-right:25px;padding-left:25px;padding-bottom:35px">
                            <span style="border-style:solid;border-color:#000000;background:#ffffff;border-width:0;display:block;border-radius:5px;width:auto">
                              <a target="_blank" href="${specialsUrl}" style="mso-style-priority:100 !important;text-decoration:none !important;color:#000000;font-size:20px;padding:13px 20px 13px 20px;display:block;background:#ffffff;border-radius:5px;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;line-height:24px;text-align:center;letter-spacing:0">View All Specials</a>
                            </span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </td>
</tr>
</table>`;

return html;
}

/**
* Shows a "Coming Soon" dialog for Pre-Owned Specials menu items.
* This placeholder function is called when Pre-Owned Specials features are not yet implemented.
*/
function showPreOwnedComingSoonDialog() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body {
        font-family: Arial, sans-serif;
        text-align: center;
        padding: 20px;
      }
      .coming-soon {
        font-size: 24px;
        font-weight: bold;
        color: #2196F3;
        margin: 30px 0 20px 0;
      }
      .message {
        font-size: 16px;
        color: #666;
        line-height: 1.6;
        margin-bottom: 30px;
      }
      button {
        background: #2196F3;
        color: white;
        border: none;
        padding: 10px 30px;
        font-size: 16px;
        border-radius: 5px;
        cursor: pointer;
      }
      button:hover {
        background: #1976D2;
      }
    </style>
    <div class="coming-soon">Coming Soon</div>
    <div class="message">
      Pre-Owned Specials automation is currently under development.<br>
      This feature will be available in a future update.
    </div>
    <button onclick="google.script.host.close()">OK</button>
  `).setWidth(400).setHeight(250);

  SpreadsheetApp.getUi().showModalDialog(html, 'Pre-Owned Specials');
}

/**
* Shows dialog for updating ALL Sales Specials snippets (no collections).
*/
function showAllSnippetsDialog() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; }
      #status { margin-top: 10px; font-weight: bold; color: #4CAF50;}
      #error { margin-top: 10px; font-weight: bold; color: #F44336;}
      .loader { display: none; margin-top: 10px; border: 4px solid #f3f3f3; border-radius: 50%; border-top: 4px solid #3498db; width: 20px; height: 20px; animation: spin 1s linear infinite; }
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 10px; margin: 10px 0; border-radius: 5px; }
    </style>
    <h2>Update ALL Snippets</h2>
    <p>This will update Product Card and Content snippets for all ${WORKSPACES_CONFIG.length} workspaces.</p>
    <div class="warning">
      <strong>Note:</strong> This only updates snippets, not collections.
    </div>
    <br>
    <div>
      <button onclick="this.disabled=true; runUpdate();">Update All Snippets</button>
      <button onclick="google.script.host.close()">Cancel</button>
    </div>
    <div class="loader" id="loader"></div>
    <div id="status"></div>
    <div id="error"></div>
    <script>
      function runUpdate() {
        // Show confirmation dialog before proceeding
        var confirmMessage = 'You are about to update Product Card and Content snippets for ALL ${WORKSPACES_CONFIG.length} workspaces.\\n\\nThis will make API calls to Customer.io for every workspace and cannot be undone.\\n\\nAre you sure you want to continue?';

        if (!confirm(confirmMessage)) {
          document.querySelector('button').disabled = false;
          return;
        }

        document.getElementById('loader').style.display = 'block';
        document.getElementById('status').innerText = '';
        document.getElementById('error').innerText = '';

        google.script.run
          .withSuccessHandler(function(result) {
            document.getElementById('loader').style.display = 'none';
            document.getElementById('status').innerText = 'Processing complete! Check the logs for details.';
            setTimeout(function(){ google.script.host.close(); }, 3000);
          })
          .withFailureHandler(function(error) {
            document.getElementById('loader').style.display = 'none';
            document.getElementById('error').innerText = 'Error: ' + error.message;
            document.querySelector('button').disabled = false;
          })
          .updateAllSalesSpecialsSnippets(true, true, false);
      }
    </script>
  `).setWidth(400).setHeight(300);

  SpreadsheetApp.getUi().showModalDialog(html, 'Update All Snippets');
}

/**
* Shows dialog for updating snippets for a SPECIFIC workspace.
*/
function showSpecificSnippetDialog() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; }
      #status { margin-top: 10px; font-weight: bold; color: #4CAF50;}
      #error { margin-top: 10px; font-weight: bold; color: #F44336;}
      .loader { display: none; margin-top: 10px; border: 4px solid #f3f3f3; border-radius: 50%; border-top: 4px solid #3498db; width: 20px; height: 20px; animation: spin 1s linear infinite; }
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
    <h2>Update Specific Snippet</h2>
    <p>Choose a workspace to update snippets only.</p>
    <div>
      <select id="workspace-select" style="width: 100%;">
        ${WORKSPACES_CONFIG.map(w => `<option value="${w.name}">${formatWorkspaceName(w.name)}</option>`).join('')}
      </select>
    </div>
    <br>
    <div>
      <button onclick="this.disabled=true; runUpdate();">Update Snippets</button>
      <button onclick="google.script.host.close()">Cancel</button>
    </div>
    <div class="loader" id="loader"></div>
    <div id="status"></div>
    <div id="error"></div>
    <script>
      function runUpdate() {
        var select = document.getElementById('workspace-select');
        var selectedWorkspace = select.options[select.selectedIndex].value;

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
            document.querySelector('button').disabled = false;
          })
          .processSingleWorkspaceUpdate(selectedWorkspace, true, true, false);
      }
    </script>
  `).setWidth(400).setHeight(250);

  SpreadsheetApp.getUi().showModalDialog(html, 'Update Specific Snippet');
}

/**
* Shows dialog for updating ALL Sales Specials collections at once.
*/
function showAllCollectionsDialog() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; }
      #status { margin-top: 10px; font-weight: bold; color: #4CAF50;}
      #error { margin-top: 10px; font-weight: bold; color: #F44336;}
      .loader { display: none; margin-top: 10px; border: 4px solid #f3f3f3; border-radius: 50%; border-top: 4px solid #3498db; width: 20px; height: 20px; animation: spin 1s linear infinite; }
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 10px; margin: 10px 0; border-radius: 5px; }
    </style>
    <h2>Update ALL Collections</h2>
    <p>This will update the Sales-Specs-Recs collection for all ${WORKSPACES_CONFIG.length} workspaces.</p>
    <div class="warning">
      <strong>Note:</strong> This only updates collections, not snippets.
    </div>
    <br>
    <div>
      <button onclick="this.disabled=true; runUpdate();">Update All Collections</button>
      <button onclick="google.script.host.close()">Cancel</button>
    </div>
    <div class="loader" id="loader"></div>
    <div id="status"></div>
    <div id="error"></div>
    <script>
      function runUpdate() {
        // Show confirmation dialog before proceeding
        var confirmMessage = 'You are about to update Collections for ALL ${WORKSPACES_CONFIG.length} workspaces.\\n\\nThis will make API calls to Customer.io for every workspace and cannot be undone.\\n\\nAre you sure you want to continue?';

        if (!confirm(confirmMessage)) {
          document.querySelector('button').disabled = false;
          return;
        }

        document.getElementById('loader').style.display = 'block';
        document.getElementById('status').innerText = '';
        document.getElementById('error').innerText = '';

        google.script.run
          .withSuccessHandler(function(result) {
            document.getElementById('loader').style.display = 'none';
            document.getElementById('status').innerText = 'Processing complete! Check the logs for details.';
            setTimeout(function(){ google.script.host.close(); }, 3000);
          })
          .withFailureHandler(function(error) {
            document.getElementById('loader').style.display = 'none';
            document.getElementById('error').innerText = 'Error: ' + error.message;
            document.querySelector('button').disabled = false;
          })
          .updateAllSalesSpecialsSnippets(false, false, true);
      }
    </script>
  `).setWidth(400).setHeight(300);

  SpreadsheetApp.getUi().showModalDialog(html, 'Update All Collections');
}

/**
* Shows dialog for updating Sales Specials collection only.
*/
function showSalesSpecialsCollectionDialog() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; }
      #status { margin-top: 10px; font-weight: bold; color: #4CAF50;}
      #error { margin-top: 10px; font-weight: bold; color: #F44336;}
      .loader { display: none; margin-top: 10px; border: 4px solid #f3f3f3; border-radius: 50%; border-top: 4px solid #3498db; width: 20px; height: 20px; animation: spin 1s linear infinite; }
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
    <h2>Update Sales Specials Collection</h2>
    <p>Choose a workspace to update the Sales-Specs-Recs collection.</p>
    <div><select id="workspace-select" style="width: 100%;">${WORKSPACES_CONFIG.map(w => `<option value="${w.name}">${formatWorkspaceName(w.name)}</option>`).join('')}</select></div>
    <br>
    <div>
      <button onclick="this.disabled=true; runUpdate();">Update Collection</button>
      <button onclick="google.script.host.close()">Cancel</button>
    </div>
    <div class="loader" id="loader"></div>
    <div id="status"></div>
    <div id="error"></div>
    <script>
      function runUpdate() {
        var select = document.getElementById('workspace-select');
        var selectedWorkspace = select.options[select.selectedIndex].value;

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
            document.querySelector('button').disabled = false;
          })
          .processSingleWorkspaceUpdate(selectedWorkspace, false, false, true);
      }
    </script>
  `).setWidth(400).setHeight(250);

  SpreadsheetApp.getUi().showModalDialog(html, 'Update Sales Specials Collection');
}