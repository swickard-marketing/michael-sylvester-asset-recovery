/**
 * Service Specials Automation System for Google Apps Script
 * Updates Customer.io snippets for Service Specials emails from Google Sheets data.
 * This script provides a UI menu in Google Sheets to update all workspaces at once
 * or select a specific workspace to update.
 */

/**
 * @typedef {Object} Workspace
 */

/**
 * Global configuration for all workspaces.
 * This list is used to populate the UI and drive the update process.
 * @type {Workspace[]}
 */
const SERVICE_WORKSPACES_CONFIG = [
  { name: 'ACURA_THOUSAND_OAKS', apiKey: '1fd2ddd8d2640a15a1aa8fcb62cc4433', type: 'single', dealership: 'Acura Thousand Oaks' },
  { name: 'AUDI_OAKLAND', apiKey: '5e38a490a4cb75da215ff8e077916311', type: 'single', dealership: 'Audi Oakland' },
  { name: 'AUDI_PALO_ALTO', apiKey: 'e7295eb15fb899b12b8de4d29ce68dd1', type: 'single', dealership: 'Audi Palo Alto' },
  { name: 'BMW_OF_EUGENE', apiKey: '75c00432a4fb3c5f086ae2a1ef4c1872', type: 'single', dealership: 'BMW of Eugene' },
  { name: 'BMW_OF_LYNNWOOD', apiKey: '629fb75ec206c73db80646ebf1e24a44', type: 'single', dealership: 'BMW of Lynnwood' },
  { name: 'BMW_OF_PORTLAND', apiKey: 'd32ee445bda602b49ad1ed6dfd503f9f', type: 'single', dealership: 'BMW of Portland' },
  { name: 'CHEVROLET_THOUSAND_OAKS', apiKey: '171cad5c1236a99a77a08ae34003672b', type: 'single', dealership: 'Chevrolet Thousand Oaks' },
  { name: 'CROWN_TOYOTA', apiKey: 'f32f834fd0b71b763ebcda51ae77d0ae', type: 'single', dealership: 'Crown Toyota' },
  { name: 'GRESHAM_TOYOTA', apiKey: 'cf2e4819a8f20ddddc359b0463a51d3c', type: 'single', dealership: 'Gresham Toyota' },
  { name: 'LAND_ROVER_REDWOOD_CITY', apiKey: '235a9de44560b1c718e34e3e37b98d61', type: 'single', dealership: 'Land Rover Redwood City' },
  { name: 'LAND_ROVER_SF', apiKey: '7508bfc5d5ac908875c802bb62435f7a', type: 'single', dealership: 'Land Rover San Francisco' },
  { name: 'LAND_ROVER_THOUSAND_OAKS', apiKey: '777b6593ef5dfbc3780c58f40de87d35', type: 'single', dealership: 'Land Rover Thousand Oaks' },
  { name: 'LEXUS_OF_FREMONT', apiKey: '7145206bdac834c98fe1ea754dc29d3c', type: 'single', dealership: 'Lexus of Fremont' },
  { name: 'LEXUS_OF_THOUSAND_OAKS', apiKey: '46806ce450ff12a10dd1987bb4ca7403', type: 'single', dealership: 'Lexus of Thousand Oaks' },
  { name: 'MB_HONOLULU', apiKey: '7641f8a8d9ec3bb2b2abea426d33e95e', type: 'single', dealership: 'Mercedes-Benz of Honolulu' },
  { name: 'MB_MAUI', apiKey: 'a87ead97a30341a3c31af756e67b1274', type: 'single', dealership: 'Mercedes-Benz of Maui' },
  { name: 'MERCEDES_BENZ_OF_ANCHORAGE', apiKey: '2630e6ae3e1136a5d778ae9f275fb99a', type: 'single', dealership: 'Mercedes-Benz of Anchorage' },
  { name: 'MERCEDES_BENZ_OF_MARIN', apiKey: '15c4428085013edcf1a0194c22eff6ca', type: 'single', dealership: 'Mercedes-Benz of Marin' },
  { name: 'MERCEDES_BENZ_OF_PALO_ALTO', apiKey: 'f6ab8bf9e704c04a96a6e48e0ed2fe87', type: 'single', dealership: 'Mercedes-Benz of Palo Alto' },
  { name: 'MERCEDES_BENZ_OF_SEATTLE', apiKey: 'dba69f95292704439e259c36df6c57cf', type: 'single', dealership: 'Mercedes-Benz of Seattle' },
  { name: 'MERCEDES_BENZ_OF_THOUSAND_OAKS', apiKey: '20899542d1142b2e6a0006bdccd87816', type: 'single', dealership: 'Mercedes-Benz of Thousand Oaks' },
  { name: 'MERCEDES_BENZ_OF_WILSONVILLE', apiKey: 'b48998b68625a96754ea225332628fc1', type: 'single', dealership: 'Mercedes-Benz of Wilsonville' },
  { name: 'PORSCHE_SEATTLE_NORTH', apiKey: '2ab0003f77ed82f935cc6152e867712a', type: 'single', dealership: 'Porsche Seattle North' },
  { name: 'SWICKARD_GMC_PALMER', apiKey: '63aed0dbc828a5a08123b8c2577b42ed', type: 'single', dealership: 'Swickard GMC Palmer' },
  { name: 'SWICKARD_HONDA_GLADSTONE', apiKey: 'd63203c05ac12287407cb911307f31c5', type: 'single', dealership: 'Swickard Honda Gladstone' },
  { name: 'SWICKARD_HONDA_THOUSAND_OAKS', apiKey: 'd82652ce3729849182cb06042536119e', type: 'single', dealership: 'Swickard Honda Thousand Oaks' },
  { name: 'SWICKARD_TOYOTA', apiKey: '7e9e5cf9c12188925ddce4f921270f90', type: 'single', dealership: 'Swickard Toyota' },
  { name: 'TOYOTA_101', apiKey: '02ca351088bc8e9a8b664688dbf0cf6d', type: 'single', dealership: 'Toyota 101' },
  { name: 'VOLVO_CARS_BELLEVUE', apiKey: 'c04c3f9fee56dbe240f17ea4316211ac', type: 'single', dealership: 'Volvo Cars Bellevue' },
  { name: 'VOLVO_CARS_SEATTLE', apiKey: 'eb9e61ed54eb1c2ecb580d13cc7878c3', type: 'single', dealership: 'Volvo Cars Seattle' },
  { name: 'VOLVO_CARS_SOUTHWEST_HOUSTON', apiKey: 'cf3d981ec2b6f96273f16f50513db495', type: 'single', dealership: 'Volvo Cars Southwest Houston' },

  // Multi-Dealership Groups
  { name: 'AUDI_VOLKSWAGEN_BELLINGHAM', apiKey: '6c4af2e86daa1c8cf730489c4b41db2b', type: 'multi', dealerships: { 'Audi': 'Audi Bellingham', 'Volkswagen': 'Volkswagen Bellingham' } },
  { name: 'THOUSAND_OAKS_GM_CADILLAC', apiKey: '06e5197f9d9a7119d4dc6cecf1bf9c22', type: 'multi', dealerships: { 'Buick': 'Buick, GMC Thousand Oaks', 'GMC': 'Buick, GMC Thousand Oaks', 'Cadillac': 'Cadillac Thousand Oaks' } },
  { name: 'PORSCHE_AUDI_VOLKSWAGEN_ANCHORAGE', apiKey: '2ae0afa8d034d1a81bfc4b93ab95dd0b', type: 'multi', dealerships: { 'Porsche': 'Porsche Anchorage', 'Audi': 'Audi Anchorage', 'Volkswagen': 'Volkswagen Anchorage' } },
  { name: 'ANCHORAGE_GM_CADILLAC', apiKey: '4107c3fc1225eaf3434c1d9fa2cb2ad2', type: 'multi', dealerships: { 'Cadillac': 'Cadillac Anchorage', 'Chevrolet': 'Swickard Anchorage', 'Buick': 'Swickard Anchorage', 'GMC': 'Swickard Anchorage' } }
];

/**
 * NOTE: The onOpen() function is defined in the Store Specials script.
 * That master onOpen() creates BOTH the Sales Specials and Service Specials menus.
 * Do NOT add another onOpen() function here - it will conflict.
 */

/**
 * Formats the raw workspace name for display in the UI.
 * @param {string} name The raw workspace name.
 * @returns {string} The formatted name.
 */
function formatServiceWorkspaceName(name) {
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
function getRandomServiceEmoji() {
  const vehicles = ['🚗', '🚙', '🏎️', '🚕', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🚘', '🚔', '🚖', '🚍', '🚌', '🏍️', '🛵', '🛺', '🚲', '🛴'];
  return vehicles[Math.floor(Math.random() * vehicles.length)];
}

/**
 * Shows a dialog for the user to select a single workspace to update.
 */
function showServiceSpecialsWorkspaceDialog() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; }
      #status { margin-top: 10px; font-weight: bold; color: #4CAF50;}
      #error { margin-top: 10px; font-weight: bold; color: #F44336;}
      .loader { display: none; margin-top: 10px; border: 4px solid #f3f3f3; border-radius: 50%; border-top: 4px solid #3498db; width: 20px; height: 20px; animation: spin 1s linear infinite; }
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
    <h2>Select Workspace</h2>
    <p>Choose a workspace to update Service Specials snippet.</p>
    <div><select id="workspace-select" style="width: 100%;">${SERVICE_WORKSPACES_CONFIG.map(w => `<option value="${w.name}">${formatServiceWorkspaceName(w.name)}</option>`).join('')}</select></div>
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
          .processServiceSpecialsWorkspaceUpdate(selectedWorkspace);
      }
    </script>
  `).setWidth(400).setHeight(250);

  SpreadsheetApp.getUi().showModalDialog(html, 'Update Specific Workspace');
}

/**
 * Shows a dialog for updating all workspaces.
 */
function showAllServiceSpecialsDialog() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; }
      #status { margin-top: 10px; font-weight: bold; color: #4CAF50;}
      #error { margin-top: 10px; font-weight: bold; color: #F44336;}
      .loader { display: none; margin-top: 10px; border: 4px solid #f3f3f3; border-radius: 50%; border-top: 4px solid #3498db; width: 20px; height: 20px; animation: spin 1s linear infinite; }
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
    <h2>Update All Workspaces</h2>
    <p>This will update Service Specials snippets for all configured workspaces.</p>
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
        // Show confirmation dialog before proceeding
        var confirmMessage = 'You are about to update Service Specials snippets for ALL 35 workspaces.\\n\\nThis will make API calls to Customer.io for every workspace and cannot be undone.\\n\\nAre you sure you want to continue?';

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
          .updateAllServiceSpecialsSnippets();
      }
    </script>
  `).setWidth(400).setHeight(250);

  SpreadsheetApp.getUi().showModalDialog(html, 'Update All Workspaces');
}

/**
 * Processes the update for a single workspace.
 * @param {string} workspaceName The name of the workspace to update.
 * @returns {string} A success or failure message.
 */
function processServiceSpecialsWorkspaceUpdate(workspaceName) {
  const workspace = SERVICE_WORKSPACES_CONFIG.find(w => w.name === workspaceName);
  if (!workspace) {
    throw new Error(`Workspace '${workspaceName}' not found.`);
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Service Specials Automation");

  if (!sheet) {
    throw new Error("Sheet 'Service Specials Automation' not found. Please check the sheet name.");
  }

  try {
    Logger.log(`Processing single workspace: ${workspace.name}...`);

    // Get dealership data
    let dealershipData;
    if (workspace.type === 'single') {
      dealershipData = getDealershipData(sheet, workspace.dealership);

      if (!dealershipData) {
        throw new Error(`No data found for '${workspace.dealership}' in the sheet.`);
      }
    } else if (workspace.type === 'multi') {
      // For multi-dealership workspaces, collect data for each brand
      dealershipData = {};
      for (const brand in workspace.dealerships) {
        const dealershipName = workspace.dealerships[brand];
        const data = getDealershipData(sheet, dealershipName);
        if (data) {
          dealershipData[brand] = data;
        }
      }

      if (Object.keys(dealershipData).length === 0) {
        throw new Error(`No data found for any dealerships in workspace '${workspace.name}'.`);
      }
    }

    // Generate the Service Specials snippet
    const snippet = generateServiceSpecialsSnippet(dealershipData, workspace);

    // Update the snippet in Customer.io
    const result = updateServiceSnippetInCustomerIO(workspace.apiKey, 'Service-Specials-Product-Card', snippet);

    if (result.success) {
      const message = `${getRandomServiceEmoji()} Successfully updated Service Specials snippet for ${formatServiceWorkspaceName(workspace.name)}.`;
      Logger.log(`✅ ${message}`);
      return message;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    Logger.log(`❌ Error for ${workspace.name}: ${error.message}`);
    throw error;
  }
}

/**
 * Updates Service Specials snippets for ALL configured workspaces.
 */
function updateAllServiceSpecialsSnippets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Service Specials Automation");

  if (!sheet) {
    SpreadsheetApp.getUi().alert("Error: Sheet 'Service Specials Automation' not found. Please check the sheet name.");
    return;
  }

  const results = { success: 0, failure: 0, alerts: [] };

  // Process each workspace from the global config
  SERVICE_WORKSPACES_CONFIG.forEach(workspace => {
    try {
      Logger.log(`Processing ${workspace.name}...`);

      // Get dealership data
      let dealershipData;
      if (workspace.type === 'single') {
        dealershipData = getDealershipData(sheet, workspace.dealership);

        if (!dealershipData) {
          throw new Error(`No data found for '${workspace.dealership}' in the sheet.`);
        }
      } else if (workspace.type === 'multi') {
        // For multi-dealership workspaces, collect data for each brand
        dealershipData = {};
        for (const brand in workspace.dealerships) {
          const dealershipName = workspace.dealerships[brand];
          const data = getDealershipData(sheet, dealershipName);
          if (data) {
            dealershipData[brand] = data;
          }
        }

        if (Object.keys(dealershipData).length === 0) {
          throw new Error(`No data found for any dealerships in workspace '${workspace.name}'.`);
        }
      }

      // Generate the Service Specials snippet
      const snippet = generateServiceSpecialsSnippet(dealershipData, workspace);

      // Update the snippet in Customer.io
      const result = updateServiceSnippetInCustomerIO(workspace.apiKey, 'Service-Specials-Product-Card', snippet);

      if (result.success) {
        results.success++;
        Logger.log(`✅ Service Specials updated for ${workspace.name}`);
      } else {
        throw new Error(result.error);
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
 * Gets dealership data for a specific dealership from the spreadsheet.
 * Returns an object with shared dealership info and an array of service specials.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet The sheet to get data from.
 * @param {string} dealershipName The name of the dealership to filter by.
 * @returns {Object|null} The dealership data object with specials array, or null if not found.
 */
function getDealershipData(sheet, dealershipName) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  Logger.log(`DEBUG: Found ${headers.length} columns in sheet`);
  Logger.log(`Headers: ${headers.join(', ')}`);

  const dealershipIndex = headers.indexOf("Dealership");
  if (dealershipIndex === -1) {
    throw new Error("Required column 'Dealership' not found in spreadsheet");
  }

  const specials = [];
  let sharedData = null;

  // Collect all rows for this dealership
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const rowDealership = row[dealershipIndex];

    if (rowDealership && rowDealership.trim() === dealershipName) {
      const rowData = {};

      // Map each column to a property
      for (let colIndex = 0; colIndex < headers.length; colIndex++) {
        const header = headers[colIndex];
        const value = row[colIndex];

        if (header && header.trim()) {
          rowData[header.trim()] = value;
        }
      }

      // First row contains shared data
      if (!sharedData) {
        sharedData = rowData;
      }

      // Add to specials array
      specials.push(rowData);
    }
  }

  if (!sharedData) {
    return null;
  }

  return {
    ...sharedData,
    specials: specials
  };
}

/**
 * Generates the Service Specials snippet HTML.
 * OPTIMIZED VERSION: Creates a compact HTML fragment (not full document) under 16k characters.
 * Uses Liquid template tags to dynamically populate from Customer.io data.
 * @param {Object|Object[]} dealershipData The dealership data to use.
 * @param {Object} workspace The workspace configuration.
 * @returns {string} The HTML fragment string for the service specials snippet.
 */
function generateServiceSpecialsSnippet(dealershipData, workspace) {
  // Get shared dealership info from first row
  const sharedData = workspace.type === 'single' ?
    dealershipData :
    dealershipData[Object.keys(dealershipData)[0]];

  // Helper function to get field value with multiple possible column name variations
  const getField = (data, ...possibleNames) => {
    for (const name of possibleNames) {
      if (data[name]) return data[name];
    }
    return '';
  };

  const heroImage = getField(sharedData, 'Hero_Image_URL', 'Hero Image URL', 'hero_image_url');
  const scheduleURL = getField(sharedData, 'Schedule_Service_URL', 'Schedule Service URL', 'schedule_service_url') || '#';
  const specialsURL = getField(sharedData, 'Service_Specials_URL', 'Service Specials URL', 'service_specials_url') || '#';
  const serviceMatchURL = getField(sharedData, 'Service_Match_URL', 'Service Match URL', 'service_match_url') || '#';
  const phoneNumber = getField(sharedData, 'Phone_Number', 'Phone Number', 'phone_number');
  const phoneNumberTel = getField(sharedData, 'Phone_Number_Tel', 'Phone Number Tel', 'phone_number_tel');
  const brandColor = getField(sharedData, 'Brand_Color', 'Brand Color', 'brand_color') || '#000000';
  const dealershipName = getField(sharedData, 'Dealership_Display_Name', 'Dealership Display Name', 'dealership_display_name') || workspace.dealership || 'Your Dealership';
  const expirationDate = getField(sharedData, 'Offer_Expiration_Date', 'Offer Expiration Date', 'offer_expiration_date') || '12/31/25';
  const specialDisclaimer = getField(sharedData, 'Service_Special_Disclaimer', 'Service Special Disclaimer', 'service_special_disclaimer');
  const matchDisclaimer = getField(sharedData, 'Service_Match_Disclaimer', 'Service Match Disclaimer', 'service_match_disclaimer');

  // Generate compact HTML fragment
  return generateCompactServiceSpecialsFragment(
    heroImage, scheduleURL, specialsURL, serviceMatchURL,
    phoneNumber, phoneNumberTel, brandColor, dealershipName,
    expirationDate, specialDisclaimer, matchDisclaimer
  );
}

/**
 * Generates a compact HTML fragment for Service Specials (under 16k characters).
 * Uses Liquid tags to dynamically populate from Customer.io customer data.
 * @returns {string} Compact HTML fragment with Liquid template tags.
 */
function generateCompactServiceSpecialsFragment(
  heroImage, scheduleURL, specialsURL, serviceMatchURL,
  phoneNumber, phoneNumberTel, brandColor, dealershipName,
  expirationDate, specialDisclaimer, matchDisclaimer
) {
  const s = "mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px";

  return `<!-- Service-Specials-Product-Card -->
<table cellpadding="0" width="100%" cellspacing="0" style="${s};padding:0;Margin:0;width:100%;background-color:#F6F6F6">
<tr><td valign="top" style="padding:0;Margin:0">
<table align="center" cellspacing="0" cellpadding="0" class="dg" style="${s};width:100%;table-layout:fixed !important">
<tr><td bgcolor="#ffffff" align="center" style="padding:0;Margin:0;background-color:#ffffff">
<table cellspacing="0" bgcolor="#ffffff" align="center" cellpadding="0" class="dy" style="${s};background-color:#FFFFFF;width:600px">
<tr><td align="left" style="padding:0;Margin:0">
<style type="text/css">
.rollover:hover .rollover-first{max-height:0px!important;display:none!important}
.rollover:hover .rollover-second{max-height:none!important;display:block!important}
.rollover span{font-size:0px}
u+.body img~div div{display:none}
#outlook a{padding:0}
span.MsoHyperlink,span.MsoHyperlinkFollowed{color:inherit;mso-style-priority:99}
a.i{mso-style-priority:100!important;text-decoration:none!important}
a[x-apple-data-detectors],#MessageViewBody a{color:inherit!important;text-decoration:none!important;font-size:inherit!important;font-family:inherit!important;font-weight:inherit!important;line-height:inherit!important}
.dc{display:none;float:left;overflow:hidden;width:0;max-height:0;line-height:0;mso-hide:all}
td .dq:hover a.ct{color:#000000!important}
@media only screen and (max-width:600px){
.ef{padding-top:15px!important}
.ee{padding-bottom:20px!important}
.ed{padding-top:10px!important}
.ec{padding-bottom:0px!important}
.eb{padding-bottom:10px!important}
*[class="gmail-fix"]{display:none!important}
p,a{line-height:150%!important}
h1,h1 a{line-height:120%!important}
h2,h2 a{line-height:120%!important}
h3,h3 a{line-height:120%!important}
h4,h4 a{line-height:120%!important}
h5,h5 a{line-height:120%!important}
h6,h6 a{line-height:120%!important}
h1{font-size:30px!important;text-align:left}
h2{font-size:24px!important;text-align:left}
h3{font-size:20px!important;text-align:left}
h4{font-size:24px!important;text-align:left}
h5{font-size:20px!important;text-align:left}
h6{font-size:16px!important;text-align:left}
.dz h5 a,.dy h5 a,.dx h5 a{font-size:20px!important}
.dy p,.dy a{font-size:14px!important}
.dt,.dt h1,.dt h2,.dt h3,.dt h4,.dt h5,.dt h6{text-align:center!important}
.ds .rollover:hover .rollover-second,.dt .rollover:hover .rollover-second,.du .rollover:hover .rollover-second{display:inline!important}
a.i,button.i{font-size:18px!important;padding:10px 20px 10px 20px!important;line-height:120%!important}
a.i,button.i,.dq{display:inline-block!important}
.do,.do.dp,.do .i{display:block!important}
.dj table,.dk,.dl{width:100%!important}
.dg table,.dh table,.di table,.dg,.di,.dh{width:100%!important;max-width:600px!important}
.adapt-img{width:100%!important;height:auto!important}
.h-auto{height:auto!important}
.cy .f.g,.cy .f.g *{font-size:26px!important;line-height:150%!important}
.cu .b,.cu .b *{font-size:16px!important;line-height:150%!important}
a.i.ct{padding:13px 35px!important}
a.i.cr{font-size:16px!important}
.img-2011{width:150px!important;height:auto!important}
.m .q,.m .q *{font-size:12px!important;line-height:150%!important}
.h .b.g,.h .b.g *{font-size:16px!important;line-height:150%!important}
.e .b.g,.e .b.g *{font-size:16px!important;line-height:150%!important}
.h .d,.h .d *{font-size:18px!important;line-height:150%!important}
.e .d,.e .d *{font-size:18px!important;line-height:150%!important}
.m .n,.m .n *{font-size:10px!important;line-height:150%!important}
a.i.l{padding:10px 20px!important}
a.i.k{padding:10px 20px!important}
.h .f.g,.h .f.g *{font-size:26px!important;line-height:150%!important}
.e .f.g,.e .f.g *{font-size:26px!important;line-height:150%!important}
.a .d,.a .d *{font-size:18px!important;line-height:150%!important}
.c .d,.c .d *{font-size:18px!important;line-height:150%!important}
.c .b,.c .b *{font-size:16px!important;line-height:150%!important}
.a .b,.a .b *{font-size:16px!important;line-height:150%!important}
table[align="left"],table[align="right"]{float:none!important;width:100%!important;max-width:100%!important;margin:0 auto 20px auto!important}
td[width="260"]{display:block!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important}
.mobile-padding{padding:15px!important}
}
@media screen and (max-width:384px){
.mail-message-content{width:414px!important}
}
</style>

<!-- Hero Banner -->
{% assign first_special = customer.service-specs-recs[0] %}
<table width="600" cellpadding="0" cellspacing="0" style="${s}">
<tr><td style="padding:0">
<a href="{{ first_special.Schedule_Service_URL | default: '#' }}"><img src="{{ first_special.Hero_Image_URL }}" alt="Service Specials" width="600" height="400" class="adapt-img" style="display:block;border:0"/></a>
</td></tr>
<tr><td bgcolor="{{ first_special.Brand_Color | default: '${brandColor}' }}" height="10" style="padding:0;font-size:0"></td></tr>
</table>

<!-- Service Special Cards -->
{% assign special_count = 0 %}
{% for special in customer.service-specs-recs %}
  {% if special.Special_Image_URL %}
    {% assign special_count = special_count | plus: 1 %}
  {% endif %}
{% endfor %}

{% if special_count > 0 %}
  {% for special in customer.service-specs-recs %}
  {% if special.Special_Image_URL %}
  {% assign mod = forloop.index | modulo: 2 %}
  {% assign is_last_odd = false %}
  {% if forloop.last and mod == 1 %}
    {% assign is_last_odd = true %}
  {% endif %}

  {% if mod == 1 and is_last_odd == false %}
<table width="600" cellpadding="0" cellspacing="0" style="${s}">
<tr><td style="padding:20px 30px">
  {% endif %}

  {% if is_last_odd %}
<!-- Last odd card - full width -->
<table width="600" cellpadding="0" cellspacing="0" style="${s}">
<tr><td style="padding:20px 0">
<a href="{{ special.Special_CTA_URL | default: first_special.Schedule_Service_URL }}">
<img src="{{ special.Special_Image_URL }}" alt="{{ special.Special_Title }}" width="600" height="400" class="adapt-img" style="display:block;border:0"/>
</a>
</td></tr>
<tr><td bgcolor="{{ first_special.Brand_Color }}" height="10" style="padding:0;font-size:0"></td></tr>
</table>
  {% else %}
<!-- Regular paired card -->
    <table cellpadding="0" cellspacing="0" {% if mod == 1 %}align="left"{% else %}align="right"{% endif %} style="${s};width:260px;{% if mod == 1 %}float:left;margin-right:20px;margin-bottom:20px{% else %}float:right;margin-bottom:20px{% endif %}">
    <tr><td style="padding:0;width:260px">
    <table width="100%" cellpadding="0" cellspacing="0" style="${s}">
    <tr><td style="padding:0">
    <a href="{{ special.Special_CTA_URL | default: first_special.Schedule_Service_URL }}">
    <img src="{{ special.Special_Image_URL }}" alt="{{ special.Special_Title }}" width="260" height="173" class="adapt-img" style="display:block;border:0"/>
    </a>
    </td></tr>
    <tr><td style="padding:15px 10px;text-align:center;background:#f9f9f9">
    <h4 style="margin:0 0 8px 0;font-size:18px;font-weight:bold;color:#333">{{ special.Special_Title }}</h4>
    {% if special.Special_Price != blank %}<p style="margin:0 0 12px 0;font-size:24px;font-weight:bold;color:{{ first_special.Brand_Color }}">{{ special.Special_Price }}</p>{% endif %}
    <a href="{{ special.Special_CTA_URL | default: first_special.Schedule_Service_URL }}" style="display:inline-block;padding:10px 20px;background:{{ first_special.Brand_Color }};color:#fff;text-decoration:none;border-radius:5px;font-weight:bold;font-size:14px">{{ special.Special_CTA_Text }}</a>
    </td></tr>
    </table>
    </td></tr>
    </table>
  {% if mod == 0 %}
</td></tr></table>
  {% endif %}
  {% endif %}
  {% endif %}
  {% endfor %}
{% endif %}

<!-- CTA Section -->
<table width="600" cellpadding="0" cellspacing="0" style="${s}">
<tr><td class="mobile-padding" style="padding:30px">
<table width="100%" cellpadding="0" cellspacing="0" style="${s}">
<tr>
<td width="260" valign="top" style="padding:10px">
<h3 style="font-size:20px;margin:0 0 10px 0">Looking for more?</h3>
<p style="font-size:14px;margin:0 0 15px 0;color:#666">Explore the full list of our current limited-time offers.</p>
<a href="{{ first_special.Service_Specials_URL | default: '#' }}" style="display:inline-block;padding:12px 24px;background:#fff;border:2px solid #333;border-radius:5px;color:#333;text-decoration:none;font-weight:bold">Explore All Specials</a>
</td>
<td width="260" valign="top" style="padding:10px">
<h3 style="font-size:20px;margin:0 0 10px 0">Ready to Schedule?</h3>
<p style="font-size:14px;margin:0 0 15px 0;color:#666">Secure your spot today or call <a href="tel:{{ first_special.Phone_Number_Tel }}" style="color:#000">{{ first_special.Phone_Number }}</a></p>
<a href="{{ first_special.Schedule_Service_URL | default: '#' }}" style="display:inline-block;padding:12px 24px;background:#fff;border:2px solid #333;border-radius:5px;color:#333;text-decoration:none;font-weight:bold">Schedule Service</a>
</td>
</tr>
</table>
</td></tr>
</table>

<!-- Service Match Section -->
<table width="600" cellpadding="0" cellspacing="0" style="${s}">
<tr><td style="padding:30px">
<table width="100%" cellpadding="0" cellspacing="0" style="${s}">
<tr>
<td width="106" valign="top"><img src="https://enfoilk.stripocdn.email/content/guids/CABINET_df8bdfe1481b3083e0acb097545e39faacf8b8a397434460fe296877e7407e2c/images/swickard_service_match_logo_new.png" width="106" height="106" style="display:block"/></td>
<td width="20"></td>
<td valign="top">
<h2 style="font-size:26px;margin:0 0 10px 0">Swickard Service Match</h2>
<p style="font-size:14px;margin:0 0 15px 0">We match our competitor's Service Offerings so you can pay the price you want*</p>
<a href="{{ first_special.Service_Match_URL | default: '#' }}" style="display:inline-block;padding:10px 24px;background:#fff;border:1px solid #000;border-radius:5px;color:#000;text-decoration:none;font-weight:bold">LEARN MORE</a>
</td>
</tr>
</table>
</td></tr>
<tr><td bgcolor="{{ first_special.Brand_Color | default: '${brandColor}' }}" height="10" style="padding:0;font-size:0"></td></tr>
</table>

<!-- Disclaimers -->
<table width="600" cellpadding="0" cellspacing="0" bgcolor="#000" style="${s};background:#000">
<tr><td style="padding:30px 15px;color:#fff;font-size:10px;text-align:justify">
<p style="margin:0 0 10px 0;text-align:justify"><strong>*Service Special:</strong> {{ first_special.Service_Special_Disclaimer }}</p>
<p style="margin:0;text-align:justify"><strong>*Swickard Service Match:</strong> {{ first_special.Service_Match_Disclaimer }}</p>
</td></tr>
</table>
</td></tr>
</table>
</td></tr>
</table>
</td></tr>
</table>`;
}

/**
 * Updates a single snippet in Customer.io.
 * @param {string} apiKey The API key for the workspace.
 * @param {string} snippetName The name of the snippet to update.
 * @param {string} snippetContent The HTML content for the snippet.
 * @returns {{success: boolean, error: string|null}} Result object.
 */
function updateServiceSnippetInCustomerIO(apiKey, snippetName, snippetContent) {
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
 * Gets a collection ID by name from Customer.io.
 * @param {string} apiKey The API key for the workspace.
 * @param {string} collectionName The name of the collection to find.
 * @returns {{success: boolean, error: string|null, collectionId: string|null}} Result object.
 */
function getServiceCollectionByName(apiKey, collectionName) {
  const result = { success: false, error: null, collectionId: null };

  try {
    const url = "https://api.customer.io/v1/collections";
    const options = {
      method: 'get',
      headers: { "Authorization": "Bearer " + apiKey },
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();

    if (responseCode >= 200 && responseCode < 300) {
      const responseData = JSON.parse(response.getContentText());
      const collections = responseData.collections || [];

      // Find the collection by name
      const collection = collections.find(c => c.name === collectionName);

      if (collection) {
        result.success = true;
        result.collectionId = collection.id;
      } else {
        result.error = `Collection "${collectionName}" not found`;
      }
    } else {
      result.error = `API Error (${responseCode}): ${response.getContentText()}`;
    }
  } catch (error) {
    result.error = error.message;
  }

  return result;
}

/**
 * Creates or updates a collection in Customer.io with service specials data.
 * First tries to get existing collection, then updates if found or creates if not.
 * @param {string} apiKey The API key for the workspace.
 * @param {string} collectionName The name of the collection.
 * @param {Array} serviceSpecialsData Array of service special objects.
 * @returns {{success: boolean, error: string|null, collectionId: string|null}} Result object.
 */
function createServiceCollectionInCustomerIO(apiKey, collectionName, serviceSpecialsData) {
  const result = { success: false, error: null, collectionId: null };

  try {
    // First, try to get the existing collection
    const getResult = getServiceCollectionByName(apiKey, collectionName);

    if (getResult.success && getResult.collectionId) {
      // Collection exists, update it
      Logger.log(`Collection "${collectionName}" exists (ID: ${getResult.collectionId}), updating...`);
      const updateResult = updateServiceCollectionInCustomerIO(apiKey, getResult.collectionId, serviceSpecialsData);

      if (updateResult.success) {
        result.success = true;
        result.collectionId = getResult.collectionId;
      } else {
        result.error = updateResult.error;
      }
    } else {
      // Collection doesn't exist, create it
      Logger.log(`Collection "${collectionName}" does not exist, creating...`);
      const url = "https://api.customer.io/v1/collections";
      const payload = {
        name: collectionName,
        data: serviceSpecialsData
      };

      const options = {
        method: 'post',
        contentType: 'application/json',
        headers: { "Authorization": "Bearer " + apiKey },
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      };

      const response = UrlFetchApp.fetch(url, options);
      const responseCode = response.getResponseCode();

      if (responseCode >= 200 && responseCode < 300) {
        const responseData = JSON.parse(response.getContentText());
        result.success = true;
        result.collectionId = responseData.collection.id || null;
      } else {
        result.error = `API Error (${responseCode}): ${response.getContentText()}`;
      }
    }
  } catch (error) {
    result.error = error.message;
  }

  return result;
}

/**
 * Updates an existing collection in Customer.io.
 * @param {string} apiKey The API key for the workspace.
 * @param {string} collectionId The ID of the collection to update.
 * @param {Array} serviceSpecialsData Array of service special objects.
 * @returns {{success: boolean, error: string|null}} Result object.
 */
function updateServiceCollectionInCustomerIO(apiKey, collectionId, serviceSpecialsData) {
  const result = { success: false, error: null };

  try {
    const url = `https://api.customer.io/v1/collections/${collectionId}`;
    const payload = { data: serviceSpecialsData };

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
 * Processes service specials collection update for a single workspace.
 * @param {string} workspaceName The name of the workspace to update.
 * @returns {string} A success or failure message.
 */
function processServiceSpecialsCollectionUpdate(workspaceName) {
  const workspace = SERVICE_WORKSPACES_CONFIG.find(w => w.name === workspaceName);
  if (!workspace) {
    throw new Error(`Workspace '${workspaceName}' not found.`);
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Service Specials Automation");

  if (!sheet) {
    throw new Error("Sheet 'Service Specials Automation' not found. Please check the sheet name.");
  }

  try {
    Logger.log(`Processing collection for workspace: ${workspace.name}...`);

    // Get dealership data
    let dealershipData;
    if (workspace.type === 'single') {
      dealershipData = getDealershipData(sheet, workspace.dealership);
      if (!dealershipData) {
        throw new Error(`No data found for '${workspace.dealership}' in the sheet.`);
      }
    } else if (workspace.type === 'multi') {
      dealershipData = {};
      for (const brand in workspace.dealerships) {
        const dealershipName = workspace.dealerships[brand];
        const data = getDealershipData(sheet, dealershipName);
        if (data) {
          dealershipData[brand] = data;
        }
      }
      if (Object.keys(dealershipData).length === 0) {
        throw new Error(`No data found for any dealerships in workspace '${workspace.name}'.`);
      }
    }

    // Transform specials data into collection format
    const collectionData = transformServiceSpecialsToCollection(dealershipData);

    // Create/update collection (POST will create or update if name exists)
    const collectionName = "Service Specials Collection";
    const createResult = createServiceCollectionInCustomerIO(workspace.apiKey, collectionName, collectionData);

    if (createResult.success) {
      const message = `${getRandomServiceEmoji()} Successfully updated Service Specials collection for ${formatServiceWorkspaceName(workspace.name)}.`;
      Logger.log(`✅ ${message}`);
      return message;
    } else {
      throw new Error(createResult.error);
    }
  } catch (error) {
    Logger.log(`❌ Error for ${workspace.name}: ${error.message}`);
    throw error;
  }
}

/**
 * Transforms dealership service specials data into Customer.io collection format.
 * Includes ALL fields from the sheet for each special.
 * @param {Object} dealershipData The dealership data with specials array.
 * @returns {Array} Array of service special objects for collection.
 */
function transformServiceSpecialsToCollection(dealershipData) {
  const specials = dealershipData.specials || [];

  return specials.map((special, index) => {
    // Start with auto-generated ID
    const collectionItem = {
      id: `special_${index}`
    };

    // Add ALL fields from the sheet row dynamically
    // Preserve exact case like Pre-Owned snippet (e.g., Special_Image_URL stays Special_Image_URL)
    Object.keys(special).forEach(key => {
      collectionItem[key] = special[key] || '';
    });

    return collectionItem;
  });
}

/**
 * Shows dialog for updating collections for a specific workspace.
 */
function showServiceSpecialsCollectionDialog() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; }
      #status { margin-top: 10px; font-weight: bold; color: #4CAF50;}
      #error { margin-top: 10px; font-weight: bold; color: #F44336;}
      .loader { display: none; margin-top: 10px; border: 4px solid #f3f3f3; border-radius: 50%; border-top: 4px solid #3498db; width: 20px; height: 20px; animation: spin 1s linear infinite; }
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
    <h2>Update Service Specials Collection</h2>
    <p>Choose a workspace to update Service Specials collection.</p>
    <div><select id="workspace-select" style="width: 100%;">${SERVICE_WORKSPACES_CONFIG.map(w => `<option value="${w.name}">${formatServiceWorkspaceName(w.name)}</option>`).join('')}</select></div>
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
          .processServiceSpecialsCollectionUpdate(selectedWorkspace);
      }
    </script>
  `).setWidth(400).setHeight(250);

  SpreadsheetApp.getUi().showModalDialog(html, 'Update Service Specials Collection');
}

/**
 * Updates Service Specials collections for ALL configured workspaces.
 */
function updateAllServiceSpecialsCollections() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Service Specials Automation");

  if (!sheet) {
    SpreadsheetApp.getUi().alert("Error: Sheet 'Service Specials Automation' not found. Please check the sheet name.");
    return;
  }

  const results = { success: 0, failure: 0, alerts: [] };

  // Process each workspace from the global config
  SERVICE_WORKSPACES_CONFIG.forEach(workspace => {
    try {
      Logger.log(`Processing collection for ${workspace.name}...`);

      // Get dealership data
      let dealershipData;
      if (workspace.type === 'single') {
        dealershipData = getDealershipData(sheet, workspace.dealership);

        if (!dealershipData) {
          throw new Error(`No data found for '${workspace.dealership}' in the sheet.`);
        }
      } else if (workspace.type === 'multi') {
        // For multi-dealership workspaces, collect data for each brand
        dealershipData = {};
        for (const brand in workspace.dealerships) {
          const dealershipName = workspace.dealerships[brand];
          const data = getDealershipData(sheet, dealershipName);
          if (data) {
            dealershipData[brand] = data;
          }
        }

        if (Object.keys(dealershipData).length === 0) {
          throw new Error(`No data found for any dealerships in workspace '${workspace.name}'.`);
        }
      }

      // Transform specials data into collection format
      const collectionData = transformServiceSpecialsToCollection(dealershipData);

      // Create/update collection (POST will create or update if name exists)
      const collectionName = "Service Specials Collection";
      const createResult = createServiceCollectionInCustomerIO(workspace.apiKey, collectionName, collectionData);

      if (createResult.success) {
        results.success++;
        Logger.log(`✅ Service Specials collection updated for ${workspace.name}`);
      } else {
        throw new Error(createResult.error);
      }
    } catch (error) {
      results.alerts.push(`Error for ${workspace.name}: ${error.message}`);
      results.failure++;
      Logger.log(`❌ Error for ${workspace.name}: ${error.message}`);
    }
  });

  Logger.log(`Completed: ${results.success} successful, ${results.failure} failed`);

  let completionMessage = `Bulk Collection Update Complete\n\n${results.success} successful\n${results.failure} failed`;
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
 * Shows dialog for updating ALL Service Specials collections at once.
 */
function showAllServiceCollectionsDialog() {
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
    <p>This will update Service Specials collections for all ${SERVICE_WORKSPACES_CONFIG.length} workspaces.</p>
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
        var confirmMessage = 'You are about to update Service Specials collections for ALL ${SERVICE_WORKSPACES_CONFIG.length} workspaces.\\n\\nThis will make API calls to Customer.io for every workspace and cannot be undone.\\n\\nAre you sure you want to continue?';

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
          .updateAllServiceSpecialsCollections();
      }
    </script>
  `).setWidth(400).setHeight(300);

  SpreadsheetApp.getUi().showModalDialog(html, 'Update All Collections');
}
