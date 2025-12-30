 /**
 * Dealership Footer Automation System for Google Apps Script
 * Updates Customer.io footer snippets from Google Sheets data.
 * This script provides a UI menu in Google Sheets to update all footers at once
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
const WORKSPACES_CONFIG = [
  { name: 'ACURA_THOUSAND_OAKS', apiKey: '1fd2ddd8d2640a15a1aa8fcb62cc4433', type: 'single', dealership: 'Acura Thousand Oaks' },
  { name: 'AUDI_OAKLAND', apiKey: '5e38a490a4cb75da215ff8e077916311', type: 'single', dealership: 'Audi Oakland' },
  { name: 'AUDI_PALO_ALTO', apiKey: 'e7295eb15fb899b12b8de4d29ce68dd1', type: 'single', dealership: 'Audi Palo Alto' },
  { name: 'BMW_OF_EUGENE', apiKey: '75c00432a4fb3c5f086ae2a1ef4c1872', type: 'single', dealership: 'BMW of Eugene' },
  { name: 'BMW_OF_LYNNWOOD', apiKey: '629fb75ec206c73db80646ebf1e24a44', type: 'single', dealership: 'BMW of Lynnwood' },
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
  { name: 'AUDI_VOLKSWAGEN_BELLINGHAM', apiKey: '6c4af2e86daa1c8cf730489c4b41db2b', type: 'multi', dealerships: { 'Audi': 'Audi Bellingham', 'Volkswagen': 'Volkswagen of Bellingham' }},
  { name: 'SWICKARD_ANCHORAGE', apiKey: '4107c3fc1225eaf3434c1d9fa2cb2ad2', type: 'multi', dealerships: { 'Cadillac': 'Cadillac Anchorage', 'Chevrolet': 'Swickard Anchorage', 'Buick': 'Swickard Anchorage', 'GMC': 'Swickard Anchorage' }},
  { name: 'SWICKARD_THOUSAND_OAKS', apiKey: '06e5197f9d9a7119d4dc6cecf1bf9c22', type: 'multi', dealerships: { 'Buick': 'Swickard Buick GMC of Thousand Oaks', 'GMC': 'Swickard Buick GMC of Thousand Oaks', 'Cadillac': 'Cadillac Thousand Oaks' }},
  { name: 'PORSCHE_AUDI_VOLKSWAGEN_ANCHORAGE', apiKey: '2ae0afa8d034d1a81bfc4b93ab95dd0b', type: 'multi', dealerships: { 'Porsche': 'Porsche Anchorage', 'Audi': 'Audi Anchorage', 'Volkswagen': 'Volkswagen of Anchorage' }}
];

/**
* Creates the custom menu in the spreadsheet UI when it's opened.
*/
function onOpen() {
SpreadsheetApp.getUi()
  .createMenu('Footer Tools')
  .addItem('Update ALL Workspaces', 'updateAllFooterSnippets')
  .addItem('Update a Specific Workspace...', 'showWorkspaceSelectionDialog')
  .addToUi();
}

/**
* Formats the raw workspace name for display in the UI.
* e.g., 'ACURA_THOUSAND_OAKS' becomes 'Acura Thousand Oaks'
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
* Returns a random animal emoji for some fun.
* @returns {string} An emoji.
*/
function getRandomAnimalEmoji() {
const animals = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊', '🐇', '🦝', '🦨', '🦡', '🦦', '🦥', '🐁', '🐀', '🐿', '🦔'];
return animals[Math.floor(Math.random() * animals.length)];
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
  </style>
  <h2>Select Workspace</h2>
  <p>Choose a workspace and click "Update".</p>
  <div><select id="workspace-select" style="width: 100%;">${WORKSPACES_CONFIG.map(w => `<option value="${w.name}">${formatWorkspaceName(w.name)}</option>`).join('')}</select></div>
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
          document.querySelector('button').disabled = false; // Re-enable button on failure
        })
        .processSingleWorkspaceUpdate(selectedWorkspace);
    }
  </script>
`).setWidth(400).setHeight(250);

SpreadsheetApp.getUi().showModalDialog(html, 'Update Specific Workspace');
}

/**
* Processes the update for a single workspace, called from the selection dialog.
* @param {string} workspaceName The name of the workspace to update.
* @returns {string} A success or failure message.
*/
function processSingleWorkspaceUpdate(workspaceName) {
const workspace = WORKSPACES_CONFIG.find(w => w.name === workspaceName);
if (!workspace) {
  throw new Error(`Workspace '${workspaceName}' not found.`);
}

const ss = SpreadsheetApp.getActiveSpreadsheet();
const sheet = ss.getSheetByName("Sheet1"); // Ensure your sheet is named "Sheet1"
const dealershipData = getSheetData(sheet);

let snippetContent;

try {
  Logger.log(`Processing single workspace: ${workspace.name}...`);
  
  // Generate snippet content based on workspace type
  if (workspace.type === 'single' && workspace.dealership) {
    const dealershipName = workspace.dealership;
    const dealershipInfo = dealershipData[dealershipName];
    if (!dealershipInfo) throw new Error(`Missing data in sheet for '${dealershipName}'`);
    snippetContent = generateSingleDealershipFooter(dealershipInfo, dealershipName);
  } else if (workspace.type === 'multi' && workspace.dealerships) {
    Logger.log(`Found multi-dealership workspace: ${workspace.name}. Generating dynamic footer.`);
    snippetContent = generateMultiDealershipFooter(workspace.dealerships, dealershipData);
    Logger.log(`Generated HTML for ${workspace.name}: \n${snippetContent.substring(0, 500)}...`);
  } else {
    throw new Error(`Workspace '${workspace.name}' has invalid type or missing required properties.`);
  }

  // API call logic
  const url = "https://api.customer.io/v1/snippets";
  const payload = { name: 'Footer', value: snippetContent };
  const options = {
    method: 'put',
    contentType: 'application/json',
    headers: { "Authorization": "Bearer " + workspace.apiKey },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  const response = UrlFetchApp.fetch(url, options);
  const responseCode = response.getResponseCode();

  if (responseCode >= 200 && responseCode < 300) {
    const message = `BOOM! ${getRandomAnimalEmoji()} Successfully updated the footer for ${formatWorkspaceName(workspace.name)}.`;
    Logger.log(`✅ ${message}`);
    return message;
  } else {
    throw new Error(`API Error (${responseCode}): ${response.getContentText()}`);
  }
} catch (error) {
  Logger.log(`❌ Error for ${workspace.name}: ${error.message}`);
  throw error; // Re-throw the error so the UI failure handler catches it
}
}

/**
* Updates footer snippets for ALL configured workspaces.
*/
function updateAllFooterSnippets() {
const ss = SpreadsheetApp.getActiveSpreadsheet();
const sheet = ss.getSheetByName("Sheet1");
const dealershipData = getSheetData(sheet);

/** @type {{success: number, failure: number, alerts: string[]}} */
const results = { success: 0, failure: 0, alerts: [] };
const snippetName = 'Footer';

// Process each workspace from the global config
WORKSPACES_CONFIG.forEach(workspace => {
  try {
    Logger.log(`Processing ${workspace.name}...`);
    
    let snippetContent;
    
    if (workspace.type === 'single' && workspace.dealership) {
      const dealershipName = workspace.dealership;
      const dealershipInfo = dealershipData[dealershipName];
      if (!dealershipInfo) throw new Error(`Missing data for ${dealershipName}`);
      snippetContent = generateSingleDealershipFooter(dealershipInfo, dealershipName);
    } else if (workspace.type === 'multi' && workspace.dealerships) {
      Logger.log(`Found multi-dealership workspace: ${workspace.name}. Generating dynamic footer.`);
      snippetContent = generateMultiDealershipFooter(workspace.dealerships, dealershipData);
      Logger.log(`Generated HTML for ${workspace.name}: \n${snippetContent.substring(0, 500)}...`);
    } else {
      throw new Error(`Workspace '${workspace.name}' has invalid type or missing required properties.`);
    }
    
    const url = "https://api.customer.io/v1/snippets";
    const payload = { name: snippetName, value: snippetContent };
    const options = {
      method: 'put',
      contentType: 'application/json',
      headers: { "Authorization": "Bearer " + workspace.apiKey },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();

    if (responseCode >= 200 && responseCode < 300) {
      results.success++;
      Logger.log(`✅ Snippet '${snippetName}' updated for ${workspace.name}`);
    } else {
      throw new Error(`API Error (${responseCode}): ${response.getContentText()}`);
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
}

/**
* Generates the complete HTML content for the footer snippet.
* @param {Object} dealershipInfo The dealership data object from the spreadsheet.
* @param {string} dealershipName The name of the dealership.
* @returns {string} The full HTML string for the snippet.
*/
function generateSingleDealershipFooter(dealershipInfo, dealershipName) {
// This function remains unchanged, returning the large HTML string
return `<!-- Footer Content Snippet - ${dealershipName} -->
<!--[if mso]>
<style type="text/css">
.outlook-table{width:600px!important}
.outlook-footer-nav{font-size:14px!important}
.outlook-social{width:32px!important;height:32px!important}
</style>
<![endif]-->
<!--[if !mso]><!-->
<style type="text/css">
@media screen and (max-width:600px){
.footer-nav-link{display:block!important;padding:10px 0!important}
.footer-social-table{width:100px!important;margin:0 auto!important}
.footer-hours-column{width:100%!important;display:block!important;padding:10px 0!important;border-left:none!important}
.mobile-footer{width:100%!important;max-width:100%!important}
.mobile-padding{padding:20px 10px!important}
}
u~div .gmail-footer{background-color:#000000!important}
</style>
<!--<![endif]-->
<div class="footer-container">
<!--[if mso]>
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center" class="outlook-table">
<![endif]-->
<!--[if !mso]><!-->
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif" class="mobile-footer">
<!--<![endif]-->
<tr>
<td align="center" style="background-color:#000000;padding:30px 20px" class="mobile-padding gmail-footer">
<!--[if mso]>
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="550" align="center">
<![endif]-->
<!--[if !mso]><!-->
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:550px">
<!--<![endif]-->
<tr>
<td style="border-top:1px solid #ffffff;padding-top:20px">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
<tr>
<td align="center" style="padding-bottom:20px">
<!--[if mso]>
<table role="presentation" border="0" cellpadding="0" cellspacing="0">
<tr>
<td><a href="${dealershipInfo.new_inventory_footer_url || '#'}" class="outlook-footer-nav" style="color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;padding:0 10px">New</a></td>
<td><a href="${dealershipInfo.used_inventory_footer_url || '#'}" class="outlook-footer-nav" style="color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;padding:0 10px">Used</a></td>
<td><a href="${dealershipInfo.service_footer_url || '#'}" class="outlook-footer-nav" style="color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;padding:0 10px">Service</a></td>
<td><a href="${dealershipInfo.gubagoo_footer_url || '#'}" class="outlook-footer-nav" style="color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;padding:0 10px">Chat</a></td>
</tr>
</table>
<![endif]-->
<!--[if !mso]><!-->
<a href="${dealershipInfo.new_inventory_footer_url || '#'}" class="footer-nav-link" style="color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;padding:0 10px">New</a>
<a href="${dealershipInfo.used_inventory_footer_url || '#'}" class="footer-nav-link" style="color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;padding:0 10px">Used</a>
<a href="${dealershipInfo.service_footer_url || '#'}" class="footer-nav-link" style="color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;padding:0 10px">Service</a>
<a href="${dealershipInfo.gubagoo_footer_url || '#'}" class="footer-nav-link" style="color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;padding:0 10px">Chat</a>
<!--<![endif]-->
</td>
</tr>
</table>
</td>
</tr>
<tr>
<td align="center" style="padding-bottom:20px">
<!--[if mso]>
<table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center">
<![endif]-->
<!--[if !mso]><!-->
<table role="presentation" border="0" cellpadding="0" cellspacing="0" class="footer-social-table">
<!--<![endif]-->
<tr>
<td style="padding:0 10px">
<a href="${dealershipInfo.instagram_footer_url || '#'}">
<!--[if mso]>
<img src="https://enfoilk.stripocdn.email/content/assets/img/social-icons/logo-white/instagram-logo-white.png" alt="Instagram" width="32" height="32" style="display:block" class="outlook-social">
<![endif]-->
<!--[if !mso]><!-->
<img src="https://enfoilk.stripocdn.email/content/assets/img/social-icons/logo-white/instagram-logo-white.png" alt="Instagram" width="32" height="32" style="display:block">
<!--<![endif]-->
</a>
</td>
<td style="padding:0 10px">
<a href="${dealershipInfo.facebook_footer_url || '#'}">
<!--[if mso]>
<img src="https://enfoilk.stripocdn.email/content/assets/img/social-icons/logo-white/facebook-logo-white.png" alt="Facebook" width="32" height="32" style="display:block" class="outlook-social">
<![endif]-->
<!--[if !mso]><!-->
<img src="https://enfoilk.stripocdn.email/content/assets/img/social-icons/logo-white/facebook-logo-white.png" alt="Facebook" width="32" height="32" style="display:block">
<!--<![endif]-->
</a>
</td>
</tr>
</table>
</td>
</tr>
<tr>
<td>
<!--[if mso]>
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
<tr>
<td width="275" valign="top" style="font-family:Arial,sans-serif;font-size:12px;line-height:1.3;color:#ffffff;padding-right:15px">
<p style="margin:0 0 10px 0;text-align:center"><strong>Showroom Hours:</strong></p>
<p style="margin:0 0 5px 0;text-align:center;line-height:1.3">${dealershipInfo.showroom_footer_hours || ''}</p>
</td>
<td width="275" valign="top" style="font-family:Arial,sans-serif;font-size:12px;line-height:1.3;color:#ffffff;padding-left:15px;border-left:1px solid #333333">
<p style="margin:0 0 10px 0;text-align:center"><strong>Service Hours:</strong></p>
<p style="margin:0 0 5px 0;text-align:center;line-height:1.3">${dealershipInfo.service_footer_hours || ''}</p>
</td>
</tr>
</table>
<![endif]-->
<!--[if !mso]><!-->
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
<tr>
<td width="50%" valign="top" style="font-family:Arial,sans-serif;font-size:12px;line-height:1.3;color:#ffffff;padding-right:15px" class="footer-hours-column">
<p style="margin:0 0 10px 0;text-align:center"><strong>Showroom Hours:</strong></p>
<p style="margin:0 0 5px 0;text-align:center;line-height:1.3">${dealershipInfo.showroom_footer_hours || ''}</p>
</td>
<td width="50%" valign="top" style="font-family:Arial,sans-serif;font-size:12px;line-height:1.3;color:#ffffff;padding-left:15px;border-left:1px solid #333333" class="footer-hours-column">
<p style="margin:0 0 10px 0;text-align:center"><strong>Service Hours:</strong></p>
<p style="margin:0 0 5px 0;text-align:center;line-height:1.3">${dealershipInfo.service_footer_hours || ''}</p>
</td>
</tr>
</table>
<!--<![endif]-->
</td>
</tr>
<tr>
<td align="center" style="padding-top:20px">
<p style="margin:0 0 5px 0;font-family:Arial,sans-serif;font-size:16px;color:#ffffff;font-weight:bold">${dealershipName}</p>
<p style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:#ffffff">${dealershipInfo.footer_address || ''}</p>
</td>
</tr>
<tr>
<td align="center" style="padding-top:10px">
<p style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:#ffffff">
<a href="tel:${dealershipInfo.dealership_footer_phone || ''}" style="color:#ffffff;text-decoration:none"><strong>${dealershipInfo.dealership_footer_text || dealershipInfo.dealership_footer_phone || ''}</strong></a>
</p>
</td>
</tr>
</table>
</td>
</tr>
{% if campaign.name == "New_Specials_Journey" or campaign.name == "Sales Specials Journey" %}
<tr>
<td align="center" style="background-color:#000000;padding:10px 20px;font-family:Arial,sans-serif;font-size:10px;line-height:1.5;color:#ffffff" class="mobile-padding">
{% assign vehicles_json = customer["Sales-Specs-Recs"] %}
{% assign disclaimers = "" %}
{% if customer["Sales-Specs-Recs"][0].Hero_Disclaimer != blank and customer["Sales-Specs-Recs"][0].Hero_Disclaimer != nil %}
{% assign hero_disclaimer = customer["Sales-Specs-Recs"][0].Hero_Disclaimer %}
{% else %}
{% assign hero_disclaimer = "" %}
{% endif %}
{% for vehicle in vehicles_json %}
{% capture disclaimer_sentence %}
<br>{{ vehicle.disclaimer_1 | default: "All vehicles are subject to prior sale and may not be available at the time of inquiry. Pricing does not include applicable taxes, title, licensing, or other fees unless explicitly stated. We strive for accuracy in our listings; however, it is the buyer's responsibility to verify all critical information, including vehicle specifications and availability, before purchase. Financing is subject to credit approval. Please contact our dealership for complete details and terms." }}<br>
{% endcapture %}
{% assign disclaimers = disclaimers | append: disclaimer_sentence | append: " " %}
{% endfor %}
<p style="margin:0;text-align:justify;line-height:150%;color:#ffffff">
{% if hero_disclaimer != "" %}{{ hero_disclaimer }} {% endif %}
<br>{{ disclaimers | newline_to_br }}
</p>
</td>
</tr>
{% endif %}
{% if campaign.name == "Preowned_Specials_Journey" or campaign.name == "Preowned Specials Journey" %}
<tr>
<td align="center" style="background-color:#000000;padding:10px 20px;font-family:Arial,sans-serif;font-size:10px;line-height:1.5;color:#ffffff" class="mobile-padding">
{% assign vehicles_json = customer["Pre-Owned-Specs-Recs"] %}
{% assign disclaimers = "" %}
{% if customer["Pre-Owned-Specs-Recs"][0].Hero_Disclaimer != blank and customer["Pre-Owned-Specs-Recs"][0].Hero_Disclaimer != nil %}
{% assign hero_disclaimer = customer["Pre-Owned-Specs-Recs"][0].Hero_Disclaimer %}
{% else %}
{% assign hero_disclaimer = "" %}
{% endif %}
{% for vehicle in vehicles_json %}
{% capture disclaimer_sentence %}
<br>{{ vehicle.disclaimer_1 | default: "All vehicles are subject to prior sale and may not be available at the time of inquiry. Pricing does not include applicable taxes, title, licensing, or other fees unless explicitly stated. We strive for accuracy in our listings; however, it is the buyer's responsibility to verify all critical information, including vehicle specifications and availability, before purchase. Financing is subject to credit approval. Please contact our dealership for complete details and terms." }}
{% endcapture %}
{% assign disclaimers = disclaimers | append: disclaimer_sentence | append: " " %}
{% endfor %}
<p style="margin:0;text-align:justify;line-height:150%;color:#ffffff">
{% if hero_disclaimer != "" %}{{ hero_disclaimer }} {% endif %}
<br>{{ disclaimers | newline_to_br }}
</p>
</td>
</tr>
{% endif %}
{% if campaign.name contains "Pre_Owned" or campaign.name contains "Pre-Owned" or campaign.subtype == "pre_owned" or campaign.subtype == "pre-owned" %}
<tr>
<td align="center" style="background-color:#000000;padding:10px 20px;font-family:Arial,sans-serif;font-size:10px;line-height:1.5;color:#ffffff" class="mobile-padding">
<p style="margin:0;text-align:justify;line-height:150%;color:#ffffff">
All vehicles are one of each and subject to prior sale. All Pre-Owned or Certified vehicles are used. All offers expire at the close of business on the day the offer is removed from the website, and all financing is subject to credit approval. Prices exclude taxes, title, registration, tags, labor and installation charges, insurance, optional equipment, products, packages and services.  Although we attempt to include the cost of all options preinstalled by the dealer in the listed price, some options may have been added that are not reflected in the sales price on the website.  While great effort is made to ensure the accuracy of the information on the website, errors do occur so please verify information with one of our dealership representatives.  Options, model availability and actual dealer price may vary. See dealer for details, costs and terms. Dealer sets final price.
</p>
</td>
</tr>
{% endif %}
<tr>
<td align="center" style="background-color:#000000;padding:20px;font-family:Arial,sans-serif;font-size:10px;color:#ffffff" class="mobile-padding">
Copyright © 2025 ${dealershipName}, All rights reserved.
</td>
</tr>
</table>
<!--[if mso]>
</table>
<![endif]-->
</div>`;
}

/**
* Gets all dealership data from the target spreadsheet.
* @param {GoogleAppsScript.Spreadsheet.Sheet} sheet The sheet to get data from.
* @returns {Object.<string, Object>} An object where keys are dealership names.
*/
function getSheetData(sheet) {
const data = sheet.getDataRange().getValues();
const headers = data[0];
const dealershipData = {};

const dealershipIndex = headers.indexOf("Dealership");
if (dealershipIndex === -1) {
  throw new Error("Required column 'Dealership' not found in spreadsheet");
}

for (let i = 1; i < data.length; i++) {
  const row = data[i];
  const dealership = row[dealershipIndex];
  
  if (dealership && dealership.trim()) {
    dealershipData[dealership] = {
      dealership_logo_url: getCellValue(row, headers, "dealership_logo_url"),
      dealership_footer_url: getCellValue(row, headers, "dealership_footer_url"),
      dealership_footer_alt: getCellValue(row, headers, "dealership_footer_alt"),
      dealership_footer_phone: getCellValue(row, headers, "dealership_footer_phone"),
      dealership_footer_text: getCellValue(row, headers, "dealership_footer_text"),
      new_inventory_footer_url: getCellValue(row, headers, "new_inventory_footer_url"),
      used_inventory_footer_url: getCellValue(row, headers, "used_inventory_footer_url"),
      service_footer_url: getCellValue(row, headers, "service_footer_url"),
      gubagoo_footer_url: getCellValue(row, headers, "gubagoo_footer_url"),
      instagram_footer_url: getCellValue(row, headers, "instagram_footer_url"),
      facebook_footer_url: getCellValue(row, headers, "facebook_footer_url"),
      showroom_footer_hours: cleanTextForHTML(getCellValue(row, headers, "showroom_footer_hours")),
      service_footer_hours: cleanTextForHTML(getCellValue(row, headers, "service_footer_hours")),
      footer_address: cleanTextForHTML(getCellValue(row, headers, "Footer-address")),
      new_specials_url: getCellValue(row, headers, "New_Specials_url")
    };
  }
}

return dealershipData;
}

/**
* Helper to get cell value by header name safely.
*/
function getCellValue(row, headers, headerName) {
const index = headers.indexOf(headerName);
return index !== -1 ? (row[index] || "") : "";
}

/**
* Cleans text to be safely embedded in HTML, converting newlines to <br> tags.
*/
function cleanTextForHTML(text) {
if (!text) return '';

// First, normalize any existing <br> tags in the source data into standard newlines.
const normalizedText = String(text).replace(/<br\s*\/?>/gi, '\n');

// Now, trim each line, filter out any that are now empty, and join with a single <br>.
return normalizedText
  .split(/\r\n|\n|\r/)
  .map(line => line.trim()) 
  .filter(line => line) 
  .join('<br>');
}

/**
* Generates the HTML for a multi-dealership footer with dynamic Liquid content.
* @param {{[key: string]: string}} dealerships An object mapping brands to dealership names.
* @param {Object} allDealershipData All dealership data from the sheet.
* @returns {string} The full HTML string for the multi-dealership snippet.
*/
function generateMultiDealershipFooter(dealerships, allDealershipData) {
  let processedHtml = getMultiDealershipTemplate();

  // Replace all placeholders with dynamic Liquid case statements
  processedHtml = processedHtml.replace(/{{DYNAMIC_NEW_INVENTORY_URL}}/g, createLiquidCase('new_inventory_footer_url', dealerships, allDealershipData, false));
  processedHtml = processedHtml.replace(/{{DYNAMIC_USED_INVENTORY_URL}}/g, createLiquidCase('used_inventory_footer_url', dealerships, allDealershipData, false));
  processedHtml = processedHtml.replace(/{{DYNAMIC_SERVICE_URL}}/g, createLiquidCase('service_footer_url', dealerships, allDealershipData, false));
  processedHtml = processedHtml.replace(/{{DYNAMIC_GUBAGOO_URL}}/g, createLiquidCase('gubagoo_footer_url', dealerships, allDealershipData, false));
  processedHtml = processedHtml.replace(/{{DYNAMIC_INSTAGRAM_URL}}/g, createLiquidCase('instagram_footer_url', dealerships, allDealershipData, false));
  processedHtml = processedHtml.replace(/{{DYNAMIC_FACEBOOK_URL}}/g, createLiquidCase('facebook_footer_url', dealerships, allDealershipData, false));
  processedHtml = processedHtml.replace(/{{DYNAMIC_SHOWROOM_HOURS}}/g, createLiquidCase('showroom_footer_hours', dealerships, allDealershipData, false));
  processedHtml = processedHtml.replace(/{{DYNAMIC_SERVICE_HOURS}}/g, createLiquidCase('service_footer_hours', dealerships, allDealershipData, false));
  processedHtml = processedHtml.replace(/{{DYNAMIC_ADDRESS}}/g, createLiquidCase('footer_address', dealerships, allDealershipData, false));
  processedHtml = processedHtml.replace(/{{DYNAMIC_PHONE_HREF}}/g, createLiquidCase('dealership_footer_phone', dealerships, allDealershipData, true));
  processedHtml = processedHtml.replace(/{{DYNAMIC_PHONE_DISPLAY}}/g, createLiquidCase('dealership_footer_text', dealerships, allDealershipData, false));
  processedHtml = processedHtml.replace(/{{DYNAMIC_DEALERSHIP_NAME}}/g, createNameCase(dealerships));
  
  return processedHtml;
}

/**
* Creates a Liquid case statement for a specific data field.
* @param {string} fieldKey The key for the data field (e.g., 'new_inventory_footer_url').
* @param {{[key: string]: string}} dealerships An object mapping brands to dealership names.
* @param {Object} allDealershipData All dealership data from the sheet.
* @param {boolean} [isTel=false] Whether to format the output for a tel: link.
* @returns {string} The generated Liquid case statement.
*/
function createLiquidCase(fieldKey, dealerships, allDealershipData, isTel) {
  const brands = Object.keys(dealerships);
  const defaultBrand = brands.includes('Audi') ? 'Audi' : brands[0]; // Prioritize Audi as default, else first brand

  let cases = `{% case customer["Desired-Make"] | downcase %}`;
  brands.forEach(brand => {
      if (brand !== defaultBrand) {
          const dealershipName = dealerships[brand];
          const dealershipInfo = allDealershipData[dealershipName];
          if (dealershipInfo && dealershipInfo[fieldKey]) {
              let value = dealershipInfo[fieldKey];
              if (isTel) value = value.replace(/[^0-9]/g, '');
              cases += `{% when '${brand.toLowerCase()}' %}${value}`;
          }
      }
  });

  const defaultDealershipName = dealerships[defaultBrand];
  const defaultDealershipInfo = allDealershipData[defaultDealershipName];
  if (defaultDealershipInfo && defaultDealershipInfo[fieldKey]) {
      let value = defaultDealershipInfo[fieldKey];
      if (isTel) value = value.replace(/[^0-9]/g, '');
      cases += `{% else %}${value}{% endcase %}`;
  } else {
      cases += `{% else %}{% endcase %}`; // Fallback if data is missing
  }
  return cases;
}

/**
* Creates a Liquid case statement specifically for the dealership name.
* @param {{[key: string]: string}} dealerships An object mapping brands to dealership names.
* @returns {string} The generated Liquid case statement for the name.
*/
function createNameCase(dealerships) {
  const brands = Object.keys(dealerships);
  const defaultBrand = brands.includes('Audi') ? 'Audi' : brands[0];

  let cases = `{% case customer["Desired-Make"] | downcase %}`;
  brands.forEach(brand => {
      if (brand !== defaultBrand) {
          cases += `{% when '${brand.toLowerCase()}' %}${dealerships[brand]}`;
      }
  });
  cases += `{% else %}${dealerships[defaultBrand]}{% endcase %}`;
  return cases;
}

/**
* Returns the HTML template for a multi-dealership footer.
* @returns {string}
*/
function getMultiDealershipTemplate() {
return `<!-- Footer - Multi-Dealership -->
<!--[if mso]><style>.o-tbl{width:600px!important}.o-nav{font-size:14px!important}.o-soc{width:32px!important;height:32px!important}</style><![endif]-->
<!--[if !mso]><!-->
<style>@media screen and (max-width:600px){.f-nav{display:block!important;padding:10px 0!important}.f-soc-tbl{width:100px!important;margin:0 auto!important}.f-hrs{width:100%!important;display:block!important;padding:10px 0!important;border-left:none!important}.m-ftr{width:100%!important;max-width:100%!important}.m-pad{padding:20px 10px!important}}u~div .g-ftr{background-color:#000!important}</style>
<!--<![endif]-->
<div class="footer-container">
<!--[if mso]><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center" class="o-tbl"><![endif]-->
<!--[if !mso]><!--><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif" class="m-ftr"><!--<![endif]-->
<tr><td align="center" style="background-color:#000;padding:30px 20px" class="m-pad g-ftr">
<!--[if mso]><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="550" align="center"><![endif]-->
<!--[if !mso]><!--><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:550px"><!--<![endif]-->
<tr><td style="border-top:1px solid #fff;padding-top:20px">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
<tr><td align="center" style="padding-bottom:20px">
<!--[if mso]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr>
<td><a href="{{DYNAMIC_NEW_INVENTORY_URL}}" class="o-nav" style="color:#fff;text-decoration:none;font-weight:bold;font-size:14px;padding:0 10px">New</a></td>
<td><a href="{{DYNAMIC_USED_INVENTORY_URL}}" class="o-nav" style="color:#fff;text-decoration:none;font-weight:bold;font-size:14px;padding:0 10px">Used</a></td>
<td><a href="{{DYNAMIC_SERVICE_URL}}" class="o-nav" style="color:#fff;text-decoration:none;font-weight:bold;font-size:14px;padding:0 10px">Service</a></td>
<td><a href="{{DYNAMIC_GUBAGOO_URL}}" class="o-nav" style="color:#fff;text-decoration:none;font-weight:bold;font-size:14px;padding:0 10px">Chat</a></td>
</tr></table><![endif]-->
<!--[if !mso]><!-->
<a href="{{DYNAMIC_NEW_INVENTORY_URL}}" class="f-nav" style="color:#fff;text-decoration:none;font-weight:bold;font-size:14px;padding:0 10px">New</a>
<a href="{{DYNAMIC_USED_INVENTORY_URL}}" class="f-nav" style="color:#fff;text-decoration:none;font-weight:bold;font-size:14px;padding:0 10px">Used</a>
<a href="{{DYNAMIC_SERVICE_URL}}" class="f-nav" style="color:#fff;text-decoration:none;font-weight:bold;font-size:14px;padding:0 10px">Service</a>
<a href="{{DYNAMIC_GUBAGOO_URL}}" class="f-nav" style="color:#fff;text-decoration:none;font-weight:bold;font-size:14px;padding:0 10px">Chat</a>
<!--<![endif]-->
</td></tr>
</table>
</td></tr>
<tr><td align="center" style="padding-bottom:20px">
<!--[if mso]><table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center"><![endif]-->
<!--[if !mso]><!--><table role="presentation" border="0" cellpadding="0" cellspacing="0" class="f-soc-tbl"><!--<![endif]-->
<tr>
<td style="padding:0 10px"><a href="{{DYNAMIC_INSTAGRAM_URL}}"><!--[if mso]><img src="https://enfoilk.stripocdn.email/content/assets/img/social-icons/logo-white/instagram-logo-white.png" alt="Instagram" width="32" height="32" style="display:block" class="o-soc"><![endif]--><!--[if !mso]><!--><img src="https://enfoilk.stripocdn.email/content/assets/img/social-icons/logo-white/instagram-logo-white.png" alt="Instagram" width="32" height="32" style="display:block"><!--<![endif]--></a></td>
<td style="padding:0 10px"><a href="{{DYNAMIC_FACEBOOK_URL}}"><!--[if mso]><img src="https://enfoilk.stripocdn.email/content/assets/img/social-icons/logo-white/facebook-logo-white.png" alt="Facebook" width="32" height="32" style="display:block" class="o-soc"><![endif]--><!--[if !mso]><!--><img src="https://enfoilk.stripocdn.email/content/assets/img/social-icons/logo-white/facebook-logo-white.png" alt="Facebook" width="32" height="32" style="display:block"><!--<![endif]--></a></td>
</tr>
</table>
</td></tr>
<tr><td>
<!--[if mso]><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"><tr>
<td width="275" valign="top" style="font-family:Arial,sans-serif;font-size:12px;line-height:1.3;color:#fff;padding-right:15px">
<p style="margin:0 0 10px 0;text-align:center"><strong>Showroom Hours:</strong></p>
<p style="margin:0 0 5px 0;text-align:center;line-height:1.3">{{DYNAMIC_SHOWROOM_HOURS}}</p></td>
<td width="275" valign="top" style="font-family:Arial,sans-serif;font-size:12px;line-height:1.3;color:#fff;padding-left:15px;border-left:1px solid #333">
<p style="margin:0 0 10px 0;text-align:center"><strong>Service Hours:</strong></p>
<p style="margin:0 0 5px 0;text-align:center;line-height:1.3">{{DYNAMIC_SERVICE_HOURS}}</p></td>
</tr></table><![endif]-->
<!--[if !mso]><!--><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"><tr>
<td width="50%" valign="top" style="font-family:Arial,sans-serif;font-size:12px;line-height:1.3;color:#fff;padding-right:15px" class="f-hrs">
<p style="margin:0 0 10px 0;text-align:center"><strong>Showroom Hours:</strong></p>
<p style="margin:0 0 5px 0;text-align:center;line-height:1.3">{{DYNAMIC_SHOWROOM_HOURS}}</p></td>
<td width="50%" valign="top" style="font-family:Arial,sans-serif;font-size:12px;line-height:1.3;color:#fff;padding-left:15px;border-left:1px solid #333" class="f-hrs">
<p style="margin:0 0 10px 0;text-align:center"><strong>Service Hours:</strong></p>
<p style="margin:0 0 5px 0;text-align:center;line-height:1.3">{{DYNAMIC_SERVICE_HOURS}}</p></td>
</tr></table><!--<![endif]-->
</td></tr>
<tr><td align="center" style="padding-top:20px">
<p style="margin:0 0 5px 0;font-family:Arial,sans-serif;font-size:16px;color:#fff;font-weight:bold">{{DYNAMIC_DEALERSHIP_NAME}}</p>
<p style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:#fff">{{DYNAMIC_ADDRESS}}</p>
</td></tr>
<tr><td align="center" style="padding-top:10px">
<p style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:#fff">
<a href="tel:{{DYNAMIC_PHONE_HREF}}" style="color:#fff;text-decoration:none"><strong>{{DYNAMIC_PHONE_DISPLAY}}</strong></a>
</p>
</td></tr>
</table>
</td></tr>
{% if campaign.name == "New_Specials_Journey" or campaign.name == "Sales Specials Journey" %}
<tr><td align="center" style="background-color:#000;padding:10px 20px;font-family:Arial,sans-serif;font-size:10px;line-height:1.5;color:#fff" class="m-pad">
{% assign vehicles_json = customer["Sales-Specs-Recs"] %}
{% assign disclaimers = "" %}
{% if customer["Sales-Specs-Recs"][0].Hero_Disclaimer != blank and customer["Sales-Specs-Recs"][0].Hero_Disclaimer != nil %}
{% assign hero_disclaimer = customer["Sales-Specs-Recs"][0].Hero_Disclaimer %}
{% else %}
{% assign hero_disclaimer = "" %}
{% endif %}
{% for vehicle in vehicles_json %}
{% capture disclaimer_sentence %}<br>{{ vehicle.disclaimer_1 | default: "All vehicles are subject to prior sale and may not be available at the time of inquiry. Pricing does not include applicable taxes, title, licensing, or other fees unless explicitly stated. We strive for accuracy in our listings; however, it is the buyer's responsibility to verify all critical information, including vehicle specifications and availability, before purchase. Financing is subject to credit approval. Please contact our dealership for complete details and terms." }}<br>{% endcapture %}
{% assign disclaimers = disclaimers | append: disclaimer_sentence | append: " " %}
{% endfor %}
<p style="margin:0;text-align:justify;line-height:150%;color:#fff">
{% if hero_disclaimer != "" %}{{ hero_disclaimer }} {% endif %}<br>{{ disclaimers | newline_to_br }}</p>
</td></tr>
{% endif %}
{% if campaign.name == "Preowned_Specials_Journey" or campaign.name == "Preowned Specials Journey" %}
<tr><td align="center" style="background-color:#000;padding:10px 20px;font-family:Arial,sans-serif;font-size:10px;line-height:1.5;color:#fff" class="m-pad">
{% assign vehicles_json = customer["Pre-Owned-Specs-Recs"] %}
{% assign disclaimers = "" %}
{% if customer["Pre-Owned-Specs-Recs"][0].Hero_Disclaimer != blank and customer["Pre-Owned-Specs-Recs"][0].Hero_Disclaimer != nil %}
{% assign hero_disclaimer = customer["Pre-Owned-Specs-Recs"][0].Hero_Disclaimer %}
{% else %}
{% assign hero_disclaimer = "" %}
{% endif %}
{% for vehicle in vehicles_json %}
{% capture disclaimer_sentence %}<br>{{ vehicle.disclaimer_1 | default: "All vehicles are subject to prior sale and may not be available at the time of inquiry. Pricing does not include applicable taxes, title, licensing, or other fees unless explicitly stated. We strive for accuracy in our listings; however, it is the buyer's responsibility to verify all critical information, including vehicle specifications and availability, before purchase. Financing is subject to credit approval. Please contact our dealership for complete details and terms." }}<br>{% endcapture %}
{% assign disclaimers = disclaimers | append: disclaimer_sentence | append: " " %}
{% endfor %}
<p style="margin:0;text-align:justify;line-height:150%;color:#fff">
{% if hero_disclaimer != "" %}{{ hero_disclaimer }} {% endif %}<br>{{ disclaimers | newline_to_br }}</p>
</td></tr>
{% endif %}
{% if campaign.name contains "Pre_Owned" or campaign.name contains "Pre-Owned" or campaign.subtype == "pre_owned" or campaign.subtype == "pre-owned" %}
<tr><td align="center" style="background-color:#000;padding:10px 20px;font-family:Arial,sans-serif;font-size:10px;line-height:1.5;color:#fff" class="m-pad">
<p style="margin:0;text-align:justify;line-height:150%;color:#fff">All vehicles are one of each and subject to prior sale. All Pre-Owned or Certified vehicles are used. All offers expire at the close of business on the day the offer is removed from the website, and all financing is subject to credit approval. Prices exclude taxes, title, registration, tags, labor and installation charges, insurance, optional equipment, products, packages and services. Although we attempt to include the cost of all options preinstalled by the dealer in the listed price, some options may have been added that are not reflected in the sales price on the website. While great effort is made to ensure the accuracy of the information on the website, errors do occur so please verify information with one of our dealership representatives. Options, model availability and actual dealer price may vary. See dealer for details, costs and terms. Dealer sets final price.</p>
</td></tr>
{% endif %}
<tr><td align="center" style="background-color:#000;padding:20px;font-family:Arial,sans-serif;font-size:10px;color:#fff" class="m-pad">
Copyright © 2025 {{DYNAMIC_DEALERSHIP_NAME}}, All rights reserved.
</td></tr>
</table>
<!--[if mso]></table><![endif]-->
</div>`;
}